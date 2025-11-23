/**
 * Master Data Management
 * Handles Accounts, Customers, Suppliers, and Products
 */

// ==================== ACCOUNTS ====================

/**
 * Get all accounts
 */
function getAccounts(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.ACCOUNTS);
    const data = sheet.getDataRange().getValues();
    const accounts = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Apply filters if provided
      if (filter) {
        if (filter.accountType && row[2] !== filter.accountType) continue;
        if (filter.category && row[3] !== filter.category) continue;
        if (filter.status && row[6] !== filter.status) continue;
      }

      accounts.push({
        accountCode: row[0],
        accountName: row[1],
        accountType: row[2],
        category: row[3],
        parentAccount: row[4],
        description: row[5],
        status: row[6],
        createdDate: row[7]
      });
    }

    return {
      success: true,
      data: accounts
    };
  } catch (error) {
    Logger.log('Error getting accounts: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Check if account exists
 */
function accountExists(accountCode) {
  try {
    const sheet = getSheet(SHEETS.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === accountCode) {
        return true;
      }
    }
    return false;
  } catch (error) {
    Logger.log('Error checking account: ' + error.toString());
    return false;
  }
}

/**
 * Create new account
 */
function createAccount(accountData) {
  try {
    requireAdmin(); // Only admin can create accounts

    // Sanitize input
    accountData = sanitizeObject(accountData);

    // Validate account code format
    if (!validateAccountCode(accountData.accountCode)) {
      return {
        success: false,
        message: 'Format kode akun tidak valid (gunakan format: X-XXXX)'
      };
    }

    // Check for duplicate
    if (checkDuplicate(SHEETS.ACCOUNTS, 0, accountData.accountCode)) {
      return {
        success: false,
        message: 'Kode akun sudah ada'
      };
    }

    const sheet = getSheet(SHEETS.ACCOUNTS);

    sheet.appendRow([
      accountData.accountCode,
      accountData.accountName,
      accountData.accountType,
      accountData.category,
      accountData.parentAccount || '',
      accountData.description || '',
      'Active',
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Account', accountData.accountCode, accountData);

    return {
      success: true,
      message: 'Akun berhasil ditambahkan'
    };
  } catch (error) {
    Logger.log('Error creating account: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update account
 */
function updateAccount(accountCode, accountData) {
  try {
    requireAdmin();

    accountData = sanitizeObject(accountData);

    const sheet = getSheet(SHEETS.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === accountCode) {
        sheet.getRange(i + 1, 2).setValue(accountData.accountName);
        sheet.getRange(i + 1, 3).setValue(accountData.accountType);
        sheet.getRange(i + 1, 4).setValue(accountData.category);
        sheet.getRange(i + 1, 5).setValue(accountData.parentAccount || '');
        sheet.getRange(i + 1, 6).setValue(accountData.description || '');

        logAudit('UPDATE', 'Account', accountCode, accountData);

        return {
          success: true,
          message: 'Akun berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'Akun tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating account: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ==================== CUSTOMERS ====================

/**
 * Get all customers
 */
function getCustomers(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.CUSTOMERS);
    const data = sheet.getDataRange().getValues();
    const customers = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter && filter.status && row[9] !== filter.status) continue;

      customers.push({
        customerId: row[0],
        customerName: row[1],
        contactPerson: row[2],
        phone: row[3],
        email: row[4],
        address: row[5],
        city: row[6],
        taxId: row[7],
        creditLimit: row[8],
        status: row[9],
        createdDate: row[10]
      });
    }

    return {
      success: true,
      data: customers
    };
  } catch (error) {
    Logger.log('Error getting customers: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create customer
 */
function createCustomer(customerData) {
  try {
    requireAuth();

    customerData = sanitizeObject(customerData);

    // Validate data
    const validation = validatePartnerData(customerData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.CUSTOMERS);
    const customerId = generateId('CUST');

    sheet.appendRow([
      customerId,
      customerData.name,
      customerData.contactPerson || '',
      customerData.phone || '',
      customerData.email || '',
      customerData.address || '',
      customerData.city || '',
      customerData.taxId || '',
      parseFloat(customerData.creditLimit || 0),
      'Active',
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Customer', customerId, customerData);

    return {
      success: true,
      message: 'Pelanggan berhasil ditambahkan',
      customerId: customerId
    };
  } catch (error) {
    Logger.log('Error creating customer: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update customer
 */
function updateCustomer(customerId, customerData) {
  try {
    requireAuth();

    customerData = sanitizeObject(customerData);

    const validation = validatePartnerData(customerData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.CUSTOMERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        sheet.getRange(i + 1, 2).setValue(customerData.name);
        sheet.getRange(i + 1, 3).setValue(customerData.contactPerson || '');
        sheet.getRange(i + 1, 4).setValue(customerData.phone || '');
        sheet.getRange(i + 1, 5).setValue(customerData.email || '');
        sheet.getRange(i + 1, 6).setValue(customerData.address || '');
        sheet.getRange(i + 1, 7).setValue(customerData.city || '');
        sheet.getRange(i + 1, 8).setValue(customerData.taxId || '');
        sheet.getRange(i + 1, 9).setValue(parseFloat(customerData.creditLimit || 0));

        logAudit('UPDATE', 'Customer', customerId, customerData);

        return {
          success: true,
          message: 'Pelanggan berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'Pelanggan tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating customer: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ==================== SUPPLIERS ====================

/**
 * Get all suppliers
 */
function getSuppliers(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.SUPPLIERS);
    const data = sheet.getDataRange().getValues();
    const suppliers = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter && filter.status && row[9] !== filter.status) continue;

      suppliers.push({
        supplierId: row[0],
        supplierName: row[1],
        contactPerson: row[2],
        phone: row[3],
        email: row[4],
        address: row[5],
        city: row[6],
        taxId: row[7],
        paymentTerms: row[8],
        status: row[9],
        createdDate: row[10]
      });
    }

    return {
      success: true,
      data: suppliers
    };
  } catch (error) {
    Logger.log('Error getting suppliers: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create supplier
 */
function createSupplier(supplierData) {
  try {
    requireAuth();

    supplierData = sanitizeObject(supplierData);

    const validation = validatePartnerData(supplierData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.SUPPLIERS);
    const supplierId = generateId('SUPP');

    sheet.appendRow([
      supplierId,
      supplierData.name,
      supplierData.contactPerson || '',
      supplierData.phone || '',
      supplierData.email || '',
      supplierData.address || '',
      supplierData.city || '',
      supplierData.taxId || '',
      supplierData.paymentTerms || '',
      'Active',
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Supplier', supplierId, supplierData);

    return {
      success: true,
      message: 'Pemasok berhasil ditambahkan',
      supplierId: supplierId
    };
  } catch (error) {
    Logger.log('Error creating supplier: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update supplier
 */
function updateSupplier(supplierId, supplierData) {
  try {
    requireAuth();

    supplierData = sanitizeObject(supplierData);

    const validation = validatePartnerData(supplierData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.SUPPLIERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === supplierId) {
        sheet.getRange(i + 1, 2).setValue(supplierData.name);
        sheet.getRange(i + 1, 3).setValue(supplierData.contactPerson || '');
        sheet.getRange(i + 1, 4).setValue(supplierData.phone || '');
        sheet.getRange(i + 1, 5).setValue(supplierData.email || '');
        sheet.getRange(i + 1, 6).setValue(supplierData.address || '');
        sheet.getRange(i + 1, 7).setValue(supplierData.city || '');
        sheet.getRange(i + 1, 8).setValue(supplierData.taxId || '');
        sheet.getRange(i + 1, 9).setValue(supplierData.paymentTerms || '');

        logAudit('UPDATE', 'Supplier', supplierId, supplierData);

        return {
          success: true,
          message: 'Pemasok berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'Pemasok tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating supplier: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ==================== PRODUCTS ====================

/**
 * Get all products
 */
function getProducts(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    const products = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter) {
        if (filter.category && row[3] !== filter.category) continue;
        if (filter.status && row[10] !== filter.status) continue;
      }

      products.push({
        productId: row[0],
        productCode: row[1],
        productName: row[2],
        category: row[3],
        unit: row[4],
        purchasePrice: row[5],
        sellingPrice: row[6],
        stock: row[7],
        minStock: row[8],
        description: row[9],
        status: row[10],
        createdDate: row[11]
      });
    }

    return {
      success: true,
      data: products
    };
  } catch (error) {
    Logger.log('Error getting products: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create product
 */
function createProduct(productData) {
  try {
    requireAuth();

    productData = sanitizeObject(productData);

    const validation = validateProductData(productData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    // Check for duplicate product code
    if (checkDuplicate(SHEETS.PRODUCTS, 1, productData.productCode)) {
      return {
        success: false,
        message: 'Kode produk sudah ada'
      };
    }

    const sheet = getSheet(SHEETS.PRODUCTS);
    const productId = generateId('PROD');

    sheet.appendRow([
      productId,
      productData.productCode,
      productData.productName,
      productData.category || '',
      productData.unit || 'pcs',
      parseFloat(productData.purchasePrice || 0),
      parseFloat(productData.sellingPrice || 0),
      parseFloat(productData.stock || 0),
      parseFloat(productData.minStock || 0),
      productData.description || '',
      'Active',
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Product', productId, productData);

    return {
      success: true,
      message: 'Produk berhasil ditambahkan',
      productId: productId
    };
  } catch (error) {
    Logger.log('Error creating product: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update product
 */
function updateProduct(productId, productData) {
  try {
    requireAuth();

    productData = sanitizeObject(productData);

    const validation = validateProductData(productData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === productId) {
        sheet.getRange(i + 1, 2).setValue(productData.productCode);
        sheet.getRange(i + 1, 3).setValue(productData.productName);
        sheet.getRange(i + 1, 4).setValue(productData.category || '');
        sheet.getRange(i + 1, 5).setValue(productData.unit || 'pcs');
        sheet.getRange(i + 1, 6).setValue(parseFloat(productData.purchasePrice || 0));
        sheet.getRange(i + 1, 7).setValue(parseFloat(productData.sellingPrice || 0));
        sheet.getRange(i + 1, 9).setValue(parseFloat(productData.minStock || 0));
        sheet.getRange(i + 1, 10).setValue(productData.description || '');

        logAudit('UPDATE', 'Product', productId, productData);

        return {
          success: true,
          message: 'Produk berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'Produk tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating product: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get product by ID
 */
function getProductById(productId) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === productId) {
        return {
          success: true,
          data: {
            productId: data[i][0],
            productCode: data[i][1],
            productName: data[i][2],
            category: data[i][3],
            unit: data[i][4],
            purchasePrice: data[i][5],
            sellingPrice: data[i][6],
            stock: data[i][7],
            minStock: data[i][8],
            description: data[i][9],
            status: data[i][10],
            createdDate: data[i][11]
          }
        };
      }
    }

    return {
      success: false,
      message: 'Produk tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error getting product: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update product stock
 */
function updateProductStock(productId, quantity, type) {
  try {
    const sheet = getSheet(SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === productId) {
        const currentStock = parseFloat(data[i][7]);
        let newStock;

        if (type === 'add') {
          newStock = currentStock + quantity;
        } else if (type === 'reduce') {
          newStock = currentStock - quantity;
          if (newStock < 0) {
            return {
              success: false,
              message: 'Stok tidak mencukupi'
            };
          }
        } else {
          newStock = quantity;
        }

        sheet.getRange(i + 1, 8).setValue(newStock);

        return {
          success: true,
          message: 'Stok berhasil diupdate',
          newStock: newStock
        };
      }
    }

    return {
      success: false,
      message: 'Produk tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating product stock: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get low stock products
 */
function getLowStockProducts() {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.PRODUCTS);
    const data = sheet.getDataRange().getValues();
    const lowStockProducts = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const stock = parseFloat(row[7]);
      const minStock = parseFloat(row[8]);

      if (stock <= minStock && row[10] === 'Active') {
        lowStockProducts.push({
          productId: row[0],
          productCode: row[1],
          productName: row[2],
          currentStock: stock,
          minStock: minStock,
          shortage: minStock - stock
        });
      }
    }

    return {
      success: true,
      data: lowStockProducts
    };
  } catch (error) {
    Logger.log('Error getting low stock products: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

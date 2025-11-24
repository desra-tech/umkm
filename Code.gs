/**
 * UMKM Accounting System - Google Apps Script Backend
 * Sistem Pembukuan Keuangan UMKM
 *
 * Security Features:
 * - Session-based authentication
 * - Role-based access control (Admin/User)
 * - Input validation & sanitization
 * - Protected script properties
 */

// ============================================================================
// CONFIGURATION & INITIALIZATION
// ============================================================================

const CONFIG = {
  SHEET_NAMES: {
    USERS: 'Users',
    ACCOUNTS: 'Accounts',
    CUSTOMERS: 'Customers',
    SUPPLIERS: 'Suppliers',
    PRODUCTS: 'Products',
    TRANSACTIONS: 'Transactions',
    INVENTORY: 'Inventory',
    AR: 'AccountReceivable',
    AP: 'AccountPayable',
    POS: 'POS_Transactions'
  },
  ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },
  TRANSACTION_TYPES: {
    RECEIPT: 'Penerimaan',
    PAYMENT: 'Pengeluaran',
    CAPITAL: 'Modal'
  }
};

/**
 * Initialize spreadsheet structure on first run
 */
function initializeSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create all required sheets
  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.USERS, [
    'UserID', 'Username', 'Password', 'FullName', 'Role', 'Active', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.ACCOUNTS, [
    'AccountCode', 'AccountName', 'AccountType', 'Category', 'ParentAccount', 'Balance', 'Active'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.CUSTOMERS, [
    'CustomerID', 'CustomerName', 'Address', 'Phone', 'Email', 'Active', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.SUPPLIERS, [
    'SupplierID', 'SupplierName', 'Address', 'Phone', 'Email', 'Active', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.PRODUCTS, [
    'ProductID', 'ProductCode', 'ProductName', 'Category', 'Unit', 'PurchasePrice', 'SellingPrice', 'Stock', 'MinStock', 'Active'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.TRANSACTIONS, [
    'TransactionID', 'TransactionDate', 'TransactionType', 'AccountCode', 'Description', 'Amount', 'ReferenceNo', 'CustomerID', 'SupplierID', 'UserID', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.INVENTORY, [
    'InventoryID', 'TransactionDate', 'ProductID', 'TransactionType', 'Quantity', 'UnitPrice', 'TotalPrice', 'ReferenceNo', 'Notes', 'UserID', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.AR, [
    'ARID', 'InvoiceNo', 'InvoiceDate', 'CustomerID', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'Status', 'Notes', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.AP, [
    'APID', 'InvoiceNo', 'InvoiceDate', 'SupplierID', 'TotalAmount', 'PaidAmount', 'RemainingAmount', 'DueDate', 'Status', 'Notes', 'CreatedDate'
  ]);

  createSheetIfNotExists(ss, CONFIG.SHEET_NAMES.POS, [
    'POSID', 'TransactionDate', 'InvoiceNo', 'CustomerID', 'Items', 'Subtotal', 'Tax', 'Discount', 'Total', 'PaymentMethod', 'UserID', 'CreatedDate'
  ]);

  // Initialize default data
  initializeDefaultData();

  return 'Spreadsheet initialized successfully!';
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#4285f4').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

// ============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('UMKM Accounting System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Login user with username and password
 * Security: Password should be hashed in production
 */
function loginUser(username, password) {
  try {
    // Input validation
    if (!username || !password) {
      return { success: false, message: 'Username dan password harus diisi' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();

    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[1] === username && row[2] === password && row[5] === true) {
        // Create session
        const session = {
          userId: row[0],
          username: row[1],
          fullName: row[3],
          role: row[4],
          loginTime: new Date().toISOString()
        };

        // Store in script properties (temporary session)
        PropertiesService.getUserProperties().setProperty('session', JSON.stringify(session));

        return {
          success: true,
          message: 'Login berhasil',
          user: {
            userId: session.userId,
            username: session.username,
            fullName: session.fullName,
            role: session.role
          }
        };
      }
    }

    return { success: false, message: 'Username atau password salah' };
  } catch (error) {
    Logger.log('Login error: ' + error.message);
    return { success: false, message: 'Terjadi kesalahan saat login' };
  }
}

/**
 * Get current session
 */
function getCurrentSession() {
  try {
    const sessionStr = PropertiesService.getUserProperties().getProperty('session');
    if (!sessionStr) {
      return { success: false, message: 'Session tidak ditemukan' };
    }

    const session = JSON.parse(sessionStr);
    return {
      success: true,
      user: {
        userId: session.userId,
        username: session.username,
        fullName: session.fullName,
        role: session.role
      }
    };
  } catch (error) {
    return { success: false, message: 'Session tidak valid' };
  }
}

/**
 * Logout user
 */
function logoutUser() {
  PropertiesService.getUserProperties().deleteProperty('session');
  return { success: true, message: 'Logout berhasil' };
}

/**
 * Check if user has access to feature based on role
 */
function checkAccess(requiredRole) {
  const session = getCurrentSession();
  if (!session.success) {
    return false;
  }

  const userRole = session.user.role;

  // Admin has access to everything
  if (userRole === CONFIG.ROLES.ADMIN) {
    return true;
  }

  // User has limited access
  if (userRole === CONFIG.ROLES.USER) {
    const allowedForUser = ['transactions', 'reports', 'pos', 'inventory', 'ar', 'ap'];
    return allowedForUser.includes(requiredRole);
  }

  return false;
}

// ============================================================================
// MASTER DATA - ACCOUNTS (CHART OF ACCOUNTS)
// ============================================================================

function getAccounts() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    const accounts = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) { // Check if AccountCode exists
        accounts.push({
          accountCode: data[i][0],
          accountName: data[i][1],
          accountType: data[i][2],
          category: data[i][3],
          parentAccount: data[i][4],
          balance: data[i][5] || 0,
          active: data[i][6]
        });
      }
    }

    return { success: true, data: accounts };
  } catch (error) {
    Logger.log('Get accounts error: ' + error.message);
    return { success: false, message: 'Gagal mengambil data akun' };
  }
}

function saveAccount(account) {
  try {
    // Check access
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak. Hanya admin yang dapat mengelola akun.' };
    }

    // Validate input
    if (!account.accountCode || !account.accountName || !account.accountType) {
      return { success: false, message: 'Kode akun, nama akun, dan tipe akun harus diisi' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    // Check if account code already exists
    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === account.accountCode) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      account.accountCode,
      account.accountName,
      account.accountType,
      account.category || '',
      account.parentAccount || '',
      account.balance || 0,
      account.active !== false
    ];

    if (existingRow > 0) {
      // Update existing
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Akun berhasil diupdate' };
    } else {
      // Add new
      sheet.appendRow(rowData);
      return { success: true, message: 'Akun berhasil ditambahkan' };
    }
  } catch (error) {
    Logger.log('Save account error: ' + error.message);
    return { success: false, message: 'Gagal menyimpan akun' };
  }
}

function deleteAccount(accountCode) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === accountCode) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Akun berhasil dihapus' };
      }
    }

    return { success: false, message: 'Akun tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus akun' };
  }
}

// ============================================================================
// MASTER DATA - CUSTOMERS
// ============================================================================

function getCustomers() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);
    const data = sheet.getDataRange().getValues();

    const customers = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        customers.push({
          customerId: data[i][0],
          customerName: data[i][1],
          address: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          active: data[i][5],
          createdDate: data[i][6]
        });
      }
    }

    return { success: true, data: customers };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data pelanggan' };
  }
}

function saveCustomer(customer) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    if (!customer.customerName) {
      return { success: false, message: 'Nama pelanggan harus diisi' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);
    const data = sheet.getDataRange().getValues();

    if (!customer.customerId) {
      // Generate new ID
      customer.customerId = 'CUST' + (new Date()).getTime();
      customer.createdDate = new Date();
    }

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customer.customerId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      customer.customerId,
      customer.customerName,
      customer.address || '',
      customer.phone || '',
      customer.email || '',
      customer.active !== false,
      customer.createdDate || new Date()
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Pelanggan berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'Pelanggan berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan pelanggan' };
  }
}

function deleteCustomer(customerId) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === customerId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Pelanggan berhasil dihapus' };
      }
    }

    return { success: false, message: 'Pelanggan tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus pelanggan' };
  }
}

// ============================================================================
// MASTER DATA - SUPPLIERS
// ============================================================================

function getSuppliers() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);
    const data = sheet.getDataRange().getValues();

    const suppliers = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        suppliers.push({
          supplierId: data[i][0],
          supplierName: data[i][1],
          address: data[i][2],
          phone: data[i][3],
          email: data[i][4],
          active: data[i][5],
          createdDate: data[i][6]
        });
      }
    }

    return { success: true, data: suppliers };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data pemasok' };
  }
}

function saveSupplier(supplier) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    if (!supplier.supplierName) {
      return { success: false, message: 'Nama pemasok harus diisi' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);
    const data = sheet.getDataRange().getValues();

    if (!supplier.supplierId) {
      supplier.supplierId = 'SUPP' + (new Date()).getTime();
      supplier.createdDate = new Date();
    }

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === supplier.supplierId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      supplier.supplierId,
      supplier.supplierName,
      supplier.address || '',
      supplier.phone || '',
      supplier.email || '',
      supplier.active !== false,
      supplier.createdDate || new Date()
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Pemasok berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'Pemasok berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan pemasok' };
  }
}

function deleteSupplier(supplierId) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === supplierId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Pemasok berhasil dihapus' };
      }
    }

    return { success: false, message: 'Pemasok tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus pemasok' };
  }
}

// ============================================================================
// MASTER DATA - PRODUCTS
// ============================================================================

function getProducts() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    const products = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        products.push({
          productId: data[i][0],
          productCode: data[i][1],
          productName: data[i][2],
          category: data[i][3],
          unit: data[i][4],
          purchasePrice: data[i][5],
          sellingPrice: data[i][6],
          stock: data[i][7],
          minStock: data[i][8],
          active: data[i][9]
        });
      }
    }

    return { success: true, data: products };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data produk' };
  }
}

function saveProduct(product) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    if (!product.productCode || !product.productName) {
      return { success: false, message: 'Kode produk dan nama produk harus diisi' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    if (!product.productId) {
      product.productId = 'PROD' + (new Date()).getTime();
    }

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === product.productId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      product.productId,
      product.productCode,
      product.productName,
      product.category || '',
      product.unit || 'pcs',
      parseFloat(product.purchasePrice) || 0,
      parseFloat(product.sellingPrice) || 0,
      parseFloat(product.stock) || 0,
      parseFloat(product.minStock) || 0,
      product.active !== false
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Produk berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'Produk berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan produk' };
  }
}

function deleteProduct(productId) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === productId) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Produk berhasil dihapus' };
      }
    }

    return { success: false, message: 'Produk tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal menghapus produk' };
  }
}

// ============================================================================
// TRANSACTIONS
// ============================================================================

function getTransactions(filter) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const transaction = {
          transactionId: data[i][0],
          transactionDate: data[i][1],
          transactionType: data[i][2],
          accountCode: data[i][3],
          description: data[i][4],
          amount: data[i][5],
          referenceNo: data[i][6],
          customerId: data[i][7],
          supplierId: data[i][8],
          userId: data[i][9],
          createdDate: data[i][10]
        };

        // Apply filter if provided
        if (filter) {
          if (filter.transactionType && transaction.transactionType !== filter.transactionType) continue;
          if (filter.startDate && new Date(transaction.transactionDate) < new Date(filter.startDate)) continue;
          if (filter.endDate && new Date(transaction.transactionDate) > new Date(filter.endDate)) continue;
        }

        transactions.push(transaction);
      }
    }

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data transaksi' };
  }
}

function saveTransaction(transaction) {
  try {
    // Validate required fields
    if (!transaction.transactionDate || !transaction.transactionType || !transaction.accountCode || !transaction.amount) {
      return { success: false, message: 'Data transaksi tidak lengkap' };
    }

    const session = getCurrentSession();
    if (!session.success) {
      return { success: false, message: 'Session tidak valid' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);

    if (!transaction.transactionId) {
      transaction.transactionId = 'TRX' + (new Date()).getTime();
      transaction.createdDate = new Date();
      transaction.userId = session.user.userId;
    }

    const rowData = [
      transaction.transactionId,
      new Date(transaction.transactionDate),
      transaction.transactionType,
      transaction.accountCode,
      transaction.description || '',
      parseFloat(transaction.amount),
      transaction.referenceNo || '',
      transaction.customerId || '',
      transaction.supplierId || '',
      transaction.userId,
      transaction.createdDate || new Date()
    ];

    sheet.appendRow(rowData);

    // Update account balance
    updateAccountBalance(transaction.accountCode, parseFloat(transaction.amount), transaction.transactionType);

    return { success: true, message: 'Transaksi berhasil disimpan', transactionId: transaction.transactionId };
  } catch (error) {
    Logger.log('Save transaction error: ' + error.message);
    return { success: false, message: 'Gagal menyimpan transaksi' };
  }
}

function updateAccountBalance(accountCode, amount, transactionType) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === accountCode) {
        let currentBalance = parseFloat(data[i][5]) || 0;

        // Debit increases assets and expenses, decreases liabilities and equity
        // Credit decreases assets and expenses, increases liabilities and equity
        const accountType = data[i][2];

        if (transactionType === CONFIG.TRANSACTION_TYPES.RECEIPT) {
          currentBalance += amount;
        } else if (transactionType === CONFIG.TRANSACTION_TYPES.PAYMENT) {
          currentBalance -= amount;
        } else if (transactionType === CONFIG.TRANSACTION_TYPES.CAPITAL) {
          currentBalance += amount;
        }

        sheet.getRange(i + 1, 6).setValue(currentBalance);
        break;
      }
    }
  } catch (error) {
    Logger.log('Update account balance error: ' + error.message);
  }
}

// ============================================================================
// INVENTORY MANAGEMENT
// ============================================================================

function getInventoryTransactions(productId) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.INVENTORY);
    const data = sheet.getDataRange().getValues();

    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const transaction = {
          inventoryId: data[i][0],
          transactionDate: data[i][1],
          productId: data[i][2],
          transactionType: data[i][3],
          quantity: data[i][4],
          unitPrice: data[i][5],
          totalPrice: data[i][6],
          referenceNo: data[i][7],
          notes: data[i][8],
          userId: data[i][9],
          createdDate: data[i][10]
        };

        if (!productId || transaction.productId === productId) {
          transactions.push(transaction);
        }
      }
    }

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data inventory' };
  }
}

function saveInventoryTransaction(transaction) {
  try {
    if (!transaction.productId || !transaction.transactionType || !transaction.quantity) {
      return { success: false, message: 'Data inventory tidak lengkap' };
    }

    const session = getCurrentSession();
    if (!session.success) {
      return { success: false, message: 'Session tidak valid' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.INVENTORY);

    if (!transaction.inventoryId) {
      transaction.inventoryId = 'INV' + (new Date()).getTime();
      transaction.createdDate = new Date();
      transaction.userId = session.user.userId;
    }

    const quantity = parseFloat(transaction.quantity);
    const unitPrice = parseFloat(transaction.unitPrice) || 0;
    const totalPrice = quantity * unitPrice;

    const rowData = [
      transaction.inventoryId,
      new Date(transaction.transactionDate || new Date()),
      transaction.productId,
      transaction.transactionType,
      quantity,
      unitPrice,
      totalPrice,
      transaction.referenceNo || '',
      transaction.notes || '',
      transaction.userId,
      transaction.createdDate
    ];

    sheet.appendRow(rowData);

    // Update product stock
    updateProductStock(transaction.productId, quantity, transaction.transactionType);

    return { success: true, message: 'Transaksi inventory berhasil disimpan' };
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan transaksi inventory' };
  }
}

function updateProductStock(productId, quantity, transactionType) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === productId) {
        let currentStock = parseFloat(data[i][7]) || 0;

        if (transactionType === 'Masuk' || transactionType === 'IN') {
          currentStock += quantity;
        } else if (transactionType === 'Keluar' || transactionType === 'OUT') {
          currentStock -= quantity;
        }

        sheet.getRange(i + 1, 8).setValue(currentStock);
        break;
      }
    }
  } catch (error) {
    Logger.log('Update product stock error: ' + error.message);
  }
}

// ============================================================================
// ACCOUNT RECEIVABLE (PIUTANG)
// ============================================================================

function getAccountReceivables(status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AR);
    const data = sheet.getDataRange().getValues();

    const receivables = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const ar = {
          arId: data[i][0],
          invoiceNo: data[i][1],
          invoiceDate: data[i][2],
          customerId: data[i][3],
          totalAmount: data[i][4],
          paidAmount: data[i][5],
          remainingAmount: data[i][6],
          dueDate: data[i][7],
          status: data[i][8],
          notes: data[i][9],
          createdDate: data[i][10]
        };

        if (!status || ar.status === status) {
          receivables.push(ar);
        }
      }
    }

    return { success: true, data: receivables };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data piutang' };
  }
}

function saveAccountReceivable(ar) {
  try {
    if (!ar.invoiceNo || !ar.customerId || !ar.totalAmount) {
      return { success: false, message: 'Data piutang tidak lengkap' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AR);
    const data = sheet.getDataRange().getValues();

    if (!ar.arId) {
      ar.arId = 'AR' + (new Date()).getTime();
      ar.createdDate = new Date();
    }

    const totalAmount = parseFloat(ar.totalAmount);
    const paidAmount = parseFloat(ar.paidAmount) || 0;
    const remainingAmount = totalAmount - paidAmount;
    const status = remainingAmount <= 0 ? 'Lunas' : (paidAmount > 0 ? 'Cicilan' : 'Belum Bayar');

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ar.arId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      ar.arId,
      ar.invoiceNo,
      new Date(ar.invoiceDate || new Date()),
      ar.customerId,
      totalAmount,
      paidAmount,
      remainingAmount,
      new Date(ar.dueDate || new Date()),
      status,
      ar.notes || '',
      ar.createdDate
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Piutang berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'Piutang berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan piutang' };
  }
}

function payAccountReceivable(arId, paymentAmount, paymentDate) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AR);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === arId) {
        const currentPaid = parseFloat(data[i][5]) || 0;
        const newPaid = currentPaid + parseFloat(paymentAmount);
        const totalAmount = parseFloat(data[i][4]);
        const remaining = totalAmount - newPaid;
        const status = remaining <= 0 ? 'Lunas' : (newPaid > 0 ? 'Cicilan' : 'Belum Bayar');

        sheet.getRange(i + 1, 6).setValue(newPaid);
        sheet.getRange(i + 1, 7).setValue(remaining);
        sheet.getRange(i + 1, 9).setValue(status);

        // Record transaction
        const transaction = {
          transactionDate: paymentDate || new Date(),
          transactionType: CONFIG.TRANSACTION_TYPES.RECEIPT,
          accountCode: '1-1001', // Kas
          description: 'Pembayaran Piutang ' + data[i][1],
          amount: paymentAmount,
          referenceNo: arId,
          customerId: data[i][3]
        };

        saveTransaction(transaction);

        return { success: true, message: 'Pembayaran piutang berhasil dicatat' };
      }
    }

    return { success: false, message: 'Piutang tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal mencatat pembayaran' };
  }
}

// ============================================================================
// ACCOUNT PAYABLE (UTANG)
// ============================================================================

function getAccountPayables(status) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AP);
    const data = sheet.getDataRange().getValues();

    const payables = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const ap = {
          apId: data[i][0],
          invoiceNo: data[i][1],
          invoiceDate: data[i][2],
          supplierId: data[i][3],
          totalAmount: data[i][4],
          paidAmount: data[i][5],
          remainingAmount: data[i][6],
          dueDate: data[i][7],
          status: data[i][8],
          notes: data[i][9],
          createdDate: data[i][10]
        };

        if (!status || ap.status === status) {
          payables.push(ap);
        }
      }
    }

    return { success: true, data: payables };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data utang' };
  }
}

function saveAccountPayable(ap) {
  try {
    if (!ap.invoiceNo || !ap.supplierId || !ap.totalAmount) {
      return { success: false, message: 'Data utang tidak lengkap' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AP);
    const data = sheet.getDataRange().getValues();

    if (!ap.apId) {
      ap.apId = 'AP' + (new Date()).getTime();
      ap.createdDate = new Date();
    }

    const totalAmount = parseFloat(ap.totalAmount);
    const paidAmount = parseFloat(ap.paidAmount) || 0;
    const remainingAmount = totalAmount - paidAmount;
    const status = remainingAmount <= 0 ? 'Lunas' : (paidAmount > 0 ? 'Cicilan' : 'Belum Bayar');

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === ap.apId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      ap.apId,
      ap.invoiceNo,
      new Date(ap.invoiceDate || new Date()),
      ap.supplierId,
      totalAmount,
      paidAmount,
      remainingAmount,
      new Date(ap.dueDate || new Date()),
      status,
      ap.notes || '',
      ap.createdDate
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'Utang berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'Utang berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan utang' };
  }
}

function payAccountPayable(apId, paymentAmount, paymentDate) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.AP);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === apId) {
        const currentPaid = parseFloat(data[i][5]) || 0;
        const newPaid = currentPaid + parseFloat(paymentAmount);
        const totalAmount = parseFloat(data[i][4]);
        const remaining = totalAmount - newPaid;
        const status = remaining <= 0 ? 'Lunas' : (newPaid > 0 ? 'Cicilan' : 'Belum Bayar');

        sheet.getRange(i + 1, 6).setValue(newPaid);
        sheet.getRange(i + 1, 7).setValue(remaining);
        sheet.getRange(i + 1, 9).setValue(status);

        // Record transaction
        const transaction = {
          transactionDate: paymentDate || new Date(),
          transactionType: CONFIG.TRANSACTION_TYPES.PAYMENT,
          accountCode: '1-1001', // Kas
          description: 'Pembayaran Utang ' + data[i][1],
          amount: paymentAmount,
          referenceNo: apId,
          supplierId: data[i][3]
        };

        saveTransaction(transaction);

        return { success: true, message: 'Pembayaran utang berhasil dicatat' };
      }
    }

    return { success: false, message: 'Utang tidak ditemukan' };
  } catch (error) {
    return { success: false, message: 'Gagal mencatat pembayaran' };
  }
}

// ============================================================================
// POS (POINT OF SALE)
// ============================================================================

function savePOSTransaction(posData) {
  try {
    if (!posData.items || posData.items.length === 0) {
      return { success: false, message: 'Tidak ada item dalam transaksi' };
    }

    const session = getCurrentSession();
    if (!session.success) {
      return { success: false, message: 'Session tidak valid' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.POS);

    const posId = 'POS' + (new Date()).getTime();
    const invoiceNo = 'INV' + posId;
    const createdDate = new Date();

    const rowData = [
      posId,
      new Date(posData.transactionDate || new Date()),
      invoiceNo,
      posData.customerId || '',
      JSON.stringify(posData.items),
      parseFloat(posData.subtotal),
      parseFloat(posData.tax) || 0,
      parseFloat(posData.discount) || 0,
      parseFloat(posData.total),
      posData.paymentMethod || 'Cash',
      session.user.userId,
      createdDate
    ];

    sheet.appendRow(rowData);

    // Record as transaction
    const transaction = {
      transactionDate: posData.transactionDate || new Date(),
      transactionType: CONFIG.TRANSACTION_TYPES.RECEIPT,
      accountCode: '4-1001', // Pendapatan Penjualan
      description: 'Penjualan ' + invoiceNo,
      amount: parseFloat(posData.total),
      referenceNo: posId,
      customerId: posData.customerId || ''
    };

    saveTransaction(transaction);

    // Update inventory for each item
    for (const item of posData.items) {
      const invTransaction = {
        transactionDate: posData.transactionDate || new Date(),
        productId: item.productId,
        transactionType: 'OUT',
        quantity: item.quantity,
        unitPrice: item.price,
        referenceNo: invoiceNo,
        notes: 'Penjualan via POS'
      };

      saveInventoryTransaction(invTransaction);
    }

    return { success: true, message: 'Transaksi POS berhasil disimpan', invoiceNo: invoiceNo };
  } catch (error) {
    Logger.log('Save POS transaction error: ' + error.message);
    return { success: false, message: 'Gagal menyimpan transaksi POS' };
  }
}

function getPOSTransactions(startDate, endDate) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.POS);
    const data = sheet.getDataRange().getValues();

    const transactions = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        const transaction = {
          posId: data[i][0],
          transactionDate: data[i][1],
          invoiceNo: data[i][2],
          customerId: data[i][3],
          items: JSON.parse(data[i][4] || '[]'),
          subtotal: data[i][5],
          tax: data[i][6],
          discount: data[i][7],
          total: data[i][8],
          paymentMethod: data[i][9],
          userId: data[i][10],
          createdDate: data[i][11]
        };

        if (startDate && new Date(transaction.transactionDate) < new Date(startDate)) continue;
        if (endDate && new Date(transaction.transactionDate) > new Date(endDate)) continue;

        transactions.push(transaction);
      }
    }

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data POS' };
  }
}

// ============================================================================
// REPORTS
// ============================================================================

/**
 * Generate Profit & Loss Statement
 */
function generateProfitLossReport(startDate, endDate) {
  try {
    const transSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    const accSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

    const transData = transSheet.getDataRange().getValues();
    const accData = accSheet.getDataRange().getValues();

    // Create account map
    const accountMap = {};
    for (let i = 1; i < accData.length; i++) {
      accountMap[accData[i][0]] = {
        name: accData[i][1],
        type: accData[i][2],
        category: accData[i][3]
      };
    }

    let totalRevenue = 0;
    let totalExpense = 0;
    const revenueDetails = [];
    const expenseDetails = [];

    // Process transactions
    for (let i = 1; i < transData.length; i++) {
      const transDate = new Date(transData[i][1]);
      if (startDate && transDate < new Date(startDate)) continue;
      if (endDate && transDate > new Date(endDate)) continue;

      const accountCode = transData[i][3];
      const amount = parseFloat(transData[i][5]);
      const account = accountMap[accountCode];

      if (!account) continue;

      // Revenue accounts (4-xxxx)
      if (account.type === 'Revenue' || accountCode.startsWith('4-')) {
        totalRevenue += amount;
        revenueDetails.push({
          accountCode: accountCode,
          accountName: account.name,
          amount: amount
        });
      }
      // Expense accounts (5-xxxx, 6-xxxx)
      else if (account.type === 'Expense' || accountCode.startsWith('5-') || accountCode.startsWith('6-')) {
        totalExpense += amount;
        expenseDetails.push({
          accountCode: accountCode,
          accountName: account.name,
          amount: amount
        });
      }
    }

    const netProfit = totalRevenue - totalExpense;

    return {
      success: true,
      data: {
        period: { startDate: startDate, endDate: endDate },
        revenue: {
          total: totalRevenue,
          details: revenueDetails
        },
        expense: {
          total: totalExpense,
          details: expenseDetails
        },
        netProfit: netProfit
      }
    };
  } catch (error) {
    Logger.log('Generate P&L report error: ' + error.message);
    return { success: false, message: 'Gagal membuat laporan laba rugi' };
  }
}

/**
 * Generate Balance Sheet
 */
function generateBalanceSheet(asOfDate) {
  try {
    const accSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    const accData = accSheet.getDataRange().getValues();

    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const assets = [];
    const liabilities = [];
    const equity = [];

    for (let i = 1; i < accData.length; i++) {
      const accountCode = accData[i][0];
      const accountName = accData[i][1];
      const accountType = accData[i][2];
      const balance = parseFloat(accData[i][5]) || 0;

      if (!accountCode) continue;

      // Assets (1-xxxx)
      if (accountType === 'Asset' || accountCode.startsWith('1-')) {
        totalAssets += balance;
        assets.push({ accountCode, accountName, balance });
      }
      // Liabilities (2-xxxx)
      else if (accountType === 'Liability' || accountCode.startsWith('2-')) {
        totalLiabilities += balance;
        liabilities.push({ accountCode, accountName, balance });
      }
      // Equity (3-xxxx)
      else if (accountType === 'Equity' || accountCode.startsWith('3-')) {
        totalEquity += balance;
        equity.push({ accountCode, accountName, balance });
      }
    }

    return {
      success: true,
      data: {
        asOfDate: asOfDate || new Date(),
        assets: {
          total: totalAssets,
          details: assets
        },
        liabilities: {
          total: totalLiabilities,
          details: liabilities
        },
        equity: {
          total: totalEquity,
          details: equity
        },
        totalLiabilitiesEquity: totalLiabilities + totalEquity
      }
    };
  } catch (error) {
    Logger.log('Generate balance sheet error: ' + error.message);
    return { success: false, message: 'Gagal membuat neraca' };
  }
}

/**
 * Generate Cash Flow Statement
 */
function generateCashFlowReport(startDate, endDate) {
  try {
    const transSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    const transData = transSheet.getDataRange().getValues();

    let operatingCashFlow = 0;
    let investingCashFlow = 0;
    let financingCashFlow = 0;

    const operatingDetails = [];
    const investingDetails = [];
    const financingDetails = [];

    for (let i = 1; i < transData.length; i++) {
      const transDate = new Date(transData[i][1]);
      if (startDate && transDate < new Date(startDate)) continue;
      if (endDate && transDate > new Date(endDate)) continue;

      const transType = transData[i][2];
      const accountCode = transData[i][3];
      const description = transData[i][4];
      const amount = parseFloat(transData[i][5]);

      const item = {
        date: transDate,
        description: description,
        amount: amount
      };

      // Operating activities (revenue and expense accounts)
      if (accountCode.startsWith('4-') || accountCode.startsWith('5-') || accountCode.startsWith('6-')) {
        if (transType === CONFIG.TRANSACTION_TYPES.RECEIPT) {
          operatingCashFlow += amount;
        } else if (transType === CONFIG.TRANSACTION_TYPES.PAYMENT) {
          operatingCashFlow -= amount;
        }
        operatingDetails.push(item);
      }
      // Investing activities (asset purchases, etc)
      else if (accountCode.startsWith('1-') && accountCode !== '1-1001') {
        if (transType === CONFIG.TRANSACTION_TYPES.PAYMENT) {
          investingCashFlow -= amount;
        }
        investingDetails.push(item);
      }
      // Financing activities (capital, loans)
      else if (accountCode.startsWith('2-') || accountCode.startsWith('3-') || transType === CONFIG.TRANSACTION_TYPES.CAPITAL) {
        if (transType === CONFIG.TRANSACTION_TYPES.RECEIPT || transType === CONFIG.TRANSACTION_TYPES.CAPITAL) {
          financingCashFlow += amount;
        } else if (transType === CONFIG.TRANSACTION_TYPES.PAYMENT) {
          financingCashFlow -= amount;
        }
        financingDetails.push(item);
      }
    }

    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    return {
      success: true,
      data: {
        period: { startDate: startDate, endDate: endDate },
        operating: {
          total: operatingCashFlow,
          details: operatingDetails
        },
        investing: {
          total: investingCashFlow,
          details: investingDetails
        },
        financing: {
          total: financingCashFlow,
          details: financingDetails
        },
        netCashFlow: netCashFlow
      }
    };
  } catch (error) {
    Logger.log('Generate cash flow report error: ' + error.message);
    return { success: false, message: 'Gagal membuat laporan arus kas' };
  }
}

// ============================================================================
// INITIALIZE DEFAULT DATA
// ============================================================================

function initializeDefaultData() {
  // Initialize default users
  const userSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.USERS);
  const userData = userSheet.getDataRange().getValues();

  if (userData.length === 1) { // Only header
    userSheet.appendRow(['USER001', 'admin', 'admin123', 'Administrator', CONFIG.ROLES.ADMIN, true, new Date()]);
    userSheet.appendRow(['USER002', 'user', 'user123', 'User Kasir', CONFIG.ROLES.USER, true, new Date()]);
  }

  // Initialize Chart of Accounts
  const accSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
  const accData = accSheet.getDataRange().getValues();

  if (accData.length === 1) { // Only header
    // ASSETS
    accSheet.appendRow(['1-1001', 'Kas', 'Asset', 'Current Asset', '', 0, true]);
    accSheet.appendRow(['1-1002', 'Bank', 'Asset', 'Current Asset', '', 0, true]);
    accSheet.appendRow(['1-1003', 'Piutang Usaha', 'Asset', 'Current Asset', '', 0, true]);
    accSheet.appendRow(['1-1004', 'Persediaan Barang', 'Asset', 'Current Asset', '', 0, true]);
    accSheet.appendRow(['1-2001', 'Peralatan', 'Asset', 'Fixed Asset', '', 0, true]);
    accSheet.appendRow(['1-2002', 'Kendaraan', 'Asset', 'Fixed Asset', '', 0, true]);
    accSheet.appendRow(['1-2003', 'Bangunan', 'Asset', 'Fixed Asset', '', 0, true]);

    // LIABILITIES
    accSheet.appendRow(['2-1001', 'Utang Usaha', 'Liability', 'Current Liability', '', 0, true]);
    accSheet.appendRow(['2-1002', 'Utang Bank', 'Liability', 'Long-term Liability', '', 0, true]);

    // EQUITY
    accSheet.appendRow(['3-1001', 'Modal Pemilik', 'Equity', 'Owner Equity', '', 0, true]);
    accSheet.appendRow(['3-2001', 'Laba Ditahan', 'Equity', 'Retained Earnings', '', 0, true]);

    // REVENUE
    accSheet.appendRow(['4-1001', 'Pendapatan Penjualan', 'Revenue', 'Sales Revenue', '', 0, true]);
    accSheet.appendRow(['4-1002', 'Pendapatan Jasa', 'Revenue', 'Service Revenue', '', 0, true]);
    accSheet.appendRow(['4-2001', 'Pendapatan Lain-lain', 'Revenue', 'Other Revenue', '', 0, true]);

    // EXPENSES
    accSheet.appendRow(['5-1001', 'Beban Gaji', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['5-1002', 'Beban Sewa', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['5-1003', 'Beban Listrik & Air', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['5-1004', 'Beban Telepon & Internet', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['5-1005', 'Beban Perlengkapan', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['5-1006', 'Beban Transportasi', 'Expense', 'Operating Expense', '', 0, true]);
    accSheet.appendRow(['6-1001', 'Harga Pokok Penjualan', 'Expense', 'Cost of Goods Sold', '', 0, true]);
    accSheet.appendRow(['6-2001', 'Beban Administrasi', 'Expense', 'Administrative Expense', '', 0, true]);
    accSheet.appendRow(['6-2002', 'Beban Pemasaran', 'Expense', 'Marketing Expense', '', 0, true]);
  }
}

// ============================================================================
// USER MANAGEMENT (ADMIN ONLY)
// ============================================================================

function getUsers() {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();

    const users = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {
        users.push({
          userId: data[i][0],
          username: data[i][1],
          fullName: data[i][3],
          role: data[i][4],
          active: data[i][5],
          createdDate: data[i][6]
        });
      }
    }

    return { success: true, data: users };
  } catch (error) {
    return { success: false, message: 'Gagal mengambil data user' };
  }
}

function saveUser(user) {
  try {
    if (!checkAccess(CONFIG.ROLES.ADMIN)) {
      return { success: false, message: 'Akses ditolak' };
    }

    if (!user.username || !user.password || !user.fullName || !user.role) {
      return { success: false, message: 'Data user tidak lengkap' };
    }

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SHEET_NAMES.USERS);
    const data = sheet.getDataRange().getValues();

    if (!user.userId) {
      user.userId = 'USER' + (new Date()).getTime();
      user.createdDate = new Date();
    }

    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === user.userId) {
        existingRow = i + 1;
        break;
      }
    }

    const rowData = [
      user.userId,
      user.username,
      user.password,
      user.fullName,
      user.role,
      user.active !== false,
      user.createdDate || new Date()
    ];

    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
      return { success: true, message: 'User berhasil diupdate' };
    } else {
      sheet.appendRow(rowData);
      return { success: true, message: 'User berhasil ditambahkan' };
    }
  } catch (error) {
    return { success: false, message: 'Gagal menyimpan user' };
  }
}

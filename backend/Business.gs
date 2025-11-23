/**
 * Business Management
 * Handles POS/Kasir, Inventory Management, Receivables and Payables
 */

// ==================== POINT OF SALE (POS/KASIR) ====================

/**
 * Create sale transaction (POS)
 */
function createSale(saleData) {
  try {
    requireAuth();

    saleData = sanitizeObject(saleData);

    // Validate data
    if (!saleData.customerId || !saleData.items || saleData.items.length === 0) {
      return {
        success: false,
        message: 'Data penjualan tidak lengkap'
      };
    }

    const session = getSession();
    const sheet = getSheet(SHEETS.SALES);
    const saleId = generateId('SALE');
    const invoiceNo = generateInvoiceNo('INV');
    const saleDate = formatDate(new Date(saleData.saleDate || new Date()));

    let totalAmount = 0;

    // Process each item
    for (const item of saleData.items) {
      const productId = item.productId;
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      const discount = parseFloat(item.discount || 0);
      const tax = parseFloat(item.tax || 0);
      const itemTotal = (quantity * unitPrice - discount) + tax;

      // Check stock availability
      const product = getProductById(productId);
      if (!product.success) {
        return {
          success: false,
          message: `Produk ${productId} tidak ditemukan`
        };
      }

      if (product.data.stock < quantity) {
        return {
          success: false,
          message: `Stok ${product.data.productName} tidak mencukupi`
        };
      }

      // Add sale record
      sheet.appendRow([
        generateId('SALE-ITEM'),
        saleDate,
        invoiceNo,
        saleData.customerId,
        productId,
        quantity,
        unitPrice,
        discount,
        tax,
        itemTotal,
        saleData.paymentMethod || 'Cash',
        session.username,
        formatDate(new Date()),
        'Active'
      ]);

      // Update stock
      updateProductStock(productId, quantity, 'reduce');

      // Record inventory movement
      recordInventoryMovement({
        productId: productId,
        transactionType: 'Sale',
        referenceNo: invoiceNo,
        quantityOut: quantity,
        notes: `Penjualan ${invoiceNo}`
      });

      totalAmount += itemTotal;
    }

    // Create accounting transaction
    createIncome({
      date: saleDate,
      type: saleData.paymentMethod === 'Cash' ? 'cash' : 'bank',
      amount: totalAmount,
      referenceNo: invoiceNo,
      incomeAccountCode: '4-1001', // Pendapatan Penjualan
      description: `Penjualan ${invoiceNo}`,
      partnerId: saleData.customerId,
      partnerType: 'Customer'
    });

    // If not paid in full, create receivable
    if (saleData.paymentMethod === 'Credit' || saleData.paidAmount < totalAmount) {
      const balance = totalAmount - (saleData.paidAmount || 0);
      createReceivable({
        invoiceNo: invoiceNo,
        invoiceDate: saleDate,
        dueDate: saleData.dueDate,
        customerId: saleData.customerId,
        amount: totalAmount,
        paidAmount: saleData.paidAmount || 0,
        balance: balance
      });
    }

    return {
      success: true,
      message: 'Transaksi penjualan berhasil',
      invoiceNo: invoiceNo,
      totalAmount: totalAmount
    };
  } catch (error) {
    Logger.log('Error creating sale: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get sales history
 */
function getSales(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.SALES);
    const data = sheet.getDataRange().getValues();
    const sales = {};

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const invoiceNo = row[2];

      if (filter) {
        if (filter.startDate && new Date(row[1]) < new Date(filter.startDate)) continue;
        if (filter.endDate && new Date(row[1]) > new Date(filter.endDate)) continue;
        if (filter.customerId && row[3] !== filter.customerId) continue;
        if (filter.status && row[13] !== filter.status) continue;
      }

      if (!sales[invoiceNo]) {
        sales[invoiceNo] = {
          invoiceNo: invoiceNo,
          saleDate: row[1],
          customerId: row[3],
          items: [],
          totalAmount: 0,
          paymentMethod: row[10],
          createdBy: row[11],
          status: row[13]
        };
      }

      sales[invoiceNo].items.push({
        productId: row[4],
        quantity: row[5],
        unitPrice: row[6],
        discount: row[7],
        tax: row[8],
        total: row[9]
      });

      sales[invoiceNo].totalAmount += parseFloat(row[9]);
    }

    return {
      success: true,
      data: Object.values(sales)
    };
  } catch (error) {
    Logger.log('Error getting sales: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate invoice number
 */
function generateInvoiceNo(prefix) {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${year}${month}${day}-${random}`;
}

// ==================== INVENTORY MANAGEMENT ====================

/**
 * Record inventory movement
 */
function recordInventoryMovement(movementData) {
  try {
    const session = getSession();
    const sheet = getSheet(SHEETS.INVENTORY);

    // Get current balance
    const product = getProductById(movementData.productId);
    const balance = product.success ? product.data.stock : 0;

    sheet.appendRow([
      generateId('INV'),
      formatDate(new Date(movementData.date || new Date())),
      movementData.productId,
      movementData.transactionType,
      movementData.referenceNo || '',
      parseFloat(movementData.quantityIn || 0),
      parseFloat(movementData.quantityOut || 0),
      balance,
      movementData.notes || '',
      session.username,
      formatDate(new Date())
    ]);

    return {
      success: true,
      message: 'Pergerakan inventory berhasil dicatat'
    };
  } catch (error) {
    Logger.log('Error recording inventory movement: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get inventory movements
 */
function getInventoryMovements(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.INVENTORY);
    const data = sheet.getDataRange().getValues();
    const movements = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter) {
        if (filter.productId && row[2] !== filter.productId) continue;
        if (filter.startDate && new Date(row[1]) < new Date(filter.startDate)) continue;
        if (filter.endDate && new Date(row[1]) > new Date(filter.endDate)) continue;
        if (filter.transactionType && row[3] !== filter.transactionType) continue;
      }

      movements.push({
        movementId: row[0],
        date: row[1],
        productId: row[2],
        transactionType: row[3],
        referenceNo: row[4],
        quantityIn: row[5],
        quantityOut: row[6],
        balance: row[7],
        notes: row[8],
        createdBy: row[9],
        createdDate: row[10]
      });
    }

    return {
      success: true,
      data: movements
    };
  } catch (error) {
    Logger.log('Error getting inventory movements: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update inventory (stock in/out)
 */
function updateInventory(inventoryData) {
  try {
    requireAuth();

    inventoryData = sanitizeObject(inventoryData);

    const productId = inventoryData.productId;
    const quantity = parseFloat(inventoryData.quantity);
    const type = inventoryData.type; // 'in' or 'out'

    if (!productId || !quantity || !type) {
      return {
        success: false,
        message: 'Data inventory tidak lengkap'
      };
    }

    // Update product stock
    const result = updateProductStock(productId, quantity, type === 'in' ? 'add' : 'reduce');

    if (!result.success) {
      return result;
    }

    // Record movement
    recordInventoryMovement({
      productId: productId,
      transactionType: type === 'in' ? 'Stock In' : 'Stock Out',
      referenceNo: inventoryData.referenceNo,
      quantityIn: type === 'in' ? quantity : 0,
      quantityOut: type === 'out' ? quantity : 0,
      notes: inventoryData.notes
    });

    return {
      success: true,
      message: 'Inventory berhasil diupdate',
      newStock: result.newStock
    };
  } catch (error) {
    Logger.log('Error updating inventory: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ==================== RECEIVABLES (PIUTANG) ====================

/**
 * Create receivable
 */
function createReceivable(receivableData) {
  try {
    requireAuth();

    receivableData = sanitizeObject(receivableData);

    const session = getSession();
    const sheet = getSheet(SHEETS.RECEIVABLES);
    const receivableId = generateId('RCV');

    sheet.appendRow([
      receivableId,
      receivableData.invoiceNo,
      formatDate(new Date(receivableData.invoiceDate)),
      formatDate(new Date(receivableData.dueDate)),
      receivableData.customerId,
      parseFloat(receivableData.amount),
      parseFloat(receivableData.paidAmount || 0),
      parseFloat(receivableData.balance || receivableData.amount),
      receivableData.balance > 0 ? 'Unpaid' : 'Paid',
      session.username,
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Receivable', receivableId, receivableData);

    return {
      success: true,
      message: 'Piutang berhasil dicatat',
      receivableId: receivableId
    };
  } catch (error) {
    Logger.log('Error creating receivable: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get receivables
 */
function getReceivables(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.RECEIVABLES);
    const data = sheet.getDataRange().getValues();
    const receivables = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter) {
        if (filter.customerId && row[4] !== filter.customerId) continue;
        if (filter.status && row[8] !== filter.status) continue;
        if (filter.overdue) {
          const dueDate = new Date(row[3]);
          const today = new Date();
          if (dueDate >= today) continue;
        }
      }

      receivables.push({
        receivableId: row[0],
        invoiceNo: row[1],
        invoiceDate: row[2],
        dueDate: row[3],
        customerId: row[4],
        amount: row[5],
        paidAmount: row[6],
        balance: row[7],
        status: row[8],
        createdBy: row[9],
        createdDate: row[10]
      });
    }

    return {
      success: true,
      data: receivables
    };
  } catch (error) {
    Logger.log('Error getting receivables: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Record receivable payment
 */
function recordReceivablePayment(receivableId, paymentAmount, paymentDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.RECEIVABLES);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === receivableId) {
        const currentPaidAmount = parseFloat(data[i][6]);
        const totalAmount = parseFloat(data[i][5]);
        const newPaidAmount = currentPaidAmount + parseFloat(paymentAmount);
        const newBalance = totalAmount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

        sheet.getRange(i + 1, 7).setValue(newPaidAmount);
        sheet.getRange(i + 1, 8).setValue(newBalance);
        sheet.getRange(i + 1, 9).setValue(newStatus);

        // Create income transaction
        createIncome({
          date: paymentDate || new Date(),
          type: 'cash',
          amount: paymentAmount,
          referenceNo: data[i][1], // Invoice No
          incomeAccountCode: '1-1003', // Piutang Usaha
          description: `Pembayaran piutang ${data[i][1]}`,
          partnerId: data[i][4],
          partnerType: 'Customer'
        });

        logAudit('PAYMENT', 'Receivable', receivableId, { paymentAmount: paymentAmount });

        return {
          success: true,
          message: 'Pembayaran piutang berhasil dicatat',
          newBalance: newBalance
        };
      }
    }

    return {
      success: false,
      message: 'Piutang tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error recording receivable payment: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// ==================== PAYABLES (UTANG) ====================

/**
 * Create payable
 */
function createPayable(payableData) {
  try {
    requireAuth();

    payableData = sanitizeObject(payableData);

    const session = getSession();
    const sheet = getSheet(SHEETS.PAYABLES);
    const payableId = generateId('PAY');

    sheet.appendRow([
      payableId,
      payableData.invoiceNo,
      formatDate(new Date(payableData.invoiceDate)),
      formatDate(new Date(payableData.dueDate)),
      payableData.supplierId,
      parseFloat(payableData.amount),
      parseFloat(payableData.paidAmount || 0),
      parseFloat(payableData.balance || payableData.amount),
      payableData.balance > 0 ? 'Unpaid' : 'Paid',
      session.username,
      formatDate(new Date())
    ]);

    logAudit('CREATE', 'Payable', payableId, payableData);

    return {
      success: true,
      message: 'Utang berhasil dicatat',
      payableId: payableId
    };
  } catch (error) {
    Logger.log('Error creating payable: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get payables
 */
function getPayables(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.PAYABLES);
    const data = sheet.getDataRange().getValues();
    const payables = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (filter) {
        if (filter.supplierId && row[4] !== filter.supplierId) continue;
        if (filter.status && row[8] !== filter.status) continue;
        if (filter.overdue) {
          const dueDate = new Date(row[3]);
          const today = new Date();
          if (dueDate >= today) continue;
        }
      }

      payables.push({
        payableId: row[0],
        invoiceNo: row[1],
        invoiceDate: row[2],
        dueDate: row[3],
        supplierId: row[4],
        amount: row[5],
        paidAmount: row[6],
        balance: row[7],
        status: row[8],
        createdBy: row[9],
        createdDate: row[10]
      });
    }

    return {
      success: true,
      data: payables
    };
  } catch (error) {
    Logger.log('Error getting payables: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Record payable payment
 */
function recordPayablePayment(payableId, paymentAmount, paymentDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.PAYABLES);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === payableId) {
        const currentPaidAmount = parseFloat(data[i][6]);
        const totalAmount = parseFloat(data[i][5]);
        const newPaidAmount = currentPaidAmount + parseFloat(paymentAmount);
        const newBalance = totalAmount - newPaidAmount;
        const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

        sheet.getRange(i + 1, 7).setValue(newPaidAmount);
        sheet.getRange(i + 1, 8).setValue(newBalance);
        sheet.getRange(i + 1, 9).setValue(newStatus);

        // Create expense transaction
        createExpense({
          date: paymentDate || new Date(),
          type: 'cash',
          amount: paymentAmount,
          referenceNo: data[i][1], // Invoice No
          expenseAccountCode: '2-1001', // Utang Usaha
          description: `Pembayaran utang ${data[i][1]}`,
          partnerId: data[i][4],
          partnerType: 'Supplier'
        });

        logAudit('PAYMENT', 'Payable', payableId, { paymentAmount: paymentAmount });

        return {
          success: true,
          message: 'Pembayaran utang berhasil dicatat',
          newBalance: newBalance
        };
      }
    }

    return {
      success: false,
      message: 'Utang tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error recording payable payment: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create purchase transaction
 */
function createPurchase(purchaseData) {
  try {
    requireAuth();

    purchaseData = sanitizeObject(purchaseData);

    const session = getSession();
    const sheet = getSheet(SHEETS.PURCHASES);
    const purchaseId = generateId('PURCH');
    const poNo = generateInvoiceNo('PO');
    const purchaseDate = formatDate(new Date(purchaseData.purchaseDate || new Date()));

    let totalAmount = 0;

    // Process each item
    for (const item of purchaseData.items) {
      const productId = item.productId;
      const quantity = parseFloat(item.quantity);
      const unitPrice = parseFloat(item.unitPrice);
      const discount = parseFloat(item.discount || 0);
      const tax = parseFloat(item.tax || 0);
      const itemTotal = (quantity * unitPrice - discount) + tax;

      // Add purchase record
      sheet.appendRow([
        generateId('PURCH-ITEM'),
        purchaseDate,
        poNo,
        purchaseData.supplierId,
        productId,
        quantity,
        unitPrice,
        discount,
        tax,
        itemTotal,
        purchaseData.paymentStatus || 'Unpaid',
        session.username,
        formatDate(new Date()),
        'Active'
      ]);

      // Update stock
      updateProductStock(productId, quantity, 'add');

      // Record inventory movement
      recordInventoryMovement({
        productId: productId,
        transactionType: 'Purchase',
        referenceNo: poNo,
        quantityIn: quantity,
        notes: `Pembelian ${poNo}`
      });

      totalAmount += itemTotal;
    }

    // Create accounting transaction
    createExpense({
      date: purchaseDate,
      type: purchaseData.paymentMethod === 'Cash' ? 'cash' : 'bank',
      amount: totalAmount,
      referenceNo: poNo,
      expenseAccountCode: '5-1001', // Harga Pokok Penjualan
      description: `Pembelian ${poNo}`,
      partnerId: purchaseData.supplierId,
      partnerType: 'Supplier'
    });

    // If not paid in full, create payable
    if (purchaseData.paymentStatus === 'Unpaid' || purchaseData.paidAmount < totalAmount) {
      const balance = totalAmount - (purchaseData.paidAmount || 0);
      createPayable({
        invoiceNo: poNo,
        invoiceDate: purchaseDate,
        dueDate: purchaseData.dueDate,
        supplierId: purchaseData.supplierId,
        amount: totalAmount,
        paidAmount: purchaseData.paidAmount || 0,
        balance: balance
      });
    }

    return {
      success: true,
      message: 'Transaksi pembelian berhasil',
      poNo: poNo,
      totalAmount: totalAmount
    };
  } catch (error) {
    Logger.log('Error creating purchase: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

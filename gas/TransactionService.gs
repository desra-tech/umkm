/**
 * Transaction Service - Handle all financial transactions
 */

// ============================================
// GENERAL TRANSACTIONS
// ============================================

function getTransactions(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    var data = sheet.getDataRange().getValues();
    var transactions = [];

    var startDate = params.startDate ? new Date(params.startDate) : null;
    var endDate = params.endDate ? new Date(params.endDate) : null;
    var type = params.type;

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        var txDate = new Date(data[i][2]);

        // Filter by date range
        if (startDate && txDate < startDate) continue;
        if (endDate && txDate > endDate) continue;

        // Filter by type
        if (type && data[i][3] !== type) continue;

        transactions.push({
          id: data[i][0],
          transactionNumber: data[i][1],
          date: data[i][2],
          type: data[i][3],
          accountId: data[i][4],
          partyId: data[i][5],
          description: data[i][6],
          amount: data[i][7],
          paymentMethod: data[i][8],
          reference: data[i][9],
          status: data[i][10],
          createdDate: data[i][11],
          createdBy: data[i][12]
        });
      }
    }

    return { success: true, data: transactions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function saveTransaction(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);

    params.description = sanitizeInput(params.description);
    params.reference = sanitizeInput(params.reference);

    var amount = parseFloat(params.amount);
    if (isNaN(amount) || amount <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    if (params.id) {
      // Update existing
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.getRange(i + 1, 3, 1, 9).setValues([[
            new Date(params.date),
            params.type,
            params.accountId || '',
            params.partyId || '',
            params.description || '',
            amount,
            params.paymentMethod || 'Cash',
            params.reference || '',
            params.status || 'completed'
          ]]);

          // Update inventory if needed
          if (params.type === 'purchase' || params.type === 'sale') {
            updateInventoryFromTransaction(params);
          }

          return { success: true, message: 'Transaction updated successfully' };
        }
      }
    } else {
      // Create new
      var newId = getNextId(sheet);
      var txNumber = generateTransactionNumber(params.type);

      sheet.appendRow([
        newId,
        txNumber,
        new Date(params.date),
        params.type,
        params.accountId || '',
        params.partyId || '',
        params.description || '',
        amount,
        params.paymentMethod || 'Cash',
        params.reference || '',
        params.status || 'completed',
        new Date(),
        params.currentUser || 'system'
      ]);

      // Save transaction details if exists
      if (params.details && params.details.length > 0) {
        saveTransactionDetails(newId, params.details);
      }

      // Update inventory if needed
      if (params.type === 'purchase' || params.type === 'sale') {
        updateInventoryFromTransaction(Object.assign({}, params, { id: newId }));
      }

      // Update receivables/payables
      if (params.type === 'sale' && params.paymentMethod === 'Credit') {
        createReceivable(newId, params);
      } else if (params.type === 'purchase' && params.paymentMethod === 'Credit') {
        createPayable(newId, params);
      }

      return {
        success: true,
        message: 'Transaction created successfully',
        id: newId,
        transactionNumber: txNumber
      };
    }

    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    Logger.log('Error in saveTransaction: ' + error.toString());
    return { success: false, error: error.message };
  }
}

function deleteTransaction(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        // Delete related transaction details
        deleteTransactionDetails(params.id);

        // Reverse inventory changes
        reverseInventoryFromTransaction(params.id);

        sheet.deleteRow(i + 1);
        return { success: true, message: 'Transaction deleted successfully' };
      }
    }

    return { success: false, error: 'Transaction not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate transaction number
 */
function generateTransactionNumber(type) {
  var prefix = {
    'receipt': 'RCP',
    'payment': 'PMT',
    'sale': 'INV',
    'purchase': 'PO',
    'capital': 'CAP'
  };

  var code = prefix[type] || 'TRX';
  var date = new Date();
  var year = date.getFullYear().toString().substr(-2);
  var month = ('0' + (date.getMonth() + 1)).slice(-2);

  // Get last number for this month
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
  var data = sheet.getDataRange().getValues();

  var lastNum = 0;
  var searchPrefix = code + '-' + year + month;

  for (var i = 1; i < data.length; i++) {
    var txNum = data[i][1];
    if (txNum && txNum.indexOf(searchPrefix) === 0) {
      var num = parseInt(txNum.split('-')[2]);
      if (num > lastNum) lastNum = num;
    }
  }

  var newNum = ('0000' + (lastNum + 1)).slice(-4);
  return code + '-' + year + month + '-' + newNum;
}

// ============================================
// TRANSACTION DETAILS
// ============================================

function saveTransactionDetails(transactionId, details) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTION_DETAILS);

  for (var i = 0; i < details.length; i++) {
    var detail = details[i];
    var newId = getNextId(sheet);

    sheet.appendRow([
      newId,
      transactionId,
      detail.productId,
      parseFloat(detail.quantity),
      parseFloat(detail.unitPrice),
      parseFloat(detail.quantity) * parseFloat(detail.unitPrice),
      new Date()
    ]);
  }
}

function getTransactionDetails(transactionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTION_DETAILS);
  var data = sheet.getDataRange().getValues();
  var details = [];

  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == transactionId) {
      details.push({
        id: data[i][0],
        transactionId: data[i][1],
        productId: data[i][2],
        quantity: data[i][3],
        unitPrice: data[i][4],
        subtotal: data[i][5]
      });
    }
  }

  return details;
}

function deleteTransactionDetails(transactionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTION_DETAILS);
  var data = sheet.getDataRange().getValues();

  // Delete from bottom to top to avoid row shifting issues
  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][1] == transactionId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// ============================================
// INVENTORY MANAGEMENT
// ============================================

function getInventory() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.INVENTORY);
    var data = sheet.getDataRange().getValues();
    var inventory = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        inventory.push({
          id: data[i][0],
          date: data[i][1],
          productId: data[i][2],
          type: data[i][3],
          quantity: data[i][4],
          unitPrice: data[i][5],
          total: data[i][6],
          reference: data[i][7],
          notes: data[i][8],
          createdDate: data[i][9],
          createdBy: data[i][10]
        });
      }
    }

    return { success: true, data: inventory };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function updateInventoryFromTransaction(params) {
  var details = params.details || [];
  if (details.length === 0) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var invSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.INVENTORY);

  for (var i = 0; i < details.length; i++) {
    var detail = details[i];
    var type = params.type === 'purchase' ? 'in' : 'out';
    var newId = getNextId(invSheet);

    invSheet.appendRow([
      newId,
      new Date(params.date),
      detail.productId,
      type,
      parseFloat(detail.quantity),
      parseFloat(detail.unitPrice),
      parseFloat(detail.quantity) * parseFloat(detail.unitPrice),
      params.id,
      params.description || '',
      new Date(),
      params.currentUser || 'system'
    ]);

    // Update product stock
    updateProductStock(detail.productId, parseFloat(detail.quantity), type);
  }
}

function reverseInventoryFromTransaction(transactionId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var invSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.INVENTORY);
  var data = invSheet.getDataRange().getValues();

  for (var i = data.length - 1; i >= 1; i--) {
    if (data[i][7] == transactionId) {
      // Reverse stock
      var productId = data[i][2];
      var type = data[i][3];
      var quantity = data[i][4];
      var reverseType = type === 'in' ? 'out' : 'in';
      updateProductStock(productId, quantity, reverseType);

      // Delete inventory record
      invSheet.deleteRow(i + 1);
    }
  }
}

// ============================================
// RECEIVABLES & PAYABLES
// ============================================

function getReceivables() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.RECEIVABLES);
    var data = sheet.getDataRange().getValues();
    var receivables = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        receivables.push({
          id: data[i][0],
          invoiceNumber: data[i][1],
          customerId: data[i][2],
          date: data[i][3],
          dueDate: data[i][4],
          amount: data[i][5],
          paidAmount: data[i][6],
          balance: data[i][7],
          status: data[i][8],
          createdDate: data[i][9],
          createdBy: data[i][10]
        });
      }
    }

    return { success: true, data: receivables };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function getPayables() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PAYABLES);
    var data = sheet.getDataRange().getValues();
    var payables = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        payables.push({
          id: data[i][0],
          billNumber: data[i][1],
          supplierId: data[i][2],
          date: data[i][3],
          dueDate: data[i][4],
          amount: data[i][5],
          paidAmount: data[i][6],
          balance: data[i][7],
          status: data[i][8],
          createdDate: data[i][9],
          createdBy: data[i][10]
        });
      }
    }

    return { success: true, data: payables };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function createReceivable(transactionId, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.RECEIVABLES);
  var newId = getNextId(sheet);

  var dueDate = params.dueDate ? new Date(params.dueDate) : new Date(new Date(params.date).getTime() + 30 * 24 * 60 * 60 * 1000);

  sheet.appendRow([
    newId,
    params.transactionNumber || transactionId,
    params.partyId,
    new Date(params.date),
    dueDate,
    parseFloat(params.amount),
    0,
    parseFloat(params.amount),
    'unpaid',
    new Date(),
    params.currentUser || 'system'
  ]);
}

function createPayable(transactionId, params) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PAYABLES);
  var newId = getNextId(sheet);

  var dueDate = params.dueDate ? new Date(params.dueDate) : new Date(new Date(params.date).getTime() + 30 * 24 * 60 * 60 * 1000);

  sheet.appendRow([
    newId,
    params.transactionNumber || transactionId,
    params.partyId,
    new Date(params.date),
    dueDate,
    parseFloat(params.amount),
    0,
    parseFloat(params.amount),
    'unpaid',
    new Date(),
    params.currentUser || 'system'
  ]);
}

function recordPayment(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = params.type === 'receivable' ? CONFIG.SHEET_NAMES.RECEIVABLES : CONFIG.SHEET_NAMES.PAYABLES;
    var sheet = ss.getSheetByName(sheetName);
    var data = sheet.getDataRange().getValues();

    var amount = parseFloat(params.amount);

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        var currentPaid = parseFloat(data[i][6]) || 0;
        var totalAmount = parseFloat(data[i][5]);
        var newPaid = currentPaid + amount;
        var balance = totalAmount - newPaid;
        var status = balance <= 0 ? 'paid' : 'partial';

        sheet.getRange(i + 1, 7).setValue(newPaid);
        sheet.getRange(i + 1, 8).setValue(balance);
        sheet.getRange(i + 1, 9).setValue(status);

        // Record as transaction
        var txType = params.type === 'receivable' ? 'receipt' : 'payment';
        saveTransaction({
          type: txType,
          date: params.date || new Date(),
          accountId: params.accountId || '',
          partyId: data[i][2],
          description: 'Payment for ' + data[i][1],
          amount: amount,
          paymentMethod: params.paymentMethod || 'Cash',
          reference: data[i][1],
          currentUser: params.currentUser
        });

        return { success: true, message: 'Payment recorded successfully' };
      }
    }

    return { success: false, error: 'Record not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// POS / SALES
// ============================================

function createSale(params) {
  try {
    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'No items in sale' };
    }

    var total = 0;
    var details = [];

    for (var i = 0; i < params.items.length; i++) {
      var item = params.items[i];
      var subtotal = parseFloat(item.quantity) * parseFloat(item.price);
      total += subtotal;

      details.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price
      });
    }

    // Create transaction
    var result = saveTransaction({
      type: 'sale',
      date: params.date || new Date(),
      accountId: params.accountId || '',
      partyId: params.customerId || '',
      description: params.notes || 'POS Sale',
      amount: total,
      paymentMethod: params.paymentMethod || 'Cash',
      reference: params.reference || '',
      details: details,
      currentUser: params.currentUser
    });

    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
}

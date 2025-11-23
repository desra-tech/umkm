/**
 * Transaction Management
 * Handles financial transactions (Penerimaan, Pengeluaran, Modal)
 */

/**
 * Create new transaction
 */
function createTransaction(transactionData) {
  try {
    requireAuth();

    // Sanitize input
    transactionData = sanitizeObject(transactionData);

    // Validate data
    const validation = validateTransactionData(transactionData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    // Check if account exists
    if (!accountExists(transactionData.accountCode)) {
      return {
        success: false,
        message: 'Kode akun tidak ditemukan'
      };
    }

    const session = getSession();
    const sheet = getSheet(SHEETS.TRANSACTIONS);

    const transactionId = generateId('TRX');
    const debit = parseFloat(transactionData.debit || 0);
    const credit = parseFloat(transactionData.credit || 0);

    sheet.appendRow([
      transactionId,
      formatDate(new Date(transactionData.date)),
      transactionData.transactionType,
      transactionData.referenceNo || '',
      transactionData.accountCode,
      debit,
      credit,
      transactionData.description || '',
      transactionData.partnerId || '',
      transactionData.partnerType || '',
      session.username,
      formatDate(new Date()),
      'Active'
    ]);

    // Update related records based on transaction type
    updateRelatedRecords(transactionData, transactionId);

    logAudit('CREATE', 'Transaction', transactionId, transactionData);

    return {
      success: true,
      message: 'Transaksi berhasil disimpan',
      transactionId: transactionId
    };
  } catch (error) {
    Logger.log('Error creating transaction: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update related records after transaction
 */
function updateRelatedRecords(transactionData, transactionId) {
  try {
    // Update inventory if related to product
    if (transactionData.productId) {
      updateInventory(transactionData, transactionId);
    }

    // Update receivables/payables if applicable
    if (transactionData.transactionType === 'Penerimaan' && transactionData.partnerId) {
      updateReceivables(transactionData, transactionId);
    } else if (transactionData.transactionType === 'Pengeluaran' && transactionData.partnerId) {
      updatePayables(transactionData, transactionId);
    }
  } catch (error) {
    Logger.log('Error updating related records: ' + error.toString());
  }
}

/**
 * Get all transactions
 */
function getTransactions(filter) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();
    const transactions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Apply filters if provided
      if (filter) {
        if (filter.transactionType && row[2] !== filter.transactionType) continue;
        if (filter.startDate && new Date(row[1]) < new Date(filter.startDate)) continue;
        if (filter.endDate && new Date(row[1]) > new Date(filter.endDate)) continue;
        if (filter.accountCode && row[4] !== filter.accountCode) continue;
        if (filter.status && row[12] !== filter.status) continue;
      }

      transactions.push({
        transactionId: row[0],
        date: row[1],
        transactionType: row[2],
        referenceNo: row[3],
        accountCode: row[4],
        debit: row[5],
        credit: row[6],
        description: row[7],
        partnerId: row[8],
        partnerType: row[9],
        createdBy: row[10],
        createdDate: row[11],
        status: row[12]
      });
    }

    // Sort by date (newest first)
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      success: true,
      data: transactions
    };
  } catch (error) {
    Logger.log('Error getting transactions: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get transaction by ID
 */
function getTransactionById(transactionId) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === transactionId) {
        return {
          success: true,
          data: {
            transactionId: data[i][0],
            date: data[i][1],
            transactionType: data[i][2],
            referenceNo: data[i][3],
            accountCode: data[i][4],
            debit: data[i][5],
            credit: data[i][6],
            description: data[i][7],
            partnerId: data[i][8],
            partnerType: data[i][9],
            createdBy: data[i][10],
            createdDate: data[i][11],
            status: data[i][12]
          }
        };
      }
    }

    return {
      success: false,
      message: 'Transaksi tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error getting transaction: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update transaction
 */
function updateTransaction(transactionId, transactionData) {
  try {
    requireAuth();

    // Sanitize input
    transactionData = sanitizeObject(transactionData);

    // Validate data
    const validation = validateTransactionData(transactionData);
    if (!validation.valid) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validation.errors
      };
    }

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === transactionId) {
        const debit = parseFloat(transactionData.debit || 0);
        const credit = parseFloat(transactionData.credit || 0);

        sheet.getRange(i + 1, 2).setValue(formatDate(new Date(transactionData.date)));
        sheet.getRange(i + 1, 3).setValue(transactionData.transactionType);
        sheet.getRange(i + 1, 4).setValue(transactionData.referenceNo || '');
        sheet.getRange(i + 1, 5).setValue(transactionData.accountCode);
        sheet.getRange(i + 1, 6).setValue(debit);
        sheet.getRange(i + 1, 7).setValue(credit);
        sheet.getRange(i + 1, 8).setValue(transactionData.description || '');

        logAudit('UPDATE', 'Transaction', transactionId, transactionData);

        return {
          success: true,
          message: 'Transaksi berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'Transaksi tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating transaction: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Delete transaction (soft delete)
 */
function deleteTransaction(transactionId) {
  try {
    requireAdmin(); // Only admin can delete

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === transactionId) {
        sheet.getRange(i + 1, 13).setValue('Deleted');

        logAudit('DELETE', 'Transaction', transactionId, {});

        return {
          success: true,
          message: 'Transaksi berhasil dihapus'
        };
      }
    }

    return {
      success: false,
      message: 'Transaksi tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error deleting transaction: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get transactions summary
 */
function getTransactionsSummary(startDate, endDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    let totalDebit = 0;
    let totalCredit = 0;
    let transactionCount = 0;

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const transactionDate = new Date(row[1]);

      // Apply date filter
      if (startDate && transactionDate < new Date(startDate)) continue;
      if (endDate && transactionDate > new Date(endDate)) continue;
      if (row[12] !== 'Active') continue; // Only active transactions

      totalDebit += parseFloat(row[5] || 0);
      totalCredit += parseFloat(row[6] || 0);
      transactionCount++;
    }

    return {
      success: true,
      data: {
        totalDebit: totalDebit,
        totalCredit: totalCredit,
        balance: totalDebit - totalCredit,
        transactionCount: transactionCount
      }
    };
  } catch (error) {
    Logger.log('Error getting transactions summary: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get transactions by account
 */
function getTransactionsByAccount(accountCode, startDate, endDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();
    const transactions = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      if (row[4] !== accountCode) continue;
      if (row[12] !== 'Active') continue;

      const transactionDate = new Date(row[1]);
      if (startDate && transactionDate < new Date(startDate)) continue;
      if (endDate && transactionDate > new Date(endDate)) continue;

      transactions.push({
        transactionId: row[0],
        date: row[1],
        transactionType: row[2],
        referenceNo: row[3],
        debit: row[5],
        credit: row[6],
        description: row[7],
        balance: 0 // Will be calculated
      });
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let balance = 0;
    transactions.forEach(transaction => {
      balance += parseFloat(transaction.debit || 0);
      balance -= parseFloat(transaction.credit || 0);
      transaction.balance = balance;
    });

    return {
      success: true,
      data: transactions
    };
  } catch (error) {
    Logger.log('Error getting transactions by account: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create income transaction (Penerimaan)
 */
function createIncome(incomeData) {
  try {
    incomeData.transactionType = 'Penerimaan';

    // Debit to cash/bank account, Credit to income account
    if (incomeData.type === 'cash') {
      incomeData.accountCode = '1-1001'; // Kas
    } else {
      incomeData.accountCode = '1-1002'; // Bank
    }

    incomeData.debit = incomeData.amount;
    incomeData.credit = 0;

    const result = createTransaction(incomeData);

    // Also create the contra entry (credit to income account)
    if (result.success && incomeData.incomeAccountCode) {
      const contraData = {
        date: incomeData.date,
        transactionType: 'Penerimaan',
        referenceNo: incomeData.referenceNo,
        accountCode: incomeData.incomeAccountCode,
        debit: 0,
        credit: incomeData.amount,
        description: incomeData.description,
        partnerId: incomeData.partnerId,
        partnerType: incomeData.partnerType
      };
      createTransaction(contraData);
    }

    return result;
  } catch (error) {
    Logger.log('Error creating income: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create expense transaction (Pengeluaran)
 */
function createExpense(expenseData) {
  try {
    expenseData.transactionType = 'Pengeluaran';

    // Credit to cash/bank account, Debit to expense account
    if (expenseData.type === 'cash') {
      expenseData.accountCode = '1-1001'; // Kas
    } else {
      expenseData.accountCode = '1-1002'; // Bank
    }

    expenseData.debit = 0;
    expenseData.credit = expenseData.amount;

    const result = createTransaction(expenseData);

    // Also create the contra entry (debit to expense account)
    if (result.success && expenseData.expenseAccountCode) {
      const contraData = {
        date: expenseData.date,
        transactionType: 'Pengeluaran',
        referenceNo: expenseData.referenceNo,
        accountCode: expenseData.expenseAccountCode,
        debit: expenseData.amount,
        credit: 0,
        description: expenseData.description,
        partnerId: expenseData.partnerId,
        partnerType: expenseData.partnerType
      };
      createTransaction(contraData);
    }

    return result;
  } catch (error) {
    Logger.log('Error creating expense: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Create capital transaction (Modal)
 */
function createCapital(capitalData) {
  try {
    capitalData.transactionType = 'Modal';

    // Debit to cash/bank, Credit to capital
    if (capitalData.type === 'cash') {
      capitalData.accountCode = '1-1001'; // Kas
    } else {
      capitalData.accountCode = '1-1002'; // Bank
    }

    if (capitalData.capitalType === 'addition') {
      // Adding capital
      capitalData.debit = capitalData.amount;
      capitalData.credit = 0;

      const result = createTransaction(capitalData);

      // Credit to capital account
      if (result.success) {
        const contraData = {
          date: capitalData.date,
          transactionType: 'Modal',
          referenceNo: capitalData.referenceNo,
          accountCode: '3-1001', // Modal Pemilik
          debit: 0,
          credit: capitalData.amount,
          description: capitalData.description
        };
        createTransaction(contraData);
      }

      return result;
    } else {
      // Withdrawing capital (Prive)
      capitalData.debit = 0;
      capitalData.credit = capitalData.amount;

      const result = createTransaction(capitalData);

      // Debit to prive account
      if (result.success) {
        const contraData = {
          date: capitalData.date,
          transactionType: 'Modal',
          referenceNo: capitalData.referenceNo,
          accountCode: '3-1002', // Prive
          debit: capitalData.amount,
          credit: 0,
          description: capitalData.description
        };
        createTransaction(contraData);
      }

      return result;
    }
  } catch (error) {
    Logger.log('Error creating capital transaction: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

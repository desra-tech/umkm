/**
 * Report Service - Generate Financial Reports
 */

// ============================================
// INCOME STATEMENT (Laporan Laba Rugi)
// ============================================

function getIncomeStatement(params) {
  try {
    var startDate = params.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), 0, 1);
    var endDate = params.endDate ? new Date(params.endDate) : new Date();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    var accSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

    var txData = txSheet.getDataRange().getValues();
    var accData = accSheet.getDataRange().getValues();

    // Build account map
    var accountMap = {};
    for (var i = 1; i < accData.length; i++) {
      accountMap[accData[i][0]] = {
        id: accData[i][0],
        code: accData[i][1],
        name: accData[i][2],
        type: accData[i][3],
        category: accData[i][4]
      };
    }

    var revenues = {};
    var cogs = {};
    var expenses = {};

    // Process transactions
    for (var i = 1; i < txData.length; i++) {
      var tx = txData[i];
      if (!tx[0]) continue;

      var txDate = new Date(tx[2]);
      if (txDate < startDate || txDate > endDate) continue;

      var accountId = tx[4];
      var amount = parseFloat(tx[7]) || 0;
      var type = tx[3];

      if (!accountId || !accountMap[accountId]) continue;

      var account = accountMap[accountId];

      // Categorize by account type
      if (account.type === 'Revenue') {
        if (!revenues[accountId]) {
          revenues[accountId] = {
            account: account,
            amount: 0
          };
        }
        revenues[accountId].amount += amount;
      } else if (account.type === 'Expense' && account.category === 'COGS') {
        if (!cogs[accountId]) {
          cogs[accountId] = {
            account: account,
            amount: 0
          };
        }
        cogs[accountId].amount += amount;
      } else if (account.type === 'Expense') {
        if (!expenses[accountId]) {
          expenses[accountId] = {
            account: account,
            amount: 0
          };
        }
        expenses[accountId].amount += amount;
      }
    }

    // Calculate totals
    var totalRevenue = 0;
    var totalCOGS = 0;
    var totalExpenses = 0;

    var revenueList = [];
    for (var key in revenues) {
      totalRevenue += revenues[key].amount;
      revenueList.push(revenues[key]);
    }

    var cogsList = [];
    for (var key in cogs) {
      totalCOGS += cogs[key].amount;
      cogsList.push(cogs[key]);
    }

    var expenseList = [];
    for (var key in expenses) {
      totalExpenses += expenses[key].amount;
      expenseList.push(expenses[key]);
    }

    var grossProfit = totalRevenue - totalCOGS;
    var netIncome = grossProfit - totalExpenses;

    return {
      success: true,
      data: {
        period: {
          startDate: startDate,
          endDate: endDate
        },
        revenues: revenueList,
        totalRevenue: totalRevenue,
        cogs: cogsList,
        totalCOGS: totalCOGS,
        grossProfit: grossProfit,
        expenses: expenseList,
        totalExpenses: totalExpenses,
        netIncome: netIncome
      }
    };
  } catch (error) {
    Logger.log('Error in getIncomeStatement: ' + error.toString());
    return { success: false, error: error.message };
  }
}

// ============================================
// BALANCE SHEET (Laporan Posisi Keuangan)
// ============================================

function getBalanceSheet(params) {
  try {
    var asOfDate = params.asOfDate ? new Date(params.asOfDate) : new Date();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    var accSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

    var txData = txSheet.getDataRange().getValues();
    var accData = accSheet.getDataRange().getValues();

    // Build account map
    var accountMap = {};
    for (var i = 1; i < accData.length; i++) {
      accountMap[accData[i][0]] = {
        id: accData[i][0],
        code: accData[i][1],
        name: accData[i][2],
        type: accData[i][3],
        category: accData[i][4]
      };
    }

    var assets = {};
    var liabilities = {};
    var equity = {};

    // Process transactions up to asOfDate
    for (var i = 1; i < txData.length; i++) {
      var tx = txData[i];
      if (!tx[0]) continue;

      var txDate = new Date(tx[2]);
      if (txDate > asOfDate) continue;

      var accountId = tx[4];
      var amount = parseFloat(tx[7]) || 0;
      var type = tx[3];

      if (!accountId || !accountMap[accountId]) continue;

      var account = accountMap[accountId];

      // Categorize by account type
      if (account.type === 'Asset') {
        if (!assets[accountId]) {
          assets[accountId] = {
            account: account,
            amount: 0
          };
        }
        // Assets increase with debit (receipt/income)
        if (type === 'receipt' || type === 'sale' || type === 'capital') {
          assets[accountId].amount += amount;
        } else if (type === 'payment' || type === 'purchase') {
          assets[accountId].amount -= amount;
        }
      } else if (account.type === 'Liability') {
        if (!liabilities[accountId]) {
          liabilities[accountId] = {
            account: account,
            amount: 0
          };
        }
        // Liabilities increase with credit (payment/expense)
        if (type === 'payment' || type === 'purchase') {
          liabilities[accountId].amount += amount;
        } else if (type === 'receipt' || type === 'sale') {
          liabilities[accountId].amount -= amount;
        }
      } else if (account.type === 'Equity') {
        if (!equity[accountId]) {
          equity[accountId] = {
            account: account,
            amount: 0
          };
        }
        // Equity increases with capital
        if (type === 'capital') {
          equity[accountId].amount += amount;
        }
      }
    }

    // Add current period net income to equity
    var incomeResult = getIncomeStatement({
      startDate: new Date(asOfDate.getFullYear(), 0, 1),
      endDate: asOfDate
    });

    var netIncome = incomeResult.data ? incomeResult.data.netIncome : 0;

    // Calculate totals
    var totalAssets = 0;
    var totalLiabilities = 0;
    var totalEquity = 0;

    var assetList = [];
    for (var key in assets) {
      totalAssets += assets[key].amount;
      assetList.push(assets[key]);
    }

    var liabilityList = [];
    for (var key in liabilities) {
      totalLiabilities += liabilities[key].amount;
      liabilityList.push(liabilities[key]);
    }

    var equityList = [];
    for (var key in equity) {
      totalEquity += equity[key].amount;
      equityList.push(equity[key]);
    }

    totalEquity += netIncome;

    return {
      success: true,
      data: {
        asOfDate: asOfDate,
        assets: assetList,
        totalAssets: totalAssets,
        liabilities: liabilityList,
        totalLiabilities: totalLiabilities,
        equity: equityList,
        netIncome: netIncome,
        totalEquity: totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
      }
    };
  } catch (error) {
    Logger.log('Error in getBalanceSheet: ' + error.toString());
    return { success: false, error: error.message };
  }
}

// ============================================
// CASH FLOW STATEMENT (Laporan Arus Kas)
// ============================================

function getCashFlow(params) {
  try {
    var startDate = params.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), 0, 1);
    var endDate = params.endDate ? new Date(params.endDate) : new Date();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
    var accSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

    var txData = txSheet.getDataRange().getValues();
    var accData = accSheet.getDataRange().getValues();

    // Build account map
    var accountMap = {};
    var cashAccounts = [];
    for (var i = 1; i < accData.length; i++) {
      accountMap[accData[i][0]] = {
        id: accData[i][0],
        code: accData[i][1],
        name: accData[i][2],
        type: accData[i][3],
        category: accData[i][4]
      };

      // Identify cash/bank accounts
      if (accData[i][4] === 'Cash' || accData[i][4] === 'Bank') {
        cashAccounts.push(accData[i][0]);
      }
    }

    var operating = [];
    var investing = [];
    var financing = [];

    var operatingTotal = 0;
    var investingTotal = 0;
    var financingTotal = 0;

    // Process transactions
    for (var i = 1; i < txData.length; i++) {
      var tx = txData[i];
      if (!tx[0]) continue;

      var txDate = new Date(tx[2]);
      if (txDate < startDate || txDate > endDate) continue;

      var accountId = tx[4];
      var amount = parseFloat(tx[7]) || 0;
      var type = tx[3];
      var description = tx[6];

      if (!accountId || !accountMap[accountId]) continue;

      // Only process if it's a cash account
      if (cashAccounts.indexOf(accountId) === -1) continue;

      var account = accountMap[accountId];

      var item = {
        date: txDate,
        description: description,
        amount: 0,
        type: type
      };

      // Determine cash flow type and amount
      if (type === 'receipt' || type === 'sale') {
        item.amount = amount;
        operating.push(item);
        operatingTotal += amount;
      } else if (type === 'payment' || type === 'purchase') {
        item.amount = -amount;
        operating.push(item);
        operatingTotal -= amount;
      } else if (type === 'capital') {
        item.amount = amount;
        financing.push(item);
        financingTotal += amount;
      }
    }

    var beginningCash = getBeginningCash(startDate, cashAccounts);
    var netCashFlow = operatingTotal + investingTotal + financingTotal;
    var endingCash = beginningCash + netCashFlow;

    return {
      success: true,
      data: {
        period: {
          startDate: startDate,
          endDate: endDate
        },
        beginningCash: beginningCash,
        operating: {
          items: operating,
          total: operatingTotal
        },
        investing: {
          items: investing,
          total: investingTotal
        },
        financing: {
          items: financing,
          total: financingTotal
        },
        netCashFlow: netCashFlow,
        endingCash: endingCash
      }
    };
  } catch (error) {
    Logger.log('Error in getCashFlow: ' + error.toString());
    return { success: false, error: error.message };
  }
}

/**
 * Get beginning cash balance
 */
function getBeginningCash(startDate, cashAccounts) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
  var txData = txSheet.getDataRange().getValues();

  var balance = 0;

  for (var i = 1; i < txData.length; i++) {
    var tx = txData[i];
    if (!tx[0]) continue;

    var txDate = new Date(tx[2]);
    if (txDate >= startDate) continue;

    var accountId = tx[4];
    var amount = parseFloat(tx[7]) || 0;
    var type = tx[3];

    if (cashAccounts.indexOf(accountId) === -1) continue;

    if (type === 'receipt' || type === 'sale' || type === 'capital') {
      balance += amount;
    } else if (type === 'payment' || type === 'purchase') {
      balance -= amount;
    }
  }

  return balance;
}

// ============================================
// ADDITIONAL REPORTS
// ============================================

/**
 * Get account balance
 */
function getAccountBalance(accountId, asOfDate) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
  var txData = txSheet.getDataRange().getValues();

  var balance = 0;
  var date = asOfDate ? new Date(asOfDate) : new Date();

  for (var i = 1; i < txData.length; i++) {
    var tx = txData[i];
    if (!tx[0]) continue;

    var txDate = new Date(tx[2]);
    if (txDate > date) continue;

    if (tx[4] == accountId) {
      var amount = parseFloat(tx[7]) || 0;
      var type = tx[3];

      if (type === 'receipt' || type === 'sale' || type === 'capital') {
        balance += amount;
      } else if (type === 'payment' || type === 'purchase') {
        balance -= amount;
      }
    }
  }

  return balance;
}

/**
 * Get sales summary by period
 */
function getSalesSummary(params) {
  var startDate = params.startDate ? new Date(params.startDate) : new Date(new Date().getFullYear(), 0, 1);
  var endDate = params.endDate ? new Date(params.endDate) : new Date();

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var txSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.TRANSACTIONS);
  var txData = txSheet.getDataRange().getValues();

  var totalSales = 0;
  var totalCount = 0;
  var cashSales = 0;
  var creditSales = 0;

  for (var i = 1; i < txData.length; i++) {
    var tx = txData[i];
    if (!tx[0]) continue;

    var txDate = new Date(tx[2]);
    if (txDate < startDate || txDate > endDate) continue;

    if (tx[3] === 'sale') {
      var amount = parseFloat(tx[7]) || 0;
      totalSales += amount;
      totalCount++;

      if (tx[8] === 'Cash') {
        cashSales += amount;
      } else {
        creditSales += amount;
      }
    }
  }

  return {
    success: true,
    data: {
      period: {
        startDate: startDate,
        endDate: endDate
      },
      totalSales: totalSales,
      totalCount: totalCount,
      cashSales: cashSales,
      creditSales: creditSales,
      averageSale: totalCount > 0 ? totalSales / totalCount : 0
    }
  };
}

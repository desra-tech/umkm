/**
 * Financial Reports
 * Handles Profit/Loss Statement, Balance Sheet, and Cash Flow Reports
 */

/**
 * Generate Profit/Loss Report (Laporan Laba Rugi)
 */
function getProfitLossReport(startDate, endDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();
    const accountsSheet = getSheet(SHEETS.ACCOUNTS);
    const accountsData = accountsSheet.getDataRange().getValues();

    // Create account map for quick lookup
    const accountMap = {};
    for (let i = 1; i < accountsData.length; i++) {
      accountMap[accountsData[i][0]] = {
        name: accountsData[i][1],
        type: accountsData[i][2],
        category: accountsData[i][3]
      };
    }

    // Initialize totals
    let totalRevenue = 0;
    let totalCOGS = 0;
    let totalExpenses = 0;
    const revenueDetails = {};
    const expenseDetails = {};

    // Process transactions
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const transactionDate = new Date(row[1]);
      const accountCode = row[4];
      const debit = parseFloat(row[5] || 0);
      const credit = parseFloat(row[6] || 0);
      const status = row[12];

      // Apply date filter
      if (startDate && transactionDate < new Date(startDate)) continue;
      if (endDate && transactionDate > new Date(endDate)) continue;
      if (status !== 'Active') continue;

      const account = accountMap[accountCode];
      if (!account) continue;

      // Calculate based on account type
      if (account.type === 'Pendapatan') {
        // Revenue accounts: credit increases, debit decreases
        const amount = credit - debit;
        totalRevenue += amount;

        if (!revenueDetails[accountCode]) {
          revenueDetails[accountCode] = {
            name: account.name,
            amount: 0
          };
        }
        revenueDetails[accountCode].amount += amount;
      } else if (account.type === 'Beban') {
        // Expense accounts: debit increases, credit decreases
        const amount = debit - credit;

        if (account.category === 'Beban Pokok') {
          totalCOGS += amount;
        } else {
          totalExpenses += amount;
        }

        if (!expenseDetails[accountCode]) {
          expenseDetails[accountCode] = {
            name: account.name,
            category: account.category,
            amount: 0
          };
        }
        expenseDetails[accountCode].amount += amount;
      }
    }

    // Calculate profit/loss
    const grossProfit = totalRevenue - totalCOGS;
    const operatingProfit = grossProfit - totalExpenses;
    const netProfit = operatingProfit;

    return {
      success: true,
      data: {
        period: {
          startDate: startDate,
          endDate: endDate
        },
        revenue: {
          total: totalRevenue,
          details: revenueDetails
        },
        cogs: {
          total: totalCOGS
        },
        grossProfit: grossProfit,
        expenses: {
          total: totalExpenses,
          details: expenseDetails
        },
        operatingProfit: operatingProfit,
        netProfit: netProfit,
        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0
      }
    };
  } catch (error) {
    Logger.log('Error generating profit/loss report: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate Balance Sheet (Laporan Posisi Keuangan/Neraca)
 */
function getBalanceSheet(asOfDate) {
  try {
    requireAuth();

    if (!asOfDate) {
      asOfDate = new Date();
    }

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();
    const accountsSheet = getSheet(SHEETS.ACCOUNTS);
    const accountsData = accountsSheet.getDataRange().getValues();

    // Create account map
    const accountMap = {};
    for (let i = 1; i < accountsData.length; i++) {
      accountMap[accountsData[i][0]] = {
        name: accountsData[i][1],
        type: accountsData[i][2],
        category: accountsData[i][3]
      };
    }

    // Initialize balances
    const assets = {};
    const liabilities = {};
    const equity = {};
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    // Process transactions up to the specified date
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const transactionDate = new Date(row[1]);
      const accountCode = row[4];
      const debit = parseFloat(row[5] || 0);
      const credit = parseFloat(row[6] || 0);
      const status = row[12];

      // Only include transactions up to the specified date
      if (transactionDate > new Date(asOfDate)) continue;
      if (status !== 'Active') continue;

      const account = accountMap[accountCode];
      if (!account) continue;

      // Calculate balances based on account type
      if (account.type === 'Aset') {
        // Assets: debit increases, credit decreases
        const amount = debit - credit;

        if (!assets[accountCode]) {
          assets[accountCode] = {
            name: account.name,
            category: account.category,
            balance: 0
          };
        }
        assets[accountCode].balance += amount;
      } else if (account.type === 'Liabilitas') {
        // Liabilities: credit increases, debit decreases
        const amount = credit - debit;

        if (!liabilities[accountCode]) {
          liabilities[accountCode] = {
            name: account.name,
            category: account.category,
            balance: 0
          };
        }
        liabilities[accountCode].balance += amount;
      } else if (account.type === 'Ekuitas') {
        // Equity: credit increases, debit decreases
        const amount = credit - debit;

        if (!equity[accountCode]) {
          equity[accountCode] = {
            name: account.name,
            category: account.category,
            balance: 0
          };
        }
        equity[accountCode].balance += amount;
      }
    }

    // Calculate totals
    for (const code in assets) {
      totalAssets += assets[code].balance;
    }
    for (const code in liabilities) {
      totalLiabilities += liabilities[code].balance;
    }
    for (const code in equity) {
      totalEquity += equity[code].balance;
    }

    // Add net profit to equity
    const profitLoss = getProfitLossReport(null, asOfDate);
    if (profitLoss.success) {
      const netProfit = profitLoss.data.netProfit;
      totalEquity += netProfit;
      equity['net-profit'] = {
        name: 'Laba Tahun Berjalan',
        category: 'Modal',
        balance: netProfit
      };
    }

    return {
      success: true,
      data: {
        asOfDate: asOfDate,
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
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
      }
    };
  } catch (error) {
    Logger.log('Error generating balance sheet: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate Cash Flow Report (Laporan Arus Kas)
 */
function getCashFlowReport(startDate, endDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();

    // Initialize cash flow categories
    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;

    const operatingDetails = [];
    const investingDetails = [];
    const financingDetails = [];

    // Get opening balance
    let openingBalance = 0;
    const cashAccounts = ['1-1001', '1-1002']; // Kas and Bank

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const transactionDate = new Date(row[1]);
      const accountCode = row[4];
      const debit = parseFloat(row[5] || 0);
      const credit = parseFloat(row[6] || 0);
      const description = row[7];
      const transactionType = row[2];
      const status = row[12];

      if (status !== 'Active') continue;

      // Calculate opening balance (transactions before start date)
      if (startDate && transactionDate < new Date(startDate)) {
        if (cashAccounts.includes(accountCode)) {
          openingBalance += debit - credit;
        }
        continue;
      }

      // Apply date filter
      if (endDate && transactionDate > new Date(endDate)) continue;

      // Only process cash accounts
      if (!cashAccounts.includes(accountCode)) continue;

      const amount = debit - credit;
      const detail = {
        date: row[1],
        description: description,
        amount: amount
      };

      // Categorize cash flows
      if (transactionType === 'Modal') {
        // Financing activities
        financingActivities += amount;
        financingDetails.push(detail);
      } else if (accountCode.startsWith('1-2')) {
        // Investing activities (fixed assets)
        investingActivities += amount;
        investingDetails.push(detail);
      } else {
        // Operating activities (default)
        operatingActivities += amount;
        operatingDetails.push(detail);
      }
    }

    const netCashFlow = operatingActivities + investingActivities + financingActivities;
    const closingBalance = openingBalance + netCashFlow;

    return {
      success: true,
      data: {
        period: {
          startDate: startDate,
          endDate: endDate
        },
        openingBalance: openingBalance,
        operatingActivities: {
          total: operatingActivities,
          details: operatingDetails
        },
        investingActivities: {
          total: investingActivities,
          details: investingDetails
        },
        financingActivities: {
          total: financingActivities,
          details: financingDetails
        },
        netCashFlow: netCashFlow,
        closingBalance: closingBalance
      }
    };
  } catch (error) {
    Logger.log('Error generating cash flow report: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get dashboard summary
 */
function getDashboardSummary() {
  try {
    requireAuth();

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Get current month profit/loss
    const profitLoss = getProfitLossReport(firstDayOfMonth, lastDayOfMonth);

    // Get current balance sheet
    const balanceSheet = getBalanceSheet(today);

    // Get cash balance
    const cashFlow = getCashFlowReport(firstDayOfMonth, lastDayOfMonth);

    // Get low stock products
    const lowStock = getLowStockProducts();

    // Get pending receivables
    const receivables = getReceivables({ status: 'Unpaid' });
    let totalReceivables = 0;
    if (receivables.success) {
      receivables.data.forEach(r => {
        totalReceivables += parseFloat(r.balance || 0);
      });
    }

    // Get pending payables
    const payables = getPayables({ status: 'Unpaid' });
    let totalPayables = 0;
    if (payables.success) {
      payables.data.forEach(p => {
        totalPayables += parseFloat(p.balance || 0);
      });
    }

    return {
      success: true,
      data: {
        currentMonth: {
          revenue: profitLoss.success ? profitLoss.data.revenue.total : 0,
          expenses: profitLoss.success ? profitLoss.data.expenses.total : 0,
          netProfit: profitLoss.success ? profitLoss.data.netProfit : 0
        },
        financial: {
          totalAssets: balanceSheet.success ? balanceSheet.data.assets.total : 0,
          totalLiabilities: balanceSheet.success ? balanceSheet.data.liabilities.total : 0,
          totalEquity: balanceSheet.success ? balanceSheet.data.equity.total : 0,
          cashBalance: cashFlow.success ? cashFlow.data.closingBalance : 0
        },
        operations: {
          lowStockCount: lowStock.success ? lowStock.data.length : 0,
          pendingReceivables: totalReceivables,
          pendingPayables: totalPayables
        }
      }
    };
  } catch (error) {
    Logger.log('Error getting dashboard summary: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Generate trial balance
 */
function getTrialBalance(startDate, endDate) {
  try {
    requireAuth();

    const sheet = getSheet(SHEETS.TRANSACTIONS);
    const data = sheet.getDataRange().getValues();
    const accountsSheet = getSheet(SHEETS.ACCOUNTS);
    const accountsData = accountsSheet.getDataRange().getValues();

    // Create account map
    const accountMap = {};
    for (let i = 1; i < accountsData.length; i++) {
      accountMap[accountsData[i][0]] = {
        name: accountsData[i][1],
        type: accountsData[i][2],
        category: accountsData[i][3],
        debit: 0,
        credit: 0
      };
    }

    // Process transactions
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const transactionDate = new Date(row[1]);
      const accountCode = row[4];
      const debit = parseFloat(row[5] || 0);
      const credit = parseFloat(row[6] || 0);
      const status = row[12];

      if (startDate && transactionDate < new Date(startDate)) continue;
      if (endDate && transactionDate > new Date(endDate)) continue;
      if (status !== 'Active') continue;

      if (accountMap[accountCode]) {
        accountMap[accountCode].debit += debit;
        accountMap[accountCode].credit += credit;
      }
    }

    // Convert to array and calculate balances
    const trialBalance = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const code in accountMap) {
      const account = accountMap[code];
      if (account.debit > 0 || account.credit > 0) {
        trialBalance.push({
          accountCode: code,
          accountName: account.name,
          accountType: account.type,
          debit: account.debit,
          credit: account.credit,
          balance: account.debit - account.credit
        });
        totalDebit += account.debit;
        totalCredit += account.credit;
      }
    }

    return {
      success: true,
      data: {
        period: {
          startDate: startDate,
          endDate: endDate
        },
        accounts: trialBalance,
        totals: {
          debit: totalDebit,
          credit: totalCredit,
          balanced: Math.abs(totalDebit - totalCredit) < 0.01
        }
      }
    };
  } catch (error) {
    Logger.log('Error generating trial balance: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Export report to CSV format
 */
function exportReportToCSV(reportType, reportData) {
  try {
    requireAuth();

    let csvContent = '';

    switch (reportType) {
      case 'profit_loss':
        csvContent = generateProfitLossCSV(reportData);
        break;
      case 'balance_sheet':
        csvContent = generateBalanceSheetCSV(reportData);
        break;
      case 'cash_flow':
        csvContent = generateCashFlowCSV(reportData);
        break;
      default:
        return {
          success: false,
          message: 'Tipe laporan tidak valid'
        };
    }

    return {
      success: true,
      data: csvContent,
      filename: `${reportType}_${formatDate(new Date())}.csv`
    };
  } catch (error) {
    Logger.log('Error exporting report: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Helper function to generate CSV content
 */
function generateProfitLossCSV(data) {
  let csv = 'LAPORAN LABA RUGI\n';
  csv += `Periode: ${data.period.startDate} s/d ${data.period.endDate}\n\n`;
  csv += 'Keterangan,Jumlah\n';
  csv += `PENDAPATAN,${data.revenue.total}\n`;
  csv += `BEBAN POKOK,${data.cogs.total}\n`;
  csv += `LABA KOTOR,${data.grossProfit}\n`;
  csv += `BEBAN OPERASIONAL,${data.expenses.total}\n`;
  csv += `LABA BERSIH,${data.netProfit}\n`;
  return csv;
}

function generateBalanceSheetCSV(data) {
  let csv = 'LAPORAN POSISI KEUANGAN (NERACA)\n';
  csv += `Per Tanggal: ${data.asOfDate}\n\n`;
  csv += 'ASET\n';
  csv += 'Keterangan,Jumlah\n';
  for (const code in data.assets.details) {
    csv += `${data.assets.details[code].name},${data.assets.details[code].balance}\n`;
  }
  csv += `TOTAL ASET,${data.assets.total}\n\n`;
  csv += 'LIABILITAS\n';
  for (const code in data.liabilities.details) {
    csv += `${data.liabilities.details[code].name},${data.liabilities.details[code].balance}\n`;
  }
  csv += `TOTAL LIABILITAS,${data.liabilities.total}\n\n`;
  csv += 'EKUITAS\n';
  for (const code in data.equity.details) {
    csv += `${data.equity.details[code].name},${data.equity.details[code].balance}\n`;
  }
  csv += `TOTAL EKUITAS,${data.equity.total}\n`;
  return csv;
}

function generateCashFlowCSV(data) {
  let csv = 'LAPORAN ARUS KAS\n';
  csv += `Periode: ${data.period.startDate} s/d ${data.period.endDate}\n\n`;
  csv += `Saldo Awal,${data.openingBalance}\n`;
  csv += `Aktivitas Operasional,${data.operatingActivities.total}\n`;
  csv += `Aktivitas Investasi,${data.investingActivities.total}\n`;
  csv += `Aktivitas Pendanaan,${data.financingActivities.total}\n`;
  csv += `Arus Kas Bersih,${data.netCashFlow}\n`;
  csv += `Saldo Akhir,${data.closingBalance}\n`;
  return csv;
}

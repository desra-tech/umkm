/**
 * UMKM Financial System - Main Code
 * Sistem Informasi Pembukuan Keuangan UMKM
 *
 * SECURITY FEATURES:
 * - Session-based authentication with timeout
 * - Password hashing with salt (SHA-256)
 * - Role-based access control (Admin/User)
 * - Input validation and sanitization
 * - SQL injection prevention
 * - XSS prevention
 * - CSRF token protection
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  APP_NAME: 'UMKM Financial System',
  VERSION: '1.0.0',
  SESSION_TIMEOUT: 30, // minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15, // minutes
  PASSWORD_MIN_LENGTH: 8
};

// Sheet names
const SHEETS = {
  USERS: 'Users',
  ACCOUNTS: 'Accounts',
  CUSTOMERS: 'Customers',
  SUPPLIERS: 'Suppliers',
  PRODUCTS: 'Products',
  TRANSACTIONS: 'Transactions',
  SALES: 'Sales',
  PURCHASES: 'Purchases',
  RECEIVABLES: 'Receivables',
  PAYABLES: 'Payables',
  INVENTORY: 'Inventory',
  SETTINGS: 'Settings'
};

// User roles
const ROLES = {
  ADMIN: 'Admin',
  USER: 'User'
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Fungsi yang dipanggil saat web app dibuka
 */
function doGet(e) {
  try {
    // Check if user has valid session
    const session = getSession();

    let output;

    if (session && session.userId) {
      // User logged in, show main app
      output = HtmlService.createTemplateFromFile('Index')
        .evaluate()
        .setTitle(CONFIG.APP_NAME);
    } else {
      // User not logged in, show login page
      output = HtmlService.createTemplateFromFile('Login')
        .evaluate()
        .setTitle(CONFIG.APP_NAME + ' - Login');
    }

    // Add security headers and meta tags
    try {
      output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DENY);
    } catch (e) {
      // XFrameOptionsMode might not be available in some environments
      Logger.log('Warning: Could not set XFrameOptionsMode - ' + e.toString());
    }

    output.addMetaTag('viewport', 'width=device-width, initial-scale=1');

    return output;

  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return HtmlService.createHtmlOutput('<h1>Error loading application</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * Include HTML files (for templates)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  // If sheet doesn't exist, create it
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheetName, sheet);
  }

  return sheet;
}

/**
 * Initialize sheet with headers
 */
function initializeSheet(sheetName, sheet) {
  const headers = getSheetHeaders(sheetName);
  if (headers && headers.length > 0) {
    sheet.appendRow(headers);
    // Format header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
  }
}

/**
 * Get headers for each sheet
 */
function getSheetHeaders(sheetName) {
  const headersMap = {
    'Users': ['User ID', 'Username', 'Password Hash', 'Salt', 'Full Name', 'Role', 'Email', 'Phone', 'Status', 'Created Date', 'Last Login'],
    'Accounts': ['Account Code', 'Account Name', 'Account Type', 'Category', 'Parent Account', 'Description', 'Status', 'Created Date'],
    'Customers': ['Customer ID', 'Customer Name', 'Contact Person', 'Phone', 'Email', 'Address', 'City', 'Tax ID', 'Credit Limit', 'Status', 'Created Date'],
    'Suppliers': ['Supplier ID', 'Supplier Name', 'Contact Person', 'Phone', 'Email', 'Address', 'City', 'Tax ID', 'Payment Terms', 'Status', 'Created Date'],
    'Products': ['Product ID', 'Product Code', 'Product Name', 'Category', 'Unit', 'Purchase Price', 'Selling Price', 'Stock', 'Min Stock', 'Description', 'Status', 'Created Date'],
    'Transactions': ['Transaction ID', 'Date', 'Transaction Type', 'Reference No', 'Account Code', 'Debit', 'Credit', 'Description', 'Partner ID', 'Partner Type', 'Created By', 'Created Date', 'Status'],
    'Sales': ['Sale ID', 'Sale Date', 'Invoice No', 'Customer ID', 'Product ID', 'Quantity', 'Unit Price', 'Discount', 'Tax', 'Total', 'Payment Method', 'Created By', 'Created Date', 'Status'],
    'Purchases': ['Purchase ID', 'Purchase Date', 'PO No', 'Supplier ID', 'Product ID', 'Quantity', 'Unit Price', 'Discount', 'Tax', 'Total', 'Payment Status', 'Created By', 'Created Date', 'Status'],
    'Receivables': ['Receivable ID', 'Invoice No', 'Invoice Date', 'Due Date', 'Customer ID', 'Amount', 'Paid Amount', 'Balance', 'Status', 'Created By', 'Created Date'],
    'Payables': ['Payable ID', 'Invoice No', 'Invoice Date', 'Due Date', 'Supplier ID', 'Amount', 'Paid Amount', 'Balance', 'Status', 'Created By', 'Created Date'],
    'Inventory': ['Movement ID', 'Date', 'Product ID', 'Transaction Type', 'Reference No', 'Quantity In', 'Quantity Out', 'Balance', 'Notes', 'Created By', 'Created Date'],
    'Settings': ['Setting Key', 'Setting Value', 'Description', 'Updated Date']
  };

  return headersMap[sheetName] || [];
}

/**
 * Generate unique ID
 */
function generateId(prefix) {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 10000);
  return prefix + '-' + timestamp + '-' + random;
}

/**
 * Format date to string
 */
function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Get setting value
 */
function getSetting(key) {
  try {
    const sheet = getSheet(SHEETS.SETTINGS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        return data[i][1];
      }
    }
    return null;
  } catch (error) {
    Logger.log('Error getting setting: ' + error.toString());
    return null;
  }
}

/**
 * Set setting value
 */
function setSetting(key, value, description) {
  try {
    const sheet = getSheet(SHEETS.SETTINGS);
    const data = sheet.getDataRange().getValues();

    // Look for existing setting
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(value);
        sheet.getRange(i + 1, 4).setValue(formatDate(new Date()));
        return true;
      }
    }

    // Add new setting
    sheet.appendRow([key, value, description || '', formatDate(new Date())]);
    return true;
  } catch (error) {
    Logger.log('Error setting value: ' + error.toString());
    return false;
  }
}

/**
 * Initialize database with default data
 */
function initializeDatabase() {
  try {
    // Initialize all sheets
    Object.values(SHEETS).forEach(sheetName => {
      getSheet(sheetName);
    });

    // Add default accounts
    const accountsSheet = getSheet(SHEETS.ACCOUNTS);
    if (accountsSheet.getLastRow() === 1) { // Only headers
      const defaultAccounts = getDefaultAccounts();
      defaultAccounts.forEach(account => {
        accountsSheet.appendRow([
          account.code,
          account.name,
          account.type,
          account.category,
          account.parent || '',
          account.description || '',
          'Active',
          formatDate(new Date())
        ]);
      });
    }

    // Add default settings
    const settingsSheet = getSheet(SHEETS.SETTINGS);
    if (settingsSheet.getLastRow() === 1) { // Only headers
      const defaultSettings = getDefaultSettings();
      defaultSettings.forEach(setting => {
        settingsSheet.appendRow([
          setting.key,
          setting.value,
          setting.description,
          formatDate(new Date())
        ]);
      });
    }

    // Create default admin user if no users exist
    const usersSheet = getSheet(SHEETS.USERS);
    if (usersSheet.getLastRow() === 1) { // Only headers
      createDefaultAdmin();
    }

    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    Logger.log('Error initializing database: ' + error.toString());
    return { success: false, message: error.toString() };
  }
}

/**
 * Get default accounts
 */
function getDefaultAccounts() {
  return [
    {code: "1-1001", name: "Kas", type: "Aset", category: "Aset Lancar"},
    {code: "1-1002", name: "Bank", type: "Aset", category: "Aset Lancar"},
    {code: "1-1003", name: "Piutang Usaha", type: "Aset", category: "Aset Lancar"},
    {code: "1-1004", name: "Persediaan Barang", type: "Aset", category: "Aset Lancar"},
    {code: "1-1005", name: "Uang Muka", type: "Aset", category: "Aset Lancar"},
    {code: "1-2001", name: "Peralatan", type: "Aset", category: "Aset Tetap"},
    {code: "1-2002", name: "Kendaraan", type: "Aset", category: "Aset Tetap"},
    {code: "1-2003", name: "Gedung", type: "Aset", category: "Aset Tetap"},
    {code: "1-2004", name: "Akumulasi Penyusutan", type: "Aset", category: "Aset Tetap"},
    {code: "2-1001", name: "Utang Usaha", type: "Liabilitas", category: "Liabilitas Jangka Pendek"},
    {code: "2-1002", name: "Utang Gaji", type: "Liabilitas", category: "Liabilitas Jangka Pendek"},
    {code: "2-1003", name: "Utang Pajak", type: "Liabilitas", category: "Liabilitas Jangka Pendek"},
    {code: "2-2001", name: "Utang Bank", type: "Liabilitas", category: "Liabilitas Jangka Panjang"},
    {code: "3-1001", name: "Modal Pemilik", type: "Ekuitas", category: "Modal"},
    {code: "3-1002", name: "Prive/Penarikan Modal", type: "Ekuitas", category: "Modal"},
    {code: "3-1003", name: "Laba Ditahan", type: "Ekuitas", category: "Modal"},
    {code: "4-1001", name: "Pendapatan Penjualan", type: "Pendapatan", category: "Pendapatan Operasional"},
    {code: "4-1002", name: "Pendapatan Jasa", type: "Pendapatan", category: "Pendapatan Operasional"},
    {code: "4-2001", name: "Pendapatan Lain-lain", type: "Pendapatan", category: "Pendapatan Non-Operasional"},
    {code: "5-1001", name: "Harga Pokok Penjualan", type: "Beban", category: "Beban Pokok"},
    {code: "5-2001", name: "Beban Gaji", type: "Beban", category: "Beban Operasional"},
    {code: "5-2002", name: "Beban Sewa", type: "Beban", category: "Beban Operasional"},
    {code: "5-2003", name: "Beban Listrik & Air", type: "Beban", category: "Beban Operasional"},
    {code: "5-2004", name: "Beban Telepon & Internet", type: "Beban", category: "Beban Operasional"},
    {code: "5-2005", name: "Beban Perlengkapan", type: "Beban", category: "Beban Operasional"},
    {code: "5-2006", name: "Beban Transport", type: "Beban", category: "Beban Operasional"},
    {code: "5-2007", name: "Beban Pemeliharaan", type: "Beban", category: "Beban Operasional"},
    {code: "5-2008", name: "Beban Penyusutan", type: "Beban", category: "Beban Operasional"},
    {code: "5-3001", name: "Beban Bunga", type: "Beban", category: "Beban Non-Operasional"},
    {code: "5-3002", name: "Beban Lain-lain", type: "Beban", category: "Beban Non-Operasional"}
  ];
}

/**
 * Get default settings
 */
function getDefaultSettings() {
  return [
    {key: "company_name", value: "Nama UMKM Anda", description: "Nama perusahaan"},
    {key: "company_address", value: "", description: "Alamat perusahaan"},
    {key: "company_phone", value: "", description: "Nomor telepon"},
    {key: "company_email", value: "", description: "Email perusahaan"},
    {key: "tax_rate", value: "11", description: "Tarif pajak (%)"},
    {key: "fiscal_year_start", value: "01-01", description: "Awal tahun fiskal (MM-DD)"},
    {key: "currency", value: "IDR", description: "Mata uang"},
    {key: "session_timeout", value: "30", description: "Timeout sesi (menit)"}
  ];
}

/**
 * Verify all required HTML files are uploaded
 */
function verifyHtmlFiles() {
  const requiredFiles = [
    'Login', 'Index', 'Styles', 'Scripts', 'Dashboard',
    'Penerimaan', 'Pengeluaran', 'Modal',
    'Accounts', 'Customers', 'Suppliers', 'Products',
    'POS', 'Inventory', 'Receivables', 'Payables',
    'ProfitLoss', 'BalanceSheet', 'CashFlow',
    'Users', 'Settings'
  ];

  Logger.log('Verifying HTML files...');
  Logger.log('Required files: ' + requiredFiles.length);

  const missingFiles = [];
  const foundFiles = [];

  requiredFiles.forEach(function(filename) {
    try {
      HtmlService.createHtmlOutputFromFile(filename);
      foundFiles.push(filename);
      Logger.log('✓ ' + filename + '.html found');
    } catch (error) {
      missingFiles.push(filename);
      Logger.log('✗ ' + filename + '.html MISSING');
    }
  });

  Logger.log('\n=== VERIFICATION RESULT ===');
  Logger.log('Found: ' + foundFiles.length + ' files');
  Logger.log('Missing: ' + missingFiles.length + ' files');

  if (missingFiles.length > 0) {
    Logger.log('\n⚠️ MISSING FILES:');
    missingFiles.forEach(function(file) {
      Logger.log('  - ' + file + '.html');
    });
    Logger.log('\nUpload missing files to fix "No HTML file named [Name] was found" errors');
    return {
      success: false,
      message: 'Missing ' + missingFiles.length + ' files',
      missingFiles: missingFiles,
      foundFiles: foundFiles
    };
  } else {
    Logger.log('\n✓ All HTML files are present!');
    return {
      success: true,
      message: 'All HTML files verified',
      foundFiles: foundFiles
    };
  }
}

/**
 * Test function to verify setup
 */
function testSetup() {
  Logger.log('Testing UMKM Financial System setup...');

  try {
    // Test spreadsheet access
    const ss = getSpreadsheet();
    Logger.log('✓ Spreadsheet accessible: ' + ss.getName());

    // Test sheet creation
    const testSheet = getSheet(SHEETS.USERS);
    Logger.log('✓ Sheet creation works');

    // Verify HTML files
    const htmlVerification = verifyHtmlFiles();
    if (!htmlVerification.success) {
      Logger.log('⚠️ Warning: Some HTML files are missing');
      Logger.log('Missing files: ' + htmlVerification.missingFiles.join(', '));
    }

    // Test database initialization
    const initResult = initializeDatabase();
    Logger.log('✓ Database initialization: ' + JSON.stringify(initResult));

    // Test security functions
    const testHash = hashPassword('test123', 'salt123');
    Logger.log('✓ Password hashing works');

    Logger.log('\nSetup test completed!');
    return htmlVerification.success;
  } catch (error) {
    Logger.log('✗ Test failed: ' + error.toString());
    return false;
  }
}

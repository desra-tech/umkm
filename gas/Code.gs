/**
 * UMKM Accounting System - Main Entry Point
 * Created with Security Best Practices
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Copy this Script ID and bind it to the spreadsheet
 * 3. Run setupDatabase() function once to initialize all sheets
 * 4. Set SPREADSHEET_ID in Config
 */

// ============================================
// CONFIGURATION
// ============================================

var CONFIG = {
  SPREADSHEET_ID: SpreadsheetApp.getActiveSpreadsheet().getId(), // Auto-detect
  SHEET_NAMES: {
    USERS: 'Users',
    ACCOUNTS: 'Accounts',
    CUSTOMERS: 'Customers',
    SUPPLIERS: 'Suppliers',
    PRODUCTS: 'Products',
    TRANSACTIONS: 'Transactions',
    TRANSACTION_DETAILS: 'TransactionDetails',
    INVENTORY: 'Inventory',
    RECEIVABLES: 'Receivables',
    PAYABLES: 'Payables',
    SETTINGS: 'Settings'
  },
  SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000 // 15 minutes
};

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Generate a secure random token
 */
function generateSecureToken() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var token = '';
  for (var i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token + '_' + new Date().getTime();
}

/**
 * Hash password using SHA-256
 */
function hashPassword(password, salt) {
  if (!salt) {
    salt = Utilities.getUuid();
  }
  var combined = password + salt;
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined);
  var hashString = hash.map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
  return {
    hash: hashString,
    salt: salt
  };
}

/**
 * Verify password against hash
 */
function verifyPassword(password, hash, salt) {
  var computed = hashPassword(password, salt);
  return computed.hash === hash;
}

/**
 * Sanitize input to prevent injection
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/[<>\"']/g, '').trim();
}

/**
 * Validate session token
 */
function validateSession(token) {
  if (!token) return null;

  var cache = CacheService.getUserCache();
  var sessionData = cache.get('session_' + token);

  if (!sessionData) return null;

  try {
    var session = JSON.parse(sessionData);
    var now = new Date().getTime();

    if (now - session.lastActivity > CONFIG.SESSION_TIMEOUT) {
      cache.remove('session_' + token);
      return null;
    }

    // Update last activity
    session.lastActivity = now;
    cache.put('session_' + token, JSON.stringify(session), 7200); // 2 hours max

    return session;
  } catch (e) {
    Logger.log('Session validation error: ' + e);
    return null;
  }
}

/**
 * Check if user has permission for an action
 */
function hasPermission(role, action) {
  var permissions = {
    'admin': ['all'],
    'user': [
      'view_transactions',
      'create_receipt',
      'create_payment',
      'view_reports',
      'view_pos',
      'create_sale',
      'view_inventory',
      'view_receivables',
      'view_payables'
    ]
  };

  if (permissions[role] && permissions[role].indexOf('all') !== -1) {
    return true;
  }

  return permissions[role] && permissions[role].indexOf(action) !== -1;
}

// ============================================
// WEB APP HANDLERS
// ============================================

/**
 * Serve HTML page
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('UMKM Accounting System')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Include HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Main API handler
 */
function handleRequest(action, params, token) {
  try {
    // Public actions (no authentication required)
    var publicActions = ['login', 'testConnection'];

    if (publicActions.indexOf(action) === -1) {
      // Validate session
      var session = validateSession(token);
      if (!session) {
        return {
          success: false,
          error: 'Session expired or invalid. Please login again.'
        };
      }

      // Check permissions
      var requiredPermission = getRequiredPermission(action);
      if (requiredPermission && !hasPermission(session.role, requiredPermission)) {
        return {
          success: false,
          error: 'Access denied. Insufficient permissions.'
        };
      }

      // Add user info to params
      params.currentUser = session.username;
      params.currentRole = session.role;
    }

    // Route to appropriate handler
    switch(action) {
      // Auth
      case 'login':
        return handleLogin(params);
      case 'logout':
        return handleLogout(token);
      case 'changePassword':
        return handleChangePassword(params, token);

      // Master Data
      case 'getAccounts':
        return getAccounts();
      case 'saveAccount':
        return saveAccount(params);
      case 'deleteAccount':
        return deleteAccount(params);

      case 'getCustomers':
        return getCustomers();
      case 'saveCustomer':
        return saveCustomer(params);
      case 'deleteCustomer':
        return deleteCustomer(params);

      case 'getSuppliers':
        return getSuppliers();
      case 'saveSupplier':
        return saveSupplier(params);
      case 'deleteSupplier':
        return deleteSupplier(params);

      case 'getProducts':
        return getProducts();
      case 'saveProduct':
        return saveProduct(params);
      case 'deleteProduct':
        return deleteProduct(params);

      // Transactions
      case 'getTransactions':
        return getTransactions(params);
      case 'saveTransaction':
        return saveTransaction(params);
      case 'deleteTransaction':
        return deleteTransaction(params);

      // Reports
      case 'getIncomeStatement':
        return getIncomeStatement(params);
      case 'getBalanceSheet':
        return getBalanceSheet(params);
      case 'getCashFlow':
        return getCashFlow(params);

      // Business Management
      case 'createSale':
        return createSale(params);
      case 'getInventory':
        return getInventory();
      case 'getReceivables':
        return getReceivables();
      case 'getPayables':
        return getPayables();
      case 'recordPayment':
        return recordPayment(params);

      // Test
      case 'testConnection':
        return { success: true, message: 'Connection OK' };

      default:
        return {
          success: false,
          error: 'Unknown action: ' + action
        };
    }
  } catch (error) {
    Logger.log('Error in handleRequest: ' + error.toString());
    return {
      success: false,
      error: 'Server error: ' + error.message
    };
  }
}

/**
 * Get required permission for action
 */
function getRequiredPermission(action) {
  var permissionMap = {
    'getAccounts': 'all',
    'saveAccount': 'all',
    'deleteAccount': 'all',
    'getCustomers': 'all',
    'saveCustomer': 'all',
    'deleteCustomer': 'all',
    'getSuppliers': 'all',
    'saveSupplier': 'all',
    'deleteSupplier': 'all',
    'getProducts': 'all',
    'saveProduct': 'all',
    'deleteProduct': 'all',
    'getTransactions': 'view_transactions',
    'saveTransaction': 'create_receipt',
    'deleteTransaction': 'all',
    'getIncomeStatement': 'view_reports',
    'getBalanceSheet': 'view_reports',
    'getCashFlow': 'view_reports',
    'createSale': 'create_sale',
    'getInventory': 'view_inventory',
    'getReceivables': 'view_receivables',
    'getPayables': 'view_payables',
    'recordPayment': 'all'
  };

  return permissionMap[action];
}

// ============================================
// AUTHENTICATION HANDLERS
// ============================================

/**
 * Handle login request
 */
function handleLogin(params) {
  var username = sanitizeInput(params.username);
  var password = params.password;

  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required'
    };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.USERS);

  if (!userSheet) {
    return {
      success: false,
      error: 'System not initialized. Please run setupDatabase() first.'
    };
  }

  var data = userSheet.getDataRange().getValues();
  var headers = data[0];

  // Find user
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[1] === username && row[6] === 'active') { // username and status
      var storedHash = row[2];
      var salt = row[3];
      var role = row[4];
      var loginAttempts = row[7] || 0;
      var lockoutUntil = row[8] || 0;

      // Check lockout
      if (lockoutUntil && new Date().getTime() < lockoutUntil) {
        return {
          success: false,
          error: 'Account locked. Please try again later.'
        };
      }

      // Verify password
      if (verifyPassword(password, storedHash, salt)) {
        // Reset login attempts
        userSheet.getRange(i + 1, 8).setValue(0);
        userSheet.getRange(i + 1, 9).setValue('');

        // Update last login
        userSheet.getRange(i + 1, 10).setValue(new Date());

        // Create session
        var token = generateSecureToken();
        var session = {
          username: username,
          role: role,
          lastActivity: new Date().getTime()
        };

        var cache = CacheService.getUserCache();
        cache.put('session_' + token, JSON.stringify(session), 7200);

        return {
          success: true,
          token: token,
          username: username,
          role: role
        };
      } else {
        // Increment login attempts
        loginAttempts++;
        userSheet.getRange(i + 1, 8).setValue(loginAttempts);

        if (loginAttempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
          var lockoutTime = new Date().getTime() + CONFIG.LOCKOUT_DURATION;
          userSheet.getRange(i + 1, 9).setValue(lockoutTime);
          return {
            success: false,
            error: 'Too many failed attempts. Account locked for 15 minutes.'
          };
        }

        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
    }
  }

  return {
    success: false,
    error: 'Invalid username or password'
  };
}

/**
 * Handle logout request
 */
function handleLogout(token) {
  if (token) {
    var cache = CacheService.getUserCache();
    cache.remove('session_' + token);
  }

  return {
    success: true,
    message: 'Logged out successfully'
  };
}

/**
 * Handle change password request
 */
function handleChangePassword(params, token) {
  var session = validateSession(token);
  if (!session) {
    return { success: false, error: 'Invalid session' };
  }

  var oldPassword = params.oldPassword;
  var newPassword = params.newPassword;

  if (!oldPassword || !newPassword) {
    return { success: false, error: 'Old and new passwords are required' };
  }

  if (newPassword.length < CONFIG.PASSWORD_MIN_LENGTH) {
    return {
      success: false,
      error: 'Password must be at least ' + CONFIG.PASSWORD_MIN_LENGTH + ' characters'
    };
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.USERS);
  var data = userSheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[1] === session.username) {
      var storedHash = row[2];
      var salt = row[3];

      if (!verifyPassword(oldPassword, storedHash, salt)) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      var newHash = hashPassword(newPassword);
      userSheet.getRange(i + 1, 3).setValue(newHash.hash);
      userSheet.getRange(i + 1, 4).setValue(newHash.salt);

      return { success: true, message: 'Password changed successfully' };
    }
  }

  return { success: false, error: 'User not found' };
}

// ============================================
// DATABASE SETUP
// ============================================

/**
 * Initialize database structure
 * Run this function once after creating the spreadsheet
 */
function setupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Users sheet
  createSheet(ss, CONFIG.SHEET_NAMES.USERS, [
    'ID', 'Username', 'Password Hash', 'Salt', 'Role', 'Full Name',
    'Status', 'Login Attempts', 'Lockout Until', 'Last Login', 'Created Date'
  ]);

  // Create Accounts sheet (Chart of Accounts)
  createSheet(ss, CONFIG.SHEET_NAMES.ACCOUNTS, [
    'ID', 'Code', 'Name', 'Type', 'Category', 'Parent', 'Description',
    'Is Active', 'Created Date', 'Created By'
  ]);

  // Create Customers sheet
  createSheet(ss, CONFIG.SHEET_NAMES.CUSTOMERS, [
    'ID', 'Code', 'Name', 'Contact', 'Phone', 'Email', 'Address',
    'Credit Limit', 'Is Active', 'Created Date', 'Created By'
  ]);

  // Create Suppliers sheet
  createSheet(ss, CONFIG.SHEET_NAMES.SUPPLIERS, [
    'ID', 'Code', 'Name', 'Contact', 'Phone', 'Email', 'Address',
    'Payment Terms', 'Is Active', 'Created Date', 'Created By'
  ]);

  // Create Products sheet
  createSheet(ss, CONFIG.SHEET_NAMES.PRODUCTS, [
    'ID', 'Code', 'Name', 'Category', 'Unit', 'Purchase Price', 'Selling Price',
    'Min Stock', 'Current Stock', 'Is Active', 'Created Date', 'Created By'
  ]);

  // Create Transactions sheet
  createSheet(ss, CONFIG.SHEET_NAMES.TRANSACTIONS, [
    'ID', 'Transaction Number', 'Date', 'Type', 'Account ID', 'Customer/Supplier ID',
    'Description', 'Amount', 'Payment Method', 'Reference', 'Status',
    'Created Date', 'Created By'
  ]);

  // Create Transaction Details sheet
  createSheet(ss, CONFIG.SHEET_NAMES.TRANSACTION_DETAILS, [
    'ID', 'Transaction ID', 'Product ID', 'Quantity', 'Unit Price', 'Subtotal',
    'Created Date'
  ]);

  // Create Inventory sheet
  createSheet(ss, CONFIG.SHEET_NAMES.INVENTORY, [
    'ID', 'Date', 'Product ID', 'Type', 'Quantity', 'Unit Price', 'Total',
    'Reference', 'Notes', 'Created Date', 'Created By'
  ]);

  // Create Receivables sheet
  createSheet(ss, CONFIG.SHEET_NAMES.RECEIVABLES, [
    'ID', 'Invoice Number', 'Customer ID', 'Date', 'Due Date', 'Amount',
    'Paid Amount', 'Balance', 'Status', 'Created Date', 'Created By'
  ]);

  // Create Payables sheet
  createSheet(ss, CONFIG.SHEET_NAMES.PAYABLES, [
    'ID', 'Bill Number', 'Supplier ID', 'Date', 'Due Date', 'Amount',
    'Paid Amount', 'Balance', 'Status', 'Created Date', 'Created By'
  ]);

  // Create Settings sheet
  createSheet(ss, CONFIG.SHEET_NAMES.SETTINGS, [
    'Key', 'Value', 'Description', 'Updated Date', 'Updated By'
  ]);

  // Create default admin user
  createDefaultAdmin();

  // Create default chart of accounts
  createDefaultAccounts();

  SpreadsheetApp.getUi().alert('Database setup completed successfully!\\n\\nDefault Admin:\\nUsername: admin\\nPassword: Admin123!\\n\\nPlease change the password after first login.');

  return { success: true, message: 'Database initialized successfully' };
}

/**
 * Create a sheet with headers
 */
function createSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
  } else {
    sheet.clear();
  }

  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  // Set default column width (faster than auto-resize)
  for (var i = 1; i <= headers.length; i++) {
    sheet.setColumnWidth(i, 120);
  }

  return sheet;
}

/**
 * Create default admin user
 */
function createDefaultAdmin() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var userSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.USERS);

  var adminPassword = 'Admin123!';
  var hashed = hashPassword(adminPassword);

  var userPassword = 'User123!';
  var userHashed = hashPassword(userPassword);

  // Use batch insert for faster performance
  var users = [
    [1, 'admin', hashed.hash, hashed.salt, 'admin', 'System Administrator', 'active', 0, '', new Date(), new Date()],
    [2, 'user', userHashed.hash, userHashed.salt, 'user', 'Regular User', 'active', 0, '', new Date(), new Date()]
  ];

  userSheet.getRange(2, 1, users.length, users[0].length).setValues(users);
}

/**
 * Create default chart of accounts for UMKM
 */
function createDefaultAccounts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var accountSheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

  var accounts = [
    // ASSETS (Aset)
    [1, '1-000', 'ASET', 'Asset', 'Header', '', 'Aset/Harta', true, new Date(), 'system'],
    [2, '1-100', 'Aset Lancar', 'Asset', 'Header', '1-000', 'Aset yang mudah dicairkan', true, new Date(), 'system'],
    [3, '1-101', 'Kas', 'Asset', 'Cash', '1-100', 'Kas di tangan', true, new Date(), 'system'],
    [4, '1-102', 'Bank', 'Asset', 'Bank', '1-100', 'Rekening bank', true, new Date(), 'system'],
    [5, '1-103', 'Piutang Usaha', 'Asset', 'Receivable', '1-100', 'Tagihan kepada pelanggan', true, new Date(), 'system'],
    [6, '1-104', 'Persediaan Barang', 'Asset', 'Inventory', '1-100', 'Stok barang dagangan', true, new Date(), 'system'],
    [7, '1-105', 'Uang Muka', 'Asset', 'Prepaid', '1-100', 'Pembayaran di muka', true, new Date(), 'system'],

    [8, '1-200', 'Aset Tetap', 'Asset', 'Header', '1-000', 'Aset jangka panjang', true, new Date(), 'system'],
    [9, '1-201', 'Peralatan', 'Asset', 'Fixed Asset', '1-200', 'Peralatan usaha', true, new Date(), 'system'],
    [10, '1-202', 'Kendaraan', 'Asset', 'Fixed Asset', '1-200', 'Kendaraan operasional', true, new Date(), 'system'],
    [11, '1-203', 'Bangunan', 'Asset', 'Fixed Asset', '1-200', 'Bangunan/gedung', true, new Date(), 'system'],
    [12, '1-204', 'Akumulasi Penyusutan', 'Asset', 'Accumulated Depreciation', '1-200', 'Akumulasi penyusutan aset', true, new Date(), 'system'],

    // LIABILITIES (Kewajiban)
    [13, '2-000', 'KEWAJIBAN', 'Liability', 'Header', '', 'Utang/Kewajiban', true, new Date(), 'system'],
    [14, '2-100', 'Kewajiban Lancar', 'Liability', 'Header', '2-000', 'Utang jangka pendek', true, new Date(), 'system'],
    [15, '2-101', 'Utang Usaha', 'Liability', 'Payable', '2-100', 'Utang kepada pemasok', true, new Date(), 'system'],
    [16, '2-102', 'Utang Bank', 'Liability', 'Loan', '2-100', 'Pinjaman bank jangka pendek', true, new Date(), 'system'],
    [17, '2-103', 'Utang Lain-lain', 'Liability', 'Other Payable', '2-100', 'Utang lainnya', true, new Date(), 'system'],

    [18, '2-200', 'Kewajiban Jangka Panjang', 'Liability', 'Header', '2-000', 'Utang jangka panjang', true, new Date(), 'system'],
    [19, '2-201', 'Utang Bank Jangka Panjang', 'Liability', 'Long Term Loan', '2-200', 'Pinjaman bank > 1 tahun', true, new Date(), 'system'],

    // EQUITY (Modal)
    [20, '3-000', 'MODAL', 'Equity', 'Header', '', 'Modal/Ekuitas', true, new Date(), 'system'],
    [21, '3-101', 'Modal Pemilik', 'Equity', 'Capital', '3-000', 'Setoran modal pemilik', true, new Date(), 'system'],
    [22, '3-102', 'Prive', 'Equity', 'Drawing', '3-000', 'Pengambilan pribadi pemilik', true, new Date(), 'system'],
    [23, '3-103', 'Laba Ditahan', 'Equity', 'Retained Earnings', '3-000', 'Akumulasi laba', true, new Date(), 'system'],

    // REVENUE (Pendapatan)
    [24, '4-000', 'PENDAPATAN', 'Revenue', 'Header', '', 'Pendapatan usaha', true, new Date(), 'system'],
    [25, '4-101', 'Pendapatan Penjualan', 'Revenue', 'Sales', '4-000', 'Pendapatan dari penjualan', true, new Date(), 'system'],
    [26, '4-102', 'Pendapatan Jasa', 'Revenue', 'Service Revenue', '4-000', 'Pendapatan dari jasa', true, new Date(), 'system'],
    [27, '4-103', 'Pendapatan Lain-lain', 'Revenue', 'Other Revenue', '4-000', 'Pendapatan di luar usaha utama', true, new Date(), 'system'],

    // COST OF GOODS SOLD (Harga Pokok Penjualan)
    [28, '5-000', 'HARGA POKOK PENJUALAN', 'Expense', 'Header', '', 'HPP', true, new Date(), 'system'],
    [29, '5-101', 'Pembelian Barang', 'Expense', 'COGS', '5-000', 'Pembelian barang dagangan', true, new Date(), 'system'],
    [30, '5-102', 'Ongkos Kirim Pembelian', 'Expense', 'COGS', '5-000', 'Biaya pengiriman pembelian', true, new Date(), 'system'],

    // EXPENSES (Beban)
    [31, '6-000', 'BEBAN OPERASIONAL', 'Expense', 'Header', '', 'Biaya operasional', true, new Date(), 'system'],
    [32, '6-101', 'Beban Gaji', 'Expense', 'Salary Expense', '6-000', 'Gaji karyawan', true, new Date(), 'system'],
    [33, '6-102', 'Beban Sewa', 'Expense', 'Rent Expense', '6-000', 'Sewa tempat usaha', true, new Date(), 'system'],
    [34, '6-103', 'Beban Listrik', 'Expense', 'Utility Expense', '6-000', 'Biaya listrik', true, new Date(), 'system'],
    [35, '6-104', 'Beban Air', 'Expense', 'Utility Expense', '6-000', 'Biaya air', true, new Date(), 'system'],
    [36, '6-105', 'Beban Telepon & Internet', 'Expense', 'Communication Expense', '6-000', 'Biaya komunikasi', true, new Date(), 'system'],
    [37, '6-106', 'Beban Transportasi', 'Expense', 'Transportation Expense', '6-000', 'Biaya transportasi', true, new Date(), 'system'],
    [38, '6-107', 'Beban Perlengkapan', 'Expense', 'Supplies Expense', '6-000', 'Biaya perlengkapan', true, new Date(), 'system'],
    [39, '6-108', 'Beban Pemeliharaan', 'Expense', 'Maintenance Expense', '6-000', 'Biaya perawatan', true, new Date(), 'system'],
    [40, '6-109', 'Beban Penyusutan', 'Expense', 'Depreciation Expense', '6-000', 'Penyusutan aset', true, new Date(), 'system'],
    [41, '6-110', 'Beban Pemasaran', 'Expense', 'Marketing Expense', '6-000', 'Biaya iklan & promosi', true, new Date(), 'system'],
    [42, '6-111', 'Beban Administrasi', 'Expense', 'Administrative Expense', '6-000', 'Biaya administrasi', true, new Date(), 'system'],
    [43, '6-112', 'Beban Lain-lain', 'Expense', 'Other Expense', '6-000', 'Beban operasional lainnya', true, new Date(), 'system']
  ];

  // Use batch insert for much faster performance
  if (accounts.length > 0) {
    accountSheet.getRange(2, 1, accounts.length, accounts[0].length).setValues(accounts);
  }
}

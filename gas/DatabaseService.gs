/**
 * Database Service - CRUD Operations for Master Data
 */

// ============================================
// ACCOUNTS (Chart of Accounts)
// ============================================

function getAccounts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    var data = sheet.getDataRange().getValues();
    var accounts = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) { // Check if ID exists
        accounts.push({
          id: data[i][0],
          code: data[i][1],
          name: data[i][2],
          type: data[i][3],
          category: data[i][4],
          parent: data[i][5],
          description: data[i][6],
          isActive: data[i][7],
          createdDate: data[i][8],
          createdBy: data[i][9]
        });
      }
    }

    return { success: true, data: accounts };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function saveAccount(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);

    params.code = sanitizeInput(params.code);
    params.name = sanitizeInput(params.name);

    if (params.id) {
      // Update existing
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.getRange(i + 1, 2, 1, 8).setValues([[
            params.code,
            params.name,
            params.type,
            params.category,
            params.parent || '',
            params.description || '',
            params.isActive !== false,
            new Date()
          ]]);
          return { success: true, message: 'Account updated successfully' };
        }
      }
    } else {
      // Create new
      var newId = getNextId(sheet);
      sheet.appendRow([
        newId,
        params.code,
        params.name,
        params.type,
        params.category,
        params.parent || '',
        params.description || '',
        params.isActive !== false,
        new Date(),
        params.currentUser || 'system'
      ]);
      return { success: true, message: 'Account created successfully', id: newId };
    }

    return { success: false, error: 'Account not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteAccount(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.ACCOUNTS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Account deleted successfully' };
      }
    }

    return { success: false, error: 'Account not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// CUSTOMERS
// ============================================

function getCustomers() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);
    var data = sheet.getDataRange().getValues();
    var customers = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        customers.push({
          id: data[i][0],
          code: data[i][1],
          name: data[i][2],
          contact: data[i][3],
          phone: data[i][4],
          email: data[i][5],
          address: data[i][6],
          creditLimit: data[i][7],
          isActive: data[i][8],
          createdDate: data[i][9],
          createdBy: data[i][10]
        });
      }
    }

    return { success: true, data: customers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function saveCustomer(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);

    params.code = sanitizeInput(params.code);
    params.name = sanitizeInput(params.name);
    params.email = sanitizeInput(params.email);

    if (params.id) {
      // Update existing
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.getRange(i + 1, 2, 1, 8).setValues([[
            params.code,
            params.name,
            params.contact || '',
            params.phone || '',
            params.email || '',
            params.address || '',
            params.creditLimit || 0,
            params.isActive !== false
          ]]);
          return { success: true, message: 'Customer updated successfully' };
        }
      }
    } else {
      // Create new
      var newId = getNextId(sheet);
      sheet.appendRow([
        newId,
        params.code,
        params.name,
        params.contact || '',
        params.phone || '',
        params.email || '',
        params.address || '',
        params.creditLimit || 0,
        params.isActive !== false,
        new Date(),
        params.currentUser || 'system'
      ]);
      return { success: true, message: 'Customer created successfully', id: newId };
    }

    return { success: false, error: 'Customer not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteCustomer(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.CUSTOMERS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Customer deleted successfully' };
      }
    }

    return { success: false, error: 'Customer not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// SUPPLIERS
// ============================================

function getSuppliers() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);
    var data = sheet.getDataRange().getValues();
    var suppliers = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        suppliers.push({
          id: data[i][0],
          code: data[i][1],
          name: data[i][2],
          contact: data[i][3],
          phone: data[i][4],
          email: data[i][5],
          address: data[i][6],
          paymentTerms: data[i][7],
          isActive: data[i][8],
          createdDate: data[i][9],
          createdBy: data[i][10]
        });
      }
    }

    return { success: true, data: suppliers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function saveSupplier(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);

    params.code = sanitizeInput(params.code);
    params.name = sanitizeInput(params.name);
    params.email = sanitizeInput(params.email);

    if (params.id) {
      // Update existing
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.getRange(i + 1, 2, 1, 8).setValues([[
            params.code,
            params.name,
            params.contact || '',
            params.phone || '',
            params.email || '',
            params.address || '',
            params.paymentTerms || '',
            params.isActive !== false
          ]]);
          return { success: true, message: 'Supplier updated successfully' };
        }
      }
    } else {
      // Create new
      var newId = getNextId(sheet);
      sheet.appendRow([
        newId,
        params.code,
        params.name,
        params.contact || '',
        params.phone || '',
        params.email || '',
        params.address || '',
        params.paymentTerms || '',
        params.isActive !== false,
        new Date(),
        params.currentUser || 'system'
      ]);
      return { success: true, message: 'Supplier created successfully', id: newId };
    }

    return { success: false, error: 'Supplier not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteSupplier(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.SUPPLIERS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Supplier deleted successfully' };
      }
    }

    return { success: false, error: 'Supplier not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// PRODUCTS
// ============================================

function getProducts() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    var data = sheet.getDataRange().getValues();
    var products = [];

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        products.push({
          id: data[i][0],
          code: data[i][1],
          name: data[i][2],
          category: data[i][3],
          unit: data[i][4],
          purchasePrice: data[i][5],
          sellingPrice: data[i][6],
          minStock: data[i][7],
          currentStock: data[i][8],
          isActive: data[i][9],
          createdDate: data[i][10],
          createdBy: data[i][11]
        });
      }
    }

    return { success: true, data: products };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function saveProduct(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);

    params.code = sanitizeInput(params.code);
    params.name = sanitizeInput(params.name);

    if (params.id) {
      // Update existing
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] == params.id) {
          sheet.getRange(i + 1, 2, 1, 9).setValues([[
            params.code,
            params.name,
            params.category || '',
            params.unit || '',
            parseFloat(params.purchasePrice) || 0,
            parseFloat(params.sellingPrice) || 0,
            parseFloat(params.minStock) || 0,
            parseFloat(params.currentStock) || 0,
            params.isActive !== false
          ]]);
          return { success: true, message: 'Product updated successfully' };
        }
      }
    } else {
      // Create new
      var newId = getNextId(sheet);
      sheet.appendRow([
        newId,
        params.code,
        params.name,
        params.category || '',
        params.unit || '',
        parseFloat(params.purchasePrice) || 0,
        parseFloat(params.sellingPrice) || 0,
        parseFloat(params.minStock) || 0,
        parseFloat(params.currentStock) || 0,
        params.isActive !== false,
        new Date(),
        params.currentUser || 'system'
      ]);
      return { success: true, message: 'Product created successfully', id: newId };
    }

    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function deleteProduct(params) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == params.id) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Product deleted successfully' };
      }
    }

    return { success: false, error: 'Product not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get next available ID for a sheet
 */
function getNextId(sheet) {
  var data = sheet.getDataRange().getValues();
  var maxId = 0;

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0] > maxId) {
      maxId = data[i][0];
    }
  }

  return maxId + 1;
}

/**
 * Get data by ID from sheet
 */
function getDataById(sheetName, id) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      return data[i];
    }
  }

  return null;
}

/**
 * Update stock for a product
 */
function updateProductStock(productId, quantity, type) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEET_NAMES.PRODUCTS);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == productId) {
      var currentStock = data[i][8] || 0;
      var newStock = type === 'in' ? currentStock + quantity : currentStock - quantity;
      sheet.getRange(i + 1, 9).setValue(newStock);
      return { success: true, newStock: newStock };
    }
  }

  return { success: false, error: 'Product not found' };
}

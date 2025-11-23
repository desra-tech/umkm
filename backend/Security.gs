/**
 * Security Functions
 * Additional security measures for the application
 */

/**
 * Sanitize input to prevent XSS and injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  input = input.replace(/<[^>]*>/g, '');

  // Escape special characters
  input = input.replace(/[<>"']/g, function(match) {
    const escapeMap = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    };
    return escapeMap[match];
  });

  // Remove any script-like patterns
  input = input.replace(/javascript:/gi, '');
  input = input.replace(/on\w+=/gi, '');

  return input.trim();
}

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  if (!phone) return false;
  // Indonesian phone number format
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate number
 */
function validateNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Validate date format
 */
function validateDate(dateString) {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  } catch (error) {
    return false;
  }
}

/**
 * Sanitize and validate account code
 */
function validateAccountCode(code) {
  if (!code) return false;
  // Format: X-XXXX (digit-digits)
  const codeRegex = /^[0-9]-[0-9]{4}$/;
  return codeRegex.test(code);
}

/**
 * Escape special characters for sheets
 */
function escapeSheetValue(value) {
  if (typeof value === 'string') {
    // Escape single quotes by doubling them
    value = value.replace(/'/g, "''");
  }
  return value;
}

/**
 * Log security event
 */
function logSecurityEvent(eventType, details) {
  try {
    const session = getSession();
    const username = session ? session.username : 'Anonymous';

    Logger.log(`[SECURITY] ${eventType} by ${username}: ${JSON.stringify(details)}`);

    // You can also log to a separate sheet if needed
    // const logSheet = getSheet('SecurityLog');
    // logSheet.appendRow([formatDate(new Date()), eventType, username, JSON.stringify(details)]);

  } catch (error) {
    Logger.log('Error logging security event: ' + error.toString());
  }
}

/**
 * Rate limiting check (simple implementation)
 */
function checkRateLimit(action, maxAttempts, timeWindow) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const key = 'rateLimit_' + action;
    const data = userProperties.getProperty(key);

    const now = new Date().getTime();

    if (!data) {
      // First attempt
      userProperties.setProperty(key, JSON.stringify({
        attempts: 1,
        firstAttempt: now
      }));
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    const rateLimitData = JSON.parse(data);

    // Check if time window has passed
    if (now - rateLimitData.firstAttempt > timeWindow) {
      // Reset
      userProperties.setProperty(key, JSON.stringify({
        attempts: 1,
        firstAttempt: now
      }));
      return { allowed: true, remaining: maxAttempts - 1 };
    }

    // Check if max attempts exceeded
    if (rateLimitData.attempts >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        message: 'Terlalu banyak percobaan. Silakan coba lagi nanti.'
      };
    }

    // Increment attempts
    rateLimitData.attempts++;
    userProperties.setProperty(key, JSON.stringify(rateLimitData));

    return {
      allowed: true,
      remaining: maxAttempts - rateLimitData.attempts
    };
  } catch (error) {
    Logger.log('Error checking rate limit: ' + error.toString());
    return { allowed: true, remaining: maxAttempts };
  }
}

/**
 * Validate transaction data
 */
function validateTransactionData(data) {
  const errors = [];

  // Validate date
  if (!data.date || !validateDate(data.date)) {
    errors.push('Tanggal tidak valid');
  }

  // Validate account code
  if (!data.accountCode) {
    errors.push('Kode akun harus diisi');
  }

  // Validate amounts
  if (data.debit !== undefined && data.debit !== '' && !validateNumber(data.debit)) {
    errors.push('Jumlah debit tidak valid');
  }

  if (data.credit !== undefined && data.credit !== '' && !validateNumber(data.credit)) {
    errors.push('Jumlah kredit tidak valid');
  }

  // Validate that either debit or credit is filled
  const hasDebit = data.debit !== undefined && data.debit !== '' && parseFloat(data.debit) > 0;
  const hasCredit = data.credit !== undefined && data.credit !== '' && parseFloat(data.credit) > 0;

  if (!hasDebit && !hasCredit) {
    errors.push('Jumlah debit atau kredit harus diisi');
  }

  if (hasDebit && hasCredit) {
    errors.push('Hanya boleh mengisi debit atau kredit, tidak keduanya');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate product data
 */
function validateProductData(data) {
  const errors = [];

  if (!data.productCode || data.productCode.trim() === '') {
    errors.push('Kode produk harus diisi');
  }

  if (!data.productName || data.productName.trim() === '') {
    errors.push('Nama produk harus diisi');
  }

  if (data.purchasePrice !== undefined && !validateNumber(data.purchasePrice)) {
    errors.push('Harga beli tidak valid');
  }

  if (data.sellingPrice !== undefined && !validateNumber(data.sellingPrice)) {
    errors.push('Harga jual tidak valid');
  }

  if (data.stock !== undefined && !validateNumber(data.stock)) {
    errors.push('Stok tidak valid');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validate customer/supplier data
 */
function validatePartnerData(data) {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Nama harus diisi');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Format email tidak valid');
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Format nomor telepon tidak valid');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Check for duplicate entries
 */
function checkDuplicate(sheetName, columnIndex, value) {
  try {
    const sheet = getSheet(sheetName);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][columnIndex] === value) {
        return true;
      }
    }

    return false;
  } catch (error) {
    Logger.log('Error checking duplicate: ' + error.toString());
    return false;
  }
}

/**
 * Backup data (admin only)
 */
function createBackup() {
  try {
    requireAdmin();

    const ss = getSpreadsheet();
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    const backupName = ss.getName() + '_Backup_' + timestamp;

    // Create a copy
    const backup = ss.copy(backupName);

    logSecurityEvent('BACKUP_CREATED', {
      backupId: backup.getId(),
      backupName: backupName
    });

    return {
      success: true,
      message: 'Backup berhasil dibuat',
      backupName: backupName,
      backupUrl: backup.getUrl()
    };
  } catch (error) {
    Logger.log('Error creating backup: ' + error.toString());
    return {
      success: false,
      message: 'Gagal membuat backup: ' + error.toString()
    };
  }
}

/**
 * Audit log function
 */
function logAudit(action, entityType, entityId, changes) {
  try {
    const session = getSession();
    const username = session ? session.username : 'System';

    Logger.log(`[AUDIT] ${action} ${entityType} ${entityId} by ${username}`);

    // You can create an audit log sheet if needed
    // const auditSheet = getSheet('AuditLog');
    // auditSheet.appendRow([
    //   formatDate(new Date()),
    //   username,
    //   action,
    //   entityType,
    //   entityId,
    //   JSON.stringify(changes)
    // ]);

  } catch (error) {
    Logger.log('Error logging audit: ' + error.toString());
  }
}

/**
 * Sanitize object data
 */
function sanitizeObject(obj) {
  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        sanitized[key] = sanitizeInput(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  return sanitized;
}

/**
 * Validate and sanitize bulk data
 */
function validateBulkData(dataArray, validationFunction) {
  const results = {
    valid: [],
    invalid: []
  };

  dataArray.forEach((item, index) => {
    const sanitized = sanitizeObject(item);
    const validation = validationFunction(sanitized);

    if (validation.valid) {
      results.valid.push(sanitized);
    } else {
      results.invalid.push({
        index: index,
        data: item,
        errors: validation.errors
      });
    }
  });

  return results;
}

/**
 * Encrypt sensitive data (simple obfuscation for additional layer)
 */
function obfuscateData(data) {
  try {
    const encoded = Utilities.base64Encode(data);
    return encoded;
  } catch (error) {
    Logger.log('Error obfuscating data: ' + error.toString());
    return data;
  }
}

/**
 * Decrypt obfuscated data
 */
function deobfuscateData(data) {
  try {
    const decoded = Utilities.base64Decode(data);
    return Utilities.newBlob(decoded).getDataAsString();
  } catch (error) {
    Logger.log('Error deobfuscating data: ' + error.toString());
    return data;
  }
}

/**
 * Check for SQL injection patterns (just in case)
 */
function checkSqlInjection(input) {
  if (typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*|;|'|"|\||&)/g,
    /(\bOR\b|\bAND\b).*=.*/gi
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      logSecurityEvent('SQL_INJECTION_ATTEMPT', { input: input });
      return true;
    }
  }

  return false;
}

/**
 * Validate file upload (if implemented)
 */
function validateFileUpload(filename, filesize, allowedTypes) {
  const errors = [];

  // Check file extension
  const extension = filename.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(extension)) {
    errors.push('Tipe file tidak diizinkan');
  }

  // Check file size (in bytes)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (filesize > maxSize) {
    errors.push('Ukuran file terlalu besar (maksimal 5MB)');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}

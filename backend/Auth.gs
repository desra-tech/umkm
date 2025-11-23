/**
 * Authentication and Session Management
 * Handles user authentication with security features
 */

/**
 * Hash password with salt using SHA-256
 */
function hashPassword(password, salt) {
  try {
    const combined = password + salt;
    const hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      combined,
      Utilities.Charset.UTF_8
    );

    // Convert to hex string
    return hash.map(function(byte) {
      const v = (byte < 0) ? 256 + byte : byte;
      return ('0' + v.toString(16)).slice(-2);
    }).join('');
  } catch (error) {
    Logger.log('Error hashing password: ' + error.toString());
    return null;
  }
}

/**
 * Generate random salt
 */
function generateSalt() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let salt = '';
  for (let i = 0; i < 32; i++) {
    salt += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return salt;
}

/**
 * Create default admin user
 */
function createDefaultAdmin() {
  try {
    const sheet = getSheet(SHEETS.USERS);
    const salt = generateSalt();
    const password = 'admin123'; // Default password - MUST BE CHANGED
    const passwordHash = hashPassword(password, salt);

    sheet.appendRow([
      generateId('USR'),
      'admin',
      passwordHash,
      salt,
      'Administrator',
      ROLES.ADMIN,
      '',
      '',
      'Active',
      formatDate(new Date()),
      ''
    ]);

    Logger.log('Default admin created with username: admin, password: admin123');
    return true;
  } catch (error) {
    Logger.log('Error creating default admin: ' + error.toString());
    return false;
  }
}

/**
 * Validate password strength
 */
function validatePassword(password) {
  if (!password || password.length < CONFIG.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password minimal ${CONFIG.PASSWORD_MIN_LENGTH} karakter`
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal 1 angka'
    };
  }

  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: 'Password harus mengandung minimal 1 huruf'
    };
  }

  return { valid: true, message: 'Password valid' };
}

/**
 * Login user
 */
function login(username, password) {
  try {
    // Input validation
    if (!username || !password) {
      return {
        success: false,
        message: 'Username dan password harus diisi'
      };
    }

    // Sanitize input
    username = sanitizeInput(username);

    // Get user data
    const sheet = getSheet(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const userId = row[0];
      const dbUsername = row[1];
      const passwordHash = row[2];
      const salt = row[3];
      const fullName = row[4];
      const role = row[5];
      const status = row[8];

      if (dbUsername === username) {
        // Check if user is active
        if (status !== 'Active') {
          return {
            success: false,
            message: 'Akun tidak aktif. Hubungi administrator.'
          };
        }

        // Verify password
        const inputHash = hashPassword(password, salt);
        if (inputHash === passwordHash) {
          // Update last login
          sheet.getRange(i + 1, 11).setValue(formatDate(new Date()));

          // Create session
          const session = {
            userId: userId,
            username: username,
            fullName: fullName,
            role: role,
            loginTime: new Date().getTime(),
            csrfToken: generateCsrfToken()
          };

          saveSession(session);

          return {
            success: true,
            message: 'Login berhasil',
            user: {
              userId: userId,
              username: username,
              fullName: fullName,
              role: role
            }
          };
        } else {
          return {
            success: false,
            message: 'Password salah'
          };
        }
      }
    }

    return {
      success: false,
      message: 'Username tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error in login: ' + error.toString());
    return {
      success: false,
      message: 'Terjadi kesalahan saat login'
    };
  }
}

/**
 * Logout user
 */
function logout() {
  try {
    clearSession();
    return {
      success: true,
      message: 'Logout berhasil'
    };
  } catch (error) {
    Logger.log('Error in logout: ' + error.toString());
    return {
      success: false,
      message: 'Terjadi kesalahan saat logout'
    };
  }
}

/**
 * Get current session
 */
function getSession() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    const sessionData = userProperties.getProperty('session');

    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData);

    // Check session timeout
    const currentTime = new Date().getTime();
    const loginTime = session.loginTime;
    const timeout = CONFIG.SESSION_TIMEOUT * 60 * 1000; // Convert to milliseconds

    if (currentTime - loginTime > timeout) {
      clearSession();
      return null;
    }

    // Update login time to extend session
    session.loginTime = currentTime;
    saveSession(session);

    return session;
  } catch (error) {
    Logger.log('Error getting session: ' + error.toString());
    return null;
  }
}

/**
 * Save session
 */
function saveSession(session) {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.setProperty('session', JSON.stringify(session));
    return true;
  } catch (error) {
    Logger.log('Error saving session: ' + error.toString());
    return false;
  }
}

/**
 * Clear session
 */
function clearSession() {
  try {
    const userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty('session');
    return true;
  } catch (error) {
    Logger.log('Error clearing session: ' + error.toString());
    return false;
  }
}

/**
 * Generate CSRF token
 */
function generateCsrfToken() {
  return Utilities.getUuid();
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken(token) {
  try {
    const session = getSession();
    if (!session) {
      return false;
    }
    return session.csrfToken === token;
  } catch (error) {
    Logger.log('Error verifying CSRF token: ' + error.toString());
    return false;
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  const session = getSession();
  return session !== null;
}

/**
 * Check if user has admin role
 */
function isAdmin() {
  const session = getSession();
  return session && session.role === ROLES.ADMIN;
}

/**
 * Check if user has permission for action
 */
function hasPermission(action) {
  const session = getSession();

  if (!session) {
    return false;
  }

  // Admin has all permissions
  if (session.role === ROLES.ADMIN) {
    return true;
  }

  // User permissions
  const userAllowedActions = [
    'view_transactions',
    'create_transaction',
    'view_reports',
    'create_sale',
    'view_inventory',
    'view_receivables',
    'view_payables'
  ];

  return userAllowedActions.includes(action);
}

/**
 * Require authentication
 */
function requireAuth() {
  if (!isAuthenticated()) {
    throw new Error('Unauthorized: Please login first');
  }
}

/**
 * Require admin role
 */
function requireAdmin() {
  requireAuth();
  if (!isAdmin()) {
    throw new Error('Forbidden: Admin access required');
  }
}

/**
 * Get current user info
 */
function getCurrentUser() {
  try {
    const session = getSession();
    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      username: session.username,
      fullName: session.fullName,
      role: session.role
    };
  } catch (error) {
    Logger.log('Error getting current user: ' + error.toString());
    return null;
  }
}

/**
 * Change password
 */
function changePassword(oldPassword, newPassword) {
  try {
    requireAuth();

    const session = getSession();
    const userId = session.userId;

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }

    // Get user data
    const sheet = getSheet(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0] === userId) {
        const passwordHash = row[2];
        const salt = row[3];

        // Verify old password
        const oldHash = hashPassword(oldPassword, salt);
        if (oldHash !== passwordHash) {
          return {
            success: false,
            message: 'Password lama salah'
          };
        }

        // Generate new hash
        const newSalt = generateSalt();
        const newHash = hashPassword(newPassword, newSalt);

        // Update password
        sheet.getRange(i + 1, 3).setValue(newHash);
        sheet.getRange(i + 1, 4).setValue(newSalt);

        return {
          success: true,
          message: 'Password berhasil diubah'
        };
      }
    }

    return {
      success: false,
      message: 'User tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error changing password: ' + error.toString());
    return {
      success: false,
      message: 'Terjadi kesalahan saat mengubah password'
    };
  }
}

/**
 * Create new user (admin only)
 */
function createUser(userData) {
  try {
    requireAdmin();

    // Validate input
    if (!userData.username || !userData.password || !userData.fullName || !userData.role) {
      return {
        success: false,
        message: 'Data tidak lengkap'
      };
    }

    // Validate password
    const validation = validatePassword(userData.password);
    if (!validation.valid) {
      return {
        success: false,
        message: validation.message
      };
    }

    // Check if username exists
    const sheet = getSheet(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userData.username) {
        return {
          success: false,
          message: 'Username sudah digunakan'
        };
      }
    }

    // Create user
    const salt = generateSalt();
    const passwordHash = hashPassword(userData.password, salt);

    sheet.appendRow([
      generateId('USR'),
      sanitizeInput(userData.username),
      passwordHash,
      salt,
      sanitizeInput(userData.fullName),
      userData.role,
      sanitizeInput(userData.email || ''),
      sanitizeInput(userData.phone || ''),
      'Active',
      formatDate(new Date()),
      ''
    ]);

    return {
      success: true,
      message: 'User berhasil dibuat'
    };
  } catch (error) {
    Logger.log('Error creating user: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Get all users (admin only)
 */
function getAllUsers() {
  try {
    requireAdmin();

    const sheet = getSheet(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    const users = [];

    for (let i = 1; i < data.length; i++) {
      users.push({
        userId: data[i][0],
        username: data[i][1],
        fullName: data[i][4],
        role: data[i][5],
        email: data[i][6],
        phone: data[i][7],
        status: data[i][8],
        createdDate: data[i][9],
        lastLogin: data[i][10]
      });
    }

    return {
      success: true,
      data: users
    };
  } catch (error) {
    Logger.log('Error getting users: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

/**
 * Update user status (admin only)
 */
function updateUserStatus(userId, status) {
  try {
    requireAdmin();

    const sheet = getSheet(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userId) {
        sheet.getRange(i + 1, 9).setValue(status);
        return {
          success: true,
          message: 'Status user berhasil diupdate'
        };
      }
    }

    return {
      success: false,
      message: 'User tidak ditemukan'
    };
  } catch (error) {
    Logger.log('Error updating user status: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

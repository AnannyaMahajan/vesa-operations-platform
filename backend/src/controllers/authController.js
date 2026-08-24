const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../database/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { logAuditEvent } = require('../services/auditService');

async function register(req, res, next) {
  try {
    const { email, password, full_name, department_id, role = 'Employee' } = req.body;

    if (!email || !password || !full_name || !department_id) {
      return res.status(422).json({
        error: { status: 422, message: 'Missing required fields: email, password, full_name, department_id.', code: 'VALIDATION_ERROR' }
      });
    }

    if (password.length < 8) {
      return res.status(422).json({
        error: { status: 422, message: 'Password must be at least 8 characters long.', code: 'INVALID_PASSWORD' }
      });
    }

    const existingUser = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return res.status(409).json({
        error: { status: 409, message: 'An account with this email address already exists.', code: 'DUPLICATE_EMAIL' }
      });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const result = run(`
      INSERT INTO users (email, password_hash, full_name, role, department_id, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `, [email.toLowerCase().trim(), passwordHash, full_name.trim(), role, department_id]);

    const newUser = get('SELECT id, email, full_name, role, department_id FROM users WHERE id = ?', [result.lastInsertRowid]);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAuditEvent({ actorId: newUser.id, action: 'USER_REGISTERED', details: { email: newUser.email, role: newUser.role } });

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({
        error: { status: 422, message: 'Please provide both email and password.', code: 'VALIDATION_ERROR' }
      });
    }

    const user = get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({
        error: { status: 401, message: 'Invalid credentials. User not found.', code: 'INVALID_CREDENTIALS' }
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: { status: 403, message: 'Your account has been deactivated. Please contact your System Administrator.', code: 'ACCOUNT_DEACTIVATED' }
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        error: { status: 401, message: 'Invalid credentials. Password incorrect.', code: 'INVALID_CREDENTIALS' }
      });
    }

    const dept = get('SELECT name, code FROM departments WHERE id = ?', [user.department_id]);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logAuditEvent({ actorId: user.id, action: 'USER_LOGIN', details: { email: user.email } });

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department_id: user.department_id,
        department_name: dept ? dept.name : 'Unassigned',
        department_code: dept ? dept.code : 'N/A'
      }
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = req.user;
    const dept = get('SELECT name, code FROM departments WHERE id = ?', [user.department_id]);
    res.json({
      user: {
        ...user,
        department_name: dept ? dept.name : 'Unassigned',
        department_code: dept ? dept.code : 'N/A'
      }
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  logAuditEvent({ actorId: req.user ? req.user.id : null, action: 'USER_LOGOUT' });
  res.json({ message: 'Successfully logged out.' });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};

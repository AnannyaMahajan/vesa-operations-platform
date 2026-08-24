const jwt = require('jsonwebtoken');
const { get } = require('../database/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'vesa_enterprise_workflow_super_secret_jwt_key_2026';

function authGuard(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      error: {
        status: 401,
        message: 'Authentication required. Access token missing or invalid.',
        code: 'UNAUTHORIZED'
      }
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = get('SELECT id, email, full_name, role, department_id, status FROM users WHERE id = ?', [decoded.id]);

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Account is disabled or user no longer exists.',
          code: 'ACCOUNT_DISABLED'
        }
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          status: 401,
          message: 'Session expired. Please log in again.',
          code: 'TOKEN_EXPIRED'
        }
      });
    }

    return res.status(401).json({
      error: {
        status: 401,
        message: 'Invalid authorization token.',
        code: 'INVALID_TOKEN'
      }
    });
  }
}

module.exports = {
  authGuard,
  JWT_SECRET
};

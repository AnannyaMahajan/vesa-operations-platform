const bcrypt = require('bcryptjs');
const { query, get, run } = require('../database/db');
const { logAuditEvent } = require('../services/auditService');

async function getUsers(req, res, next) {
  try {
    const users = query(`
      SELECT u.id, u.email, u.full_name, u.role, u.department_id, u.status, u.created_at,
             d.name as department_name, d.code as department_code
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
      ORDER BY u.id ASC
    `);
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function createUser(req, res, next) {
  try {
    const { email, password, full_name, role, department_id } = req.body;

    if (!email || !password || !full_name || !role || !department_id) {
      return res.status(422).json({
        error: { status: 422, message: 'All fields are required: email, password, full_name, role, department_id.' }
      });
    }

    const existing = get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: { status: 409, message: 'Email address is already in use.' } });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = run(`
      INSERT INTO users (email, password_hash, full_name, role, department_id, status)
      VALUES (?, ?, ?, ?, ?, 'ACTIVE')
    `, [email.toLowerCase().trim(), hash, full_name.trim(), role, department_id]);

    const newUser = get('SELECT id, email, full_name, role, department_id, status FROM users WHERE id = ?', [result.lastInsertRowid]);

    logAuditEvent({ actorId: req.user.id, action: 'ADMIN_USER_CREATED', details: { newUser: newUser.email, role } });

    res.status(201).json({ message: 'User created successfully.', user: newUser });
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { role, department_id, status } = req.body;

    const user = get('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: { status: 404, message: 'User not found.' } });
    }

    const newRole = role || user.role;
    const newDept = department_id || user.department_id;
    const newStatus = status || user.status;

    run(`
      UPDATE users SET role = ?, department_id = ?, status = ? WHERE id = ?
    `, [newRole, newDept, newStatus, id]);

    logAuditEvent({
      actorId: req.user.id,
      action: 'ADMIN_USER_UPDATED',
      details: { targetUser: user.email, oldRole: user.role, newRole, newStatus }
    });

    res.json({ message: 'User updated successfully.' });
  } catch (err) {
    next(err);
  }
}

async function getDepartments(req, res, next) {
  try {
    const departments = query(`
      SELECT d.*, u.full_name as manager_name
      FROM departments d
      LEFT JOIN users u ON d.manager_id = u.id
      ORDER BY d.id ASC
    `);
    res.json({ departments });
  } catch (err) {
    next(err);
  }
}

async function getSlaConfigs(req, res, next) {
  try {
    const configs = query('SELECT * FROM request_types ORDER BY id ASC');
    res.json({ requestTypes: configs });
  } catch (err) {
    next(err);
  }
}

async function updateSlaConfig(req, res, next) {
  try {
    const { id } = req.params;
    const { target_sla_hours } = req.body;

    if (!target_sla_hours || target_sla_hours <= 0) {
      return res.status(422).json({ error: { status: 422, message: 'Target SLA hours must be a positive integer.' } });
    }

    run('UPDATE request_types SET target_sla_hours = ? WHERE id = ?', [target_sla_hours, id]);

    logAuditEvent({
      actorId: req.user.id,
      action: 'ADMIN_SLA_UPDATED',
      details: { requestTypeId: id, newSlaHours: target_sla_hours }
    });

    res.json({ message: 'SLA configuration updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  getDepartments,
  getSlaConfigs,
  updateSlaConfig
};

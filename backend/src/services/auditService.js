const { query, run } = require('../database/db');

function logAuditEvent({ requestId, actorId, action, previousState = null, newState = null, details = {}, ipAddress = null }) {
  try {
    run(`
      INSERT INTO audit_logs (request_id, actor_id, action, previous_state, new_state, details_json, ip_address, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      requestId || null,
      actorId || null,
      action,
      previousState,
      newState,
      JSON.stringify(details),
      ipAddress || '127.0.0.1'
    ]);
  } catch (error) {
    console.error('❌ Failed to create audit log entry:', error);
  }
}

function getAuditLogsForRequest(requestId) {
  const logs = query(`
    SELECT a.*, u.full_name as actor_name, u.role as actor_role, u.email as actor_email
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    WHERE a.request_id = ?
    ORDER BY a.timestamp ASC
  `, [requestId]);

  return logs.map(log => ({
    ...log,
    details: log.details_json ? JSON.parse(log.details_json) : {}
  }));
}

function getAllAuditLogs({ limit = 100, offset = 0, action = null, search = null }) {
  let sql = `
    SELECT a.*, u.full_name as actor_name, u.role as actor_role, r.request_number, r.title as request_title
    FROM audit_logs a
    LEFT JOIN users u ON a.actor_id = u.id
    LEFT JOIN requests r ON a.request_id = r.id
    WHERE 1=1
  `;
  const params = [];

  if (action) {
    sql += ` AND a.action = ?`;
    params.push(action);
  }
  if (search) {
    sql += ` AND (u.full_name LIKE ? OR r.request_number LIKE ? OR a.action LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }

  sql += ` ORDER BY a.timestamp DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  return query(sql, params).map(log => ({
    ...log,
    details: log.details_json ? JSON.parse(log.details_json) : {}
  }));
}

module.exports = {
  logAuditEvent,
  getAuditLogsForRequest,
  getAllAuditLogs
};

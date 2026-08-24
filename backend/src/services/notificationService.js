const { query, run, get } = require('../database/db');

function createNotification({ userId, requestId = null, title, message, type = 'INFO' }) {
  try {
    run(`
      INSERT INTO notifications (user_id, request_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP)
    `, [userId, requestId, title, message, type]);
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
  }
}

function getUserNotifications(userId, unreadOnly = false) {
  let sql = `
    SELECT n.*, r.request_number, r.title as request_title
    FROM notifications n
    LEFT JOIN requests r ON n.request_id = r.id
    WHERE n.user_id = ?
  `;
  if (unreadOnly) {
    sql += ` AND n.is_read = 0`;
  }
  sql += ` ORDER BY n.created_at DESC LIMIT 50`;
  return query(sql, [userId]);
}

function getUnreadCount(userId) {
  const result = get(`SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`, [userId]);
  return result ? result.count : 0;
}

function markAsRead(notificationId, userId) {
  return run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [notificationId, userId]);
}

function markAllAsRead(userId) {
  return run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
}

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};

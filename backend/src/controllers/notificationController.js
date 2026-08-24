const { getUserNotifications, getUnreadCount, markAsRead, markAllAsRead } = require('../services/notificationService');

async function getNotifications(req, res, next) {
  try {
    const notifications = getUserNotifications(req.user.id);
    const unreadCount = getUnreadCount(req.user.id);
    res.json({ notifications, unreadCount });
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    markAsRead(parseInt(id, 10), req.user.id);
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead
};

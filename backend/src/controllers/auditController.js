const { getAllAuditLogs } = require('../services/auditService');

async function getLogs(req, res, next) {
  try {
    const { action, search, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const offset = (pageNum - 1) * limitNum;

    const logs = getAllAuditLogs({ limit: limitNum, offset, action, search });
    res.json({ auditLogs: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getLogs
};

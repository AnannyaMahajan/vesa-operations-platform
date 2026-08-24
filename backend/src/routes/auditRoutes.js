const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authGuard } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/rbacMiddleware');

router.use(authGuard);
router.use(roleGuard(['System Administrator', 'Operations Manager']));

router.get('/', auditController.getLogs);

module.exports = router;

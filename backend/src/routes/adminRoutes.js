const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authGuard } = require('../middleware/authMiddleware');
const { roleGuard } = require('../middleware/rbacMiddleware');

router.use(authGuard);
router.use(roleGuard(['System Administrator']));

router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.patch('/users/:id', adminController.updateUser);

router.get('/departments', adminController.getDepartments);

router.get('/sla-config', adminController.getSlaConfigs);
router.patch('/sla-config/:id', adminController.updateSlaConfig);

module.exports = router;

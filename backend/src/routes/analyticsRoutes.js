const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authGuard } = require('../middleware/authMiddleware');

router.use(authGuard);

router.get('/dashboard', analyticsController.getDashboardStats);
router.get('/bottlenecks', analyticsController.getBottleneckAnalysis);
router.get('/export', analyticsController.exportReport);

module.exports = router;

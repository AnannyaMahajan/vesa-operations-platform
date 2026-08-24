const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authGuard } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authGuard, authController.getMe);
router.post('/logout', authGuard, authController.logout);

module.exports = router;

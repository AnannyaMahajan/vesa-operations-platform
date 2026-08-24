const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');
const { authGuard } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/fileUpload');

router.use(authGuard);

router.post('/', requestController.createRequest);
router.get('/', requestController.getRequests);
router.get('/:id', requestController.getRequestById);
router.post('/:id/action', requestController.executeAction);
router.post('/:id/comments', requestController.addComment);
router.post('/:id/attachments', upload.single('file'), requestController.addAttachment);
router.get('/attachments/:attachmentId/download', requestController.downloadAttachment);

module.exports = router;

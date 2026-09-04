const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  createNotification,
  updateNotification,
  bulkMarkAsRead,
  deleteNotification,
  bulkDeleteNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { requireUser, requireAdmin, requireSelfParam, requireSelfBody } = require('../middleware/auth');

// GET /api/notifications/:userId/unread-count - Get unread notification count
router.get('/:userId/unread-count', requireUser, requireSelfParam('userId'), getUnreadCount);

// GET /api/notifications/:userId - Get user notifications with filtering and pagination
router.get('/:userId', requireUser, requireSelfParam('userId'), getUserNotifications);

// POST /api/notifications - Create new notification
router.post('/', requireAdmin, createNotification);

// POST /api/notifications/mark-read - Bulk mark notifications as read
router.post('/mark-read', requireUser, requireSelfBody('userId'), bulkMarkAsRead);

// DELETE /api/notifications/bulk - Bulk delete notifications
router.delete('/bulk', requireUser, requireSelfBody('userId'), bulkDeleteNotifications);

// PUT /api/notifications/:id - Update notification (mark as read/unread)
router.put('/:id', requireUser, updateNotification);

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', requireUser, requireSelfBody('userId'), deleteNotification);

module.exports = router;

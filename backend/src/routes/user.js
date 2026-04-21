const express = require('express');
const router = express.Router();
const { getMe, getAdminStats, getAllUsers, deleteUser, resetUserPassword } = require('../controllers/user');
const { auth } = require('../middleware/auth');

router.get('/users/me', auth, getMe);
router.get('/admin/stats', auth, getAdminStats);
router.get('/admin/users', auth, getAllUsers);
router.delete('/admin/users/:id', auth, deleteUser);
router.post('/admin/users/:id/reset-password', auth, resetUserPassword);

module.exports = router;

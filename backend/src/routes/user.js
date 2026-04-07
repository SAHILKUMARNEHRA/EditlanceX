const express = require('express');
const router = express.Router();
const { getMe, getAdminStats, getAllUsers } = require('../controllers/user');
const { auth } = require('../middleware/auth');

router.get('/users/me', auth, getMe);
router.get('/admin/stats', auth, getAdminStats);
router.get('/admin/users', auth, getAllUsers);

module.exports = router;

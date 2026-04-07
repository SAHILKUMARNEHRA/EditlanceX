const express = require('express');
const router = express.Router();
const { getMe } = require('../controllers/user');
const { auth } = require('../middleware/auth');

router.get('/users/me', auth, getMe);

module.exports = router;

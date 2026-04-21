const express = require('express');
const router = express.Router();
const { getEditors, updateProfile, getProfile } = require('../controllers/editor');
const { auth } = require('../middleware/auth');

router.get('/editors', auth, getEditors);
router.get('/editors/profile', auth, getProfile);
router.put('/editors/profile', auth, updateProfile);

module.exports = router;

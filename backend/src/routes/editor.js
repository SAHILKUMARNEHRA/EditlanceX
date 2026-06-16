const express = require('express');
const router = express.Router();
const { getEditors, updateProfile, getProfile, getEditorById } = require('../controllers/editor');
const { auth } = require('../middleware/auth');

router.get('/editors', auth, getEditors);
router.get('/editors/profile', auth, getProfile);
router.put('/editors/profile', auth, updateProfile);
// Keep this AFTER /editors/profile so "profile" isn't captured as an :id
router.get('/editors/:id', auth, getEditorById);

module.exports = router;

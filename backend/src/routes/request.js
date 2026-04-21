const express = require('express');
const { sendDirectRequest, getClientRequests, getEditorRequests, respondToDirectRequest } = require('../controllers/request');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.post('/requests/direct', auth, sendDirectRequest);
router.get('/requests/client', auth, getClientRequests);
router.get('/requests/editor', auth, getEditorRequests);
router.put('/requests/direct/:id', auth, respondToDirectRequest);

module.exports = router;
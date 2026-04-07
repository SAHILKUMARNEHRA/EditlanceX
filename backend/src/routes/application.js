const express = require('express');
const router = express.Router();
const { applyForJob, getEditorApplications, updateApplicationStatus, markAsContacted } = require('../controllers/application');
const { auth, authorize } = require('../middleware/auth');

router.post('/jobs/:jobId/apply', auth, authorize('editor'), applyForJob);
router.get('/jobs/applied', auth, authorize('editor'), getEditorApplications);
router.patch('/applications/:id/status', auth, authorize('client'), updateApplicationStatus);
router.patch('/applications/:id/contact', auth, authorize('client'), markAsContacted);

module.exports = router;

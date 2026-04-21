const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getPostedJobs, deleteJob, getAdminJobs, updateJobStatus } = require('../controllers/job');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

router.post('/jobs', auth, authorize('client'), createJob);
router.get('/jobs', auth, getJobs);
router.get('/jobs/posted', auth, authorize('client'), getPostedJobs);
router.get('/admin/jobs', auth, getAdminJobs);
router.delete('/admin/jobs/:id', auth, deleteJob);
router.delete('/jobs/:id', auth, deleteJob);
router.put('/jobs/:id/status', auth, updateJobStatus);
router.get('/jobs/:id', auth, getJobById);

module.exports = router;

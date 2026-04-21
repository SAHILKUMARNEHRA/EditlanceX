const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getPostedJobs, deleteJob, getAdminJobs } = require('../controllers/job');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

router.post('/jobs', auth, authorize('client'), createJob);
router.get('/jobs', auth, getJobs);
router.get('/jobs/posted', auth, authorize('client'), getPostedJobs);
router.get('/admin/jobs', auth, getAdminJobs);
router.delete('/admin/jobs/:id', auth, deleteJob);
router.get('/jobs/:id', auth, getJobById);

module.exports = router;

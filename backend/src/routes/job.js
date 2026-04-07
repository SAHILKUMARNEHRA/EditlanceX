const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, getPostedJobs } = require('../controllers/job');
const { auth, authorize, optionalAuth } = require('../middleware/auth');

router.post('/jobs', auth, authorize('client'), createJob);
router.get('/jobs', optionalAuth, getJobs);
router.get('/jobs/posted', auth, authorize('client'), getPostedJobs);
router.get('/jobs/:id', auth, getJobById);

module.exports = router;

const prisma = require('../config/prisma');

const createJob = async (req, res) => {
  try {
    const { title, description, category, videoType, software, budget, deadline } = req.body;
    const createdBy = req.user.id;

    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can create jobs' });
    }

    if (!title || !description || budget === undefined || !deadline) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        category,
        videoType,
        software: Array.isArray(software) ? software : [],
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        createdBy,
      },
    });

    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Error creating job' });
  }
};

const getJobs = async (req, res) => {
  try {
    const userId = req.user?.id;
    const jobs = await prisma.job.findMany({
      include: {
        client: {
          select: { name: true, email: true },
        },
        applications: userId ? {
          where: { editorId: userId },
          select: { id: true, status: true }
        } : false,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    const formattedJobs = jobs.map(job => ({
      ...job,
      clientName: job.client?.name || 'Unknown Client',
      applicationsCount: job._count?.applications || 0,
      videoType: job.videoType || 'Not specified',
      software: job.software || [],
      applied: userId ? job.applications.length > 0 : false,
      applicationStatus: userId && job.applications.length > 0 ? job.applications[0].status : null
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        client: {
          select: { name: true, email: true },
        },
        applications: {
          include: {
            editor: {
              select: { 
                id: true, 
                name: true, 
                email: true, 
                phone: true, // Include phone number
                editorProfile: {
                  select: {
                    bio: true,
                    skills: true,
                    experience: true,
                    experienceDetails: true,
                    portfolioLinks: true,
                    availability: true
                  }
                } 
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const isOwner = job.createdBy === req.user.id;

    const formattedJob = {
      ...job,
      clientName: job.client?.name || 'Unknown Client',
      applications: job.applications.map(app => ({
        id: app.id,
        appliedAt: app.createdAt,
        status: app.status,
        isContacted: app.isContacted,
        editor: {
          id: app.editor.id,
          name: app.editor.name,
          email: isOwner && app.isContacted ? app.editor.email : 'Exclusive Info', // Only show if contacted
          phone: isOwner && app.isContacted ? app.editor.phone : 'Exclusive Info', // Only show if contacted
          profile: app.editor.editorProfile
        }
      }))
    };

    res.json(formattedJob);
  } catch (error) {
    console.error('Error fetching job details:', error);
    res.status(500).json({ error: 'Error fetching job details' });
  }
};

const getPostedJobs = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const jobs = await prisma.job.findMany({
      where: { createdBy },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });

    const formattedJobs = jobs.map(job => ({
      ...job,
      applicationsCount: job._count?.applications || 0,
      videoType: job.videoType || 'Not specified',
      software: job.software || []
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posted jobs' });
  }
};

const deleteJob = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    // Delete related applications first
    await prisma.application.deleteMany({ where: { jobId: id } });
    
    // Delete the job
    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Error deleting job' });
  }
};

const getAdminJobs = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const jobs = await prisma.job.findMany({
      include: {
        client: {
          select: { name: true, email: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedJobs = jobs.map(job => ({
      ...job,
      clientName: job.client?.name || 'Unknown Client',
      applicationsCount: job._count?.applications || 0,
      videoType: job.videoType || 'Not specified',
      software: job.software || [],
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    res.status(500).json({ error: 'Error fetching jobs' });
  }
};

module.exports = { createJob, getJobs, getJobById, getPostedJobs, deleteJob, getAdminJobs };

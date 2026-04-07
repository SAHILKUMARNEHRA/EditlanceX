const prisma = require('../config/prisma');

const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const editorId = req.user.id;

    if (req.user.role !== 'editor') {
      return res.status(403).json({ error: 'Only editors can apply for jobs' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_editorId: { jobId, editorId },
      },
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        editorId,
      },
    });

    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Error applying for job' });
  }
};

const getEditorApplications = async (req, res) => {
  try {
    const editorId = req.user.id;

    if (req.user.role !== 'editor') {
      return res.status(403).json({ error: 'Only editors can view their applications' });
    }

    const applications = await prisma.application.findMany({
      where: { editorId },
      include: {
        job: {
          include: {
            client: {
              select: { name: true, email: true },
            },
          },
        },
      },
    });

    res.json({
      jobs: applications.map(app => ({
        ...app.job,
        clientName: app.job.client?.name || 'Unknown Client',
        applied: true,
        status: app.status // Include hiring status for editor
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching applications' });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const clientId = req.user.id;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.createdBy !== clientId) {
      return res.status(403).json({ error: 'Only the job creator can update application status' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ error: 'Error updating status' });
  }
};

const markAsContacted = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.job.createdBy !== clientId) {
      return res.status(403).json({ error: 'Only the job creator can mark as contacted' });
    }

    const updatedApplication = await prisma.application.update({
      where: { id },
      data: { isContacted: true },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            editorProfile: true
          }
        }
      }
    });

    res.json(updatedApplication);
  } catch (error) {
    res.status(500).json({ error: 'Error updating contact status' });
  }
};

module.exports = { applyForJob, getEditorApplications, updateApplicationStatus, markAsContacted };

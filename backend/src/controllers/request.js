const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sendDirectRequest = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can send direct requests' });
    }

    const { editorId } = req.body;

    if (!editorId) {
      return res.status(400).json({ error: 'Editor ID is required' });
    }

    // Check if already exists
    const existing = await prisma.directRequest.findFirst({
      where: {
        clientId: req.user.id,
        editorId: editorId,
        status: 'PENDING'
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request with this editor' });
    }

    const request = await prisma.directRequest.create({
      data: {
        clientId: req.user.id,
        editorId: editorId,
      }
    });

    res.status(201).json({ message: 'Request sent successfully', request });
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ error: 'Error sending request' });
  }
};

const getClientRequests = async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get both Direct Requests and Job Applications
    const directRequests = await prisma.directRequest.findMany({
      where: { clientId: req.user.id },
      include: { editor: { select: { id: true, name: true, email: true, editorProfile: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const jobApplications = await prisma.application.findMany({
      where: { job: { createdBy: req.user.id } },
      include: { 
        editor: { select: { id: true, name: true, email: true, editorProfile: true } },
        job: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ directRequests, jobApplications });
  } catch (error) {
    console.error('Error fetching client requests:', error);
    res.status(500).json({ error: 'Error fetching requests' });
  }
};

const getEditorRequests = async (req, res) => {
  try {
    if (req.user.role !== 'editor') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const directRequests = await prisma.directRequest.findMany({
      where: { editorId: req.user.id },
      include: { client: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const jobApplications = await prisma.application.findMany({
      where: { editorId: req.user.id },
      include: { 
        job: { select: { id: true, title: true, budget: true, client: { select: { name: true, email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ directRequests, jobApplications });
  } catch (error) {
    console.error('Error fetching editor requests:', error);
    res.status(500).json({ error: 'Error fetching requests' });
  }
};

const respondToDirectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // HIRED or NOT_HIRED (meaning Accepted or Declined)

    if (!['HIRED', 'NOT_HIRED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await prisma.directRequest.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // If editor is responding
    if (req.user.role === 'editor' && request.editorId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If client is responding (maybe canceling)
    if (req.user.role === 'client' && request.clientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updated = await prisma.directRequest.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Request updated', request: updated });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ error: 'Error updating request' });
  }
};

module.exports = { sendDirectRequest, getClientRequests, getEditorRequests, respondToDirectRequest };
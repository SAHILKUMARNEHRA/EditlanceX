const prisma = require('../config/prisma');

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

const getAdminStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [userCount, jobCount, applicationCount, editorCount] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.count({ where: { role: 'editor' } })
    ]);

    const recentJobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true } } }
    });

    res.json({
      stats: {
        totalUsers: userCount,
        totalJobs: jobCount,
        totalApplications: applicationCount,
        totalEditors: editorCount
      },
      recentJobs
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching admin stats' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true
      }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

module.exports = { getMe, getAdminStats, getAllUsers };

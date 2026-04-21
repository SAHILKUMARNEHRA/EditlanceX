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
        lastLogin: true,
        createdAt: true
      }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Prisma handles cascading deletes if configured, or we can manually delete related
    // First delete applications
    await prisma.application.deleteMany({ where: { editorId: id } });
    
    // Delete jobs created by user
    const userJobs = await prisma.job.findMany({ where: { createdBy: id } });
    const jobIds = userJobs.map(j => j.id);
    await prisma.application.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.job.deleteMany({ where: { createdBy: id } });
    
    // Delete editor profile
    await prisma.editorProfile.deleteMany({ where: { userId: id } });
    
    // Finally delete user
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Error deleting user' });
  }
};

const resetUserPassword = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.email !== 'sk.nehra2005@gmail.com') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password' });
  }
};

module.exports = { getMe, getAdminStats, getAllUsers, deleteUser, resetUserPassword };

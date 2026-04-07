const prisma = require('../config/prisma');

const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
};

module.exports = { getMe };

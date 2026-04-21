const prisma = require('../config/prisma');

const getEditors = async (req, res) => {
  try {
    const editors = await prisma.user.findMany({
      where: { role: 'editor' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        editorProfile: true,
      },
    });

    const formattedEditors = editors.map(editor => ({
      id: editor.id,
      name: editor.name,
      email: editor.email,
      skills: editor.editorProfile?.skills || [],
      experience: editor.editorProfile?.experience || 'None',
      bio: editor.editorProfile?.bio || '',
      availability: editor.editorProfile?.availability || 'Unknown',
      experienceDetails: editor.editorProfile?.experienceDetails || '',
    }));

    res.json({ editors: formattedEditors });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching editors' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, skills, experience, portfolioLinks, availability, experienceDetails } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'editor') {
      return res.status(403).json({ error: 'Only editors can update profiles' });
    }

    const profile = await prisma.editorProfile.upsert({
      where: { userId },
      update: {
        bio,
        skills,
        experience,
        portfolioLinks,
        availability,
        experienceDetails,
      },
      create: {
        userId,
        bio,
        skills,
        experience,
        portfolioLinks,
        availability,
        experienceDetails,
      },
    });

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { editorProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = {
      name: user.name,
      email: user.email,
      bio: user.editorProfile?.bio || '',
      skills: user.editorProfile?.skills || [],
      experience: user.editorProfile?.experience || '',
      portfolioLinks: user.editorProfile?.portfolioLinks || [],
      availability: user.editorProfile?.availability || '',
      experienceDetails: user.editorProfile?.experienceDetails || '',
    };

    res.json({ profile });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

module.exports = { getEditors, updateProfile, getProfile };

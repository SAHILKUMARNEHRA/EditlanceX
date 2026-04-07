const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const signup = async (req, res) => {
  try {
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'client',
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error during signup' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = generateToken(user.id);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    
    // Fetch user info from Google using access token
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const userInfo = await response.json();

    if (!userInfo.email) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { email, name, sub: googleId, picture: avatar } = userInfo;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          role: role || 'client',
          lastLogin: new Date(),
        },
      });
    } else {
      // Link Google account if email already exists or just update last login
      user = await prisma.user.update({
        where: { email },
        data: { 
          googleId: user.googleId || googleId,
          lastLogin: new Date()
        },
      });
    }

    const jwtToken = generateToken(user.id);
    res.json({ user, token: jwtToken });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ error: 'Google authentication failed' });
  }
};

module.exports = { signup, login, googleLogin };

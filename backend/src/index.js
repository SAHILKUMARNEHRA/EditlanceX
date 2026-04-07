require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const editorRoutes = require('./routes/editor');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during initial deployment debugging
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', editorRoutes);
app.use('/api', applicationRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'EditlanceX API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

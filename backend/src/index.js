require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const editorRoutes = require('./routes/editor');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const requestRoutes = require('./routes/request');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Security and Performance Middleware
app.use(helmet()); // Sets secure HTTP headers
app.use(compression()); // Compresses response bodies (gzip)

// Rate Limiting: Max 200 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, 
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', limiter);

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
app.use('/api', requestRoutes);
app.use('/api', jobRoutes);
app.use('/api', userRoutes);

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: 'EditlanceX API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.send('<h1>EditlanceX API is Live</h1><p>The API is accessible at <a href="/api">/api</a></p>');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, (err) => {
  if (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
  console.log(`Server is running on port ${PORT}`);
});

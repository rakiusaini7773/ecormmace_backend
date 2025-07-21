const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const { createDefaultAdmin } = require('./controllers/adminController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy (important behind Nginx)
app.set('trust proxy', 1);

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// Security headers
app.use(helmet({ crossOriginResourcePolicy: false }));

// Compression
app.use(compression());

// Strict CORS: only allow frontend domain
const allowedOrigin = 'https://elixirbalance.com';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// File uploads
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tmpDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session setup with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'none',
    secure: true,
    httpOnly: true,
  }
}));

// API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/upload', require('./routes/fileUploadRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/subscriber', require('./routes/subscriberRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Serve frontend (if needed)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  app.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, 'client/build/index.html'));
  });
}

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createDefaultAdmin();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  process.exit(1);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message);

  if (err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ error: 'File upload failed: unexpected end of form. Please retry.' });
  }

  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS error: Origin not allowed' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

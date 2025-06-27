const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { createDefaultAdmin } = require('./controllers/adminController');

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express app
const app = express();

// ✅ Ensure tmp directory exists for express-fileupload
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// ✅ Middleware - CORS
app.use(cors({
  origin: '*', // 🔒 Replace '*' with your frontend URL in production
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middleware - File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tmpDir,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
}));

// ✅ Middleware - Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Static Files (e.g. uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/upload', require('./routes/fileUploadRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/uploads',require('./routes/uploadRoutes'))
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'))
app.get('/', (req, res) => {
  res.send('API is running');
});
// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // Create default admin user
  await createDefaultAdmin();

  // Start server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  if (err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ error: 'File upload failed: unexpected end of form. Please retry.' });
  }

  res.status(500).json({ error: err.message || 'Server Error' });
});



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

// ✅ Security headers
app.use(helmet());

// ✅ Compression for performance
app.use(compression());

// ✅ Ensure tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

// ✅ Allowed Origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://elixirbalance.com',
];

// ✅ CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS rejected origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ File Upload Middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tmpDir,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}));

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Session Middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    },
  })
);

// ✅ API Routes
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

// ✅ Test endpoint
app.get('/', (req, res) => {
  res.send('API is running...');
});

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Create default admin if not present
    await createDefaultAdmin();

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
  console.error('❌ Unhandled error:', err.message);

  if (err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ error: 'File upload failed: unexpected end of form. Please retry.' });
  }

  if (err.message.includes('CORS')) {
    return res.status(403).json({ error: 'CORS error: Origin not allowed' });
  }

  res.status(500).json({ error: err.message || 'Internal server error' });
});

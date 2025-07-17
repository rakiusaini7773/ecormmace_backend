const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const session = require('express-session'); // ✅ Added
const MongoStore = require('connect-mongo'); // ✅ Added
const { createDefaultAdmin } = require('./controllers/adminController');

dotenv.config();

const app = express();

// ✅ Ensure tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}

const allowedOrigins = [
  'http://localhost:3000', // your frontend dev
  'https://api.nourishandthrive.in/', // your production frontend domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// ✅ Middleware - File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tmpDir,
  limits: { fileSize: 100 * 1024 * 1024 }
}));

// ✅ Middleware - Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ SESSION MIDDLEWARE SETUP
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'sessions',
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: false, // ❗ use true only when using HTTPS
      sameSite: 'lax',
    },
  })
);


// ✅ ROUTES
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

app.get('/', (req, res) => {
  res.send('API is running');
});

// ✅ MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log('✅ MongoDB connected');

  // Create default admin
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

// ✅ GLOBAL ERROR HANDLER
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  if (err.message.includes('Unexpected end of form')) {
    return res.status(400).json({ error: 'File upload failed: unexpected end of form. Please retry.' });
  }

  res.status(500).json({ error: err.message || 'Server Error' });
});

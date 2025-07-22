const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');

// 🔐 Load environment variables
dotenv.config();

const app = express();

// ✅ Trust proxy (needed for secure cookies behind nginx/reverse proxy)
app.set('trust proxy', 1);

// ✅ Middlewares
app.use(express.json({ limit: '10mb' })); // Limit body to 10 MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({ useTempFiles: true, limits: { fileSize: 10 * 1024 * 1024 } })); // 10 MB
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// ✅ CORS config
app.use(cors({
  origin: (origin, callback) => callback(null, true), // Allow all origins dynamically
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// ✅ Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'none',  // ✅ Needed for cross-origin cookies
    secure: true       // ✅ Must be true if using HTTPS
  }
}));

// ✅ API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api', require('./routes/subscriberRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/upload', require('./routes/fileUploadRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/user', require('./routes/userRoutes'));

// ✅ Static File Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health Check
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

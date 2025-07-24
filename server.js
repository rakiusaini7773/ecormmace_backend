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

// ✅ Load environment variables
dotenv.config();
const app = express();

// ✅ Trust proxy (required for correct session + IP in production)
app.set('trust proxy', 1);

// ✅ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(fileUpload({ useTempFiles: true, limits: { fileSize: 10 * 1024 * 1024 } }));
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// ✅ CORS Setup (allow only specific frontend domains + Postman)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://studio.postman.com',
  'https://nourishandthrive.in',
  'https://www.nourishandthrive.in'
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

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB Error:', err));

// ✅ Session config
app.use(session({
  name: 'connect.sid',
  secret: process.env.SESSION_SECRET || 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: false,        // Set true if using HTTPS in production (and use secure cookies)
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  }
}));

// ✅ Debugging: Print Session Info on every request
app.use((req, res, next) => {
  console.log('Incoming Session ID:', req.sessionID);
  console.log('Session Content:', req.session);
  next();
});

// ✅ Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/users', require('./routes/userRoutes')); // Optional: Alias
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api', require('./routes/subscriberRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/upload', require('./routes/fileUploadRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

// ✅ Static File Serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Health Check
app.get('/', (req, res) => {
  res.status(200).send('✅ API is running...');
});

// ✅ Test session route
app.get('/api/test-session', (req, res) => {
  req.session.counter = (req.session.counter || 0) + 1;
  res.send({
    message: 'Session counter test',
    sessionId: req.sessionID,
    counter: req.session.counter
  });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ message: err.message });
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

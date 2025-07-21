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

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true }));
app.use(helmet());
app.use(morgan('dev'));

// CORS setup
const allowedOrigins = ['https://elixirbalance.com', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Session config
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    sameSite: 'none',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/subscribers', require('./routes/subscriberRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400,
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route registration
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', fileUploadRoutes); // 🔥 Cloudinary-based file upload
app.use('/api/banners', bannerRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer error handler (optional — you can remove if you're not using multer anymore)
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Unexpected field') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

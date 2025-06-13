const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load env variables
dotenv.config();

// Import default admin creator
const { createDefaultAdmin } = require('./controllers/adminController');

const app = express();

// Middleware
app.use(cors({
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route imports
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

// Route registration
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', fileUploadRoutes);
app.use('/api/banners', bannerRoutes);

// MongoDB Connection and server start
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('✅ MongoDB connected');
  await createDefaultAdmin(); // Ensure this runs only after DB is ready

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// Multer error handler
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Unexpected field') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

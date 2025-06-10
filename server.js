const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');

dotenv.config();
const app = express();


app.use(cors({
  origin: "*", // Adjust this to your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Disposition"],
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400, // 24 hours
  credentials: true,
}));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', fileUploadRoutes);

// MongoDB connection


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


// Multer error handler
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message === 'Unexpected field') {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

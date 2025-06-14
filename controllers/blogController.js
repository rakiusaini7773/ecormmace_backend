// controllers/blogController.js
const { cloudinary } = require('../config/cloudinary');
const Blog = require('../models/Blog');
const Joi = require('joi');

const blogValidationSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  category: Joi.string().required(),
  readMoreLink: Joi.string().uri().optional().allow(''),
  description: Joi.string().required(),
});

exports.addBlog = async (req, res) => {
  try {
    const { title, author, category, readMoreLink, description } = req.body;
    const { error } = blogValidationSchema.validate({ title, author, category, readMoreLink, description });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const exists = await Blog.findOne({ title });
    if (exists) return res.status(400).json({ message: 'Blog title already exists' });

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const file = req.files.image;
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blogs',
    });

    const blog = new Blog({
      title, author, category, readMoreLink, description,
      imageUrl: uploadResult.secure_url,
    });

    await blog.save();

    res.status(201).json({ message: 'Blog uploaded successfully', blog });
  } catch (err) {
    console.error('Error uploading blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateBlogImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'New image is required' });
    }

    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    const file = req.files.image;
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blogs',
    });

    blog.imageUrl = uploadResult.secure_url;
    await blog.save();

    res.status(200).json({ message: 'Blog image updated', imageUrl: blog.imageUrl });
  } catch (err) {
    console.error('Error updating blog image:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });

    blog.status = blog.status === 'active' ? 'inactive' : 'active';
    await blog.save();

    res.status(200).json({ message: `Blog status updated to ${blog.status}`, status: blog.status });
  } catch (err) {
    console.error('Error toggling blog status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

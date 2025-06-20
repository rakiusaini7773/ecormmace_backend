const { cloudinary } = require('../config/cloudinary');
const Blog = require('../models/Blog');
const Joi = require('joi');
const cheerio = require('cheerio');
const axios = require('axios');
const fs = require('fs');
const tmp = require('tmp');

// Validation schema
const blogValidationSchema = Joi.object({
  title: Joi.string().required(),
  author: Joi.string().required(),
  category: Joi.string().required(),
  description: Joi.string().min(10).required(), // HTML content
});

// Add a new blog
exports.addBlog = async (req, res) => {
  try {
    const { title, author, category, description } = req.body;

    const { error } = blogValidationSchema.validate({ title, author, category, description });
    if (error) return res.status(400).json({ message: error.details[0].message });

    const exists = await Blog.findOne({ title });
    if (exists) return res.status(400).json({ message: 'Blog title already exists' });

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: 'Image is required' });
    }

    // Upload blog cover image
    const file = req.files.image;
    const uploadResult = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: 'blogs',
    });

    // --- Parse and handle <img> inside description ---
    const $ = cheerio.load(description);
    const uploadPromises = [];

    $('img').each((_, img) => {
      const src = $(img).attr('src');

      // Skip if already on Cloudinary
      if (!src || src.includes('cloudinary.com')) return;

      const tempFile = tmp.fileSync({ postfix: '.png' });

      if (src.startsWith('data:image/')) {
        // Handle base64 images
        const base64Data = src.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(tempFile.name, Buffer.from(base64Data, 'base64'));

        uploadPromises.push(
          cloudinary.uploader.upload(tempFile.name, {
            folder: 'blog-description-images',
          }).then(result => {
            $(img).attr('src', result.secure_url);
            tempFile.removeCallback();
          }).catch(err => {
            console.error('Cloudinary upload failed (base64):', err);
            tempFile.removeCallback();
          })
        );
      } else {
        // Handle image from URL
        uploadPromises.push(
          axios({
            method: 'GET',
            url: src,
            responseType: 'arraybuffer',
          }).then(res => {
            fs.writeFileSync(tempFile.name, res.data);
            return cloudinary.uploader.upload(tempFile.name, {
              folder: 'blog-description-images',
            }).then(result => {
              $(img).attr('src', result.secure_url);
              tempFile.removeCallback();
            });
          }).catch(err => {
            console.error('Image download/upload error:', err.message);
            tempFile.removeCallback();
          })
        );
      }
    });

    await Promise.all(uploadPromises);

    const updatedDescription = $.html();

    // Save the blog with cleaned description
    const blog = new Blog({
      title,
      author,
      category,
      description: updatedDescription,
      imageUrl: uploadResult.secure_url,
    });

    await blog.save();
    res.status(201).json({ message: 'Blog uploaded successfully', blog });
  } catch (err) {
    console.error('Error uploading blog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Get all blogs
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update blog image
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

// Toggle blog status (active/inactive)
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

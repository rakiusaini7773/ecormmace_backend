const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createCategory, getAllCategories } = require('../controllers/categoryController');

router.post('/add', auth, createCategory);
router.get('/', getAllCategories);

module.exports = router;
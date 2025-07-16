const express = require('express');
const router = express.Router();
const {
  subscribeUser,
  getSubscribers
} = require('../controllers/subscriberController');

router.post('/subscribe', subscribeUser);
router.get('/subscribers', getSubscribers); // Optional admin route

module.exports = router;

const Subscriber = require('../models/Subscriber');

// POST /api/subscribe
exports.subscribeUser = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const exists = await Subscriber.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already subscribed' });
    }

    const newSub = new Subscriber({ email });
    await newSub.save();

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.log('err',err)
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// (Optional) GET /api/subscribers - for admin panel
exports.getSubscribers = async (req, res) => {
  try {
    const subs = await Subscriber.find().sort({ subscribedAt: -1 });
    res.status(200).json(subs);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

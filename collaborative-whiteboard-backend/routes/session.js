// routes/session.js
const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const auth = require('../middleware/auth');

// Create Session
router.post('/session', auth, async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = new Session({ sessionId });
    await session.save();
    res.status(201).json({ message: 'Session created', sessionId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Session State
router.get('/session/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({ sessionId: req.params.id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

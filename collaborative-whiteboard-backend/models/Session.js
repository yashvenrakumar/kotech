// models/Session.js
const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  canvasState: { type: Array, default: [] },
  users: { type: Array, default: [] },
});

module.exports = mongoose.model('Session', SessionSchema);

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  completed: { type: Boolean, default: true },
  note: { type: String, default: '' },
});

const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  icon: { type: String, default: '⭐' },
  frequency: { type: String, enum: ['daily', 'weekdays', 'weekly'], default: 'daily' },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  logs: [logSchema],
  color: { type: String, default: '#7c6ef5' },
  active: { type: Boolean, default: true },
}, { timestamps: true });

habitSchema.index({ user: 1, active: 1 });

module.exports = mongoose.model('Habit', habitSchema);

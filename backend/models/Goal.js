const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: {
    type: String,
    enum: ['health', 'learning', 'finance', 'career', 'personal'],
    default: 'personal',
  },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  targetDate: { type: Date },
  completedAt: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'paused', 'abandoned'], default: 'active' },
  milestones: [milestoneSchema],
  color: { type: String, default: '#7c6ef5' },
}, { timestamps: true });

goalSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);

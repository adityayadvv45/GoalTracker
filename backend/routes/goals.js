const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/goals
router.get('/', async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;
    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/goals
router.post('/', async (req, res) => {
  try {
    const { name, description, category, priority, targetDate, milestones, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Goal name is required' });
    const goal = await Goal.create({
      user: req.user._id, name, description, category, priority, targetDate, milestones: milestones || [], color
    });
    res.status(201).json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/goals/:id
router.get('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/goals/:id
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    const fields = ['name','description','category','priority','progress','targetDate','status','milestones','color'];
    fields.forEach(f => { if (req.body[f] !== undefined) goal[f] = req.body[f]; });
    if (req.body.status === 'completed' && !goal.completedAt) goal.completedAt = new Date();
    const updated = await goal.save();
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/goals/:id/progress
router.patch('/:id/progress', async (req, res) => {
  try {
    const { progress } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { progress, ...(progress === 100 ? { status: 'completed', completedAt: new Date() } : {}) },
      { new: true }
    );
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

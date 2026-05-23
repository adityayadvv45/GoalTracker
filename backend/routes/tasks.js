const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const { status, priority, goalId, dueToday } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (goalId) filter.goal = goalId;
    if (dueToday === 'true') {
      const start = new Date(); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(23,59,59,999);
      filter.dueDate = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(filter).populate('goal', 'name category color').sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { name, description, priority, dueDate, goal, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Task name is required' });
    const task = await Task.create({ user: req.user._id, name, description, priority, dueDate, goal: goal || null, tags: tags || [] });
    await task.populate('goal', 'name category color');
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/tasks/:id
router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const fields = ['name','description','priority','dueDate','goal','tags','status'];
    fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    if (req.body.status === 'completed') task.completedAt = new Date();
    const updated = await task.save();
    await updated.populate('goal', 'name category color');
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/tasks/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = task.status === 'completed' ? 'pending' : 'completed';
    task.completedAt = task.status === 'completed' ? new Date() : null;
    await task.save();
    await task.populate('goal', 'name category color');
    res.json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

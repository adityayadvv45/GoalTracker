const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/habits
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id, active: true }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/habits
router.post('/', async (req, res) => {
  try {
    const { name, icon, frequency, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Habit name is required' });
    const habit = await Habit.create({ user: req.user._id, name, icon: icon || '⭐', frequency: frequency || 'daily', color: color || '#7c6ef5' });
    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PATCH /api/habits/:id/log
router.patch('/:id/log', async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const today = new Date().toISOString().split('T')[0];
    const alreadyLogged = habit.logs.find(l => l.date === today);
    if (alreadyLogged) {
      habit.logs = habit.logs.filter(l => l.date !== today);
      // Recalculate streak
    } else {
      habit.logs.push({ date: today, completed: true, note: req.body.note || '' });
      // Recalculate streak
      let streak = 0;
      const check = new Date();
      while (true) {
        const d = check.toISOString().split('T')[0];
        if (habit.logs.find(l => l.date === d)) { streak++; check.setDate(check.getDate() - 1); }
        else break;
      }
      habit.streak = streak;
      if (streak > habit.longestStreak) habit.longestStreak = streak;
    }
    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/habits/:id
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { active: false },
      { new: true }
    );
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    res.json({ message: 'Habit archived' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

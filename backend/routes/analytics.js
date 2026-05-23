const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/analytics/summary
router.get('/summary', async (req, res) => {
  try {
    const uid = req.user._id;
    const [totalGoals, completedGoals, totalTasks, completedTasks, habits] = await Promise.all([
      Goal.countDocuments({ user: uid, status: 'active' }),
      Goal.countDocuments({ user: uid, status: 'completed' }),
      Task.countDocuments({ user: uid }),
      Task.countDocuments({ user: uid, status: 'completed' }),
      Habit.find({ user: uid, active: true }),
    ]);

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const maxStreak = habits.length ? Math.max(...habits.map(h => h.streak)) : 0;

    // Tasks by day (last 7 days)
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0,0,0,0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const done = await Task.countDocuments({ user: uid, status: 'completed', completedAt: { $gte: d, $lt: next } });
      const total = await Task.countDocuments({ user: uid, dueDate: { $gte: d, $lt: next } });
      days.push({ label: d.toLocaleDateString('en', { weekday: 'short' }), completed: done, total });
    }

    // Goals by category
    const categories = ['health','learning','finance','career','personal'];
    const catData = await Promise.all(categories.map(async cat => ({
      category: cat,
      count: await Goal.countDocuments({ user: uid, category: cat })
    })));

    res.json({ totalGoals, completedGoals, totalTasks, completedTasks, completionRate, maxStreak, weeklyData: days, categoryData: catData });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/analytics/monthly
router.get('/monthly', async (req, res) => {
  try {
    const uid = req.user._id;
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const completed = await Task.countDocuments({ user: uid, status: 'completed', completedAt: { $gte: start, $lte: end } });
      const total = await Task.countDocuments({ user: uid, createdAt: { $lte: end } });
      data.push({ month: d.toLocaleDateString('en', { month: 'short' }), completed, total, rate: total > 0 ? Math.round(completed/total*100) : 0 });
    }
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

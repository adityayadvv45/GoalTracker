import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

export default function Streaks() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '', frequency: 'daily', color: '#7c6ef5' });

  const fetch = async () => {
    try { const { data } = await api.get('/habits'); setHabits(data); }
    catch { toast.error('Failed to load habits'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const logHabit = async (id) => {
    try {
      const { data } = await api.patch(`/habits/${id}/log`);
      setHabits(hs => hs.map(h => h._id === id ? data : h));
      toast.success(`🔥 Habit logged! Streak: ${data.streak} days`);
    } catch { toast.error('Failed to log habit'); }
  };

  const addHabit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/habits', form);
      setHabits(hs => [data, ...hs]);
      toast.success('⚡ New habit created!');
      setShowModal(false);
      setForm({ name: '', icon: '', frequency: 'daily', color: '#7c6ef5' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating habit'); }
  };

  const deleteHabit = async (id) => {
    if (!confirm('Archive this habit?')) return;
    try { await api.delete(`/habits/${id}`); setHabits(hs => hs.filter(h => h._id !== id)); toast.success('Habit archived'); }
    catch { toast.error('Failed to archive'); }
  };

  // Get last 14 log dates as grid
  const getLast14 = (logs) => {
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const logged = logs?.find(l => l.date === key);
      result.push({ date: key, done: !!logged, isToday: i === 0 });
    }
    return result;
  };

  const totalStreak = habits.length ? Math.max(...habits.map(h => h.streak), 0) : 0;
  const avgConsistency = habits.length
    ? Math.round(habits.reduce((acc, h) => {
        const done = h.logs?.length || 0;
        return acc + (done / 14) * 100;
      }, 0) / habits.length)
    : 0;

  if (loading) return <div className="p-8 text-text-3 text-sm">Loading habits...</div>;

  return (
    <div className="p-7 animate-fade-in">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="page-title">Streaks & Habits</h1>
          <p className="text-text-3 text-sm mt-1">Build consistency, forge identity</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Habit
        </button>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center py-6">
          <div className="text-5xl font-extrabold font-syne streak-glow leading-none">{totalStreak}</div>
          <p className="text-sm text-text-3 mt-2">Best Active Streak 🔥</p>
          <p className="text-xs text-text-3 mt-1">Longest habit chain</p>
        </div>
        <div className="card text-center py-6">
          <div className="text-5xl font-extrabold font-syne streak-glow leading-none">{avgConsistency}%</div>
          <p className="text-sm text-text-3 mt-2">14-Day Consistency</p>
          <p className="text-xs text-text-3 mt-1">Average across all habits</p>
        </div>
        <div className="card text-center py-6">
          <div className="text-5xl font-extrabold font-syne streak-glow leading-none">{habits.length}</div>
          <p className="text-sm text-text-3 mt-2">Active Habits</p>
          <p className="text-xs text-text-3 mt-1">Being tracked now</p>
        </div>
      </div>

      {/* Habit cards */}
      {habits.length === 0 ? (
        <div className="text-center py-16 text-text-3">
          <div className="text-5xl mb-3">⚡</div>
          <p className="text-sm">No habits yet. Start building your streak!</p>
          <button className="btn-primary mx-auto mt-4" onClick={() => setShowModal(true)}>Create first habit</button>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map(h => {
            const grid = getLast14(h.logs);
            const todayLogged = h.logs?.find(l => l.date === new Date().toISOString().split('T')[0]);
            const consistency = Math.round((h.logs?.length || 0) / 14 * 100);
            return (
              <div key={h._id} className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{h.icon || '⭐'}</span>
                    <div>
                      <p className="text-sm font-semibold text-text-1 font-syne">{h.name}</p>
                      <p className="text-xs text-text-3">{h.frequency} · 🔥 {h.streak} day streak · Best: {h.longestStreak}d</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-accent/15 text-accent-2">{consistency}%</span>
                    <button onClick={() => logHabit(h._id)}
                      className={`btn-sm ${todayLogged ? 'btn-ghost' : 'btn-primary'}`}>
                      {todayLogged ? '✓ Done today' : 'Log today'}
                    </button>
                    <button onClick={() => deleteHabit(h._id)} className="p-1.5 text-text-3 hover:text-red-400 transition-colors">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="text-center text-[10px] text-text-3">{d}</div>
                  ))}
                </div>

                {/* Streak grid */}
                <div className="grid grid-cols-7 gap-1">
                  {grid.map((cell, i) => (
                    <div key={i} className={`habit-dot ${cell.done ? 'done' : 'missed'} ${cell.isToday ? 'today' : ''}`}
                      title={`${cell.date}: ${cell.done ? 'Done ✓' : 'Missed'}`} />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[10px] text-text-3 mb-1">
                    <span>14-day consistency</span>
                    <span>{consistency}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${consistency}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-fade-in">
            <h2 className="text-lg font-extrabold font-syne mb-5">New Habit</h2>
            <form onSubmit={addHabit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Habit Name *</label>
                <input className="form-input" placeholder="e.g. Morning meditation" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Icon (emoji)</label>
                  <input className="form-input" placeholder="🧘" maxLength={2} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Frequency</label>
                  <select className="form-input" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}>
                    <option value="daily">Daily</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Habit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

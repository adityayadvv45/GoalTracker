import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const CAT_COLOR = { health: '#22c55e', learning: '#7c6ef5', finance: '#f59e0b', career: '#06b6d4', personal: '#f472b6' };
const CAT_EMOJI = { health: '🏃', learning: '📚', finance: '💰', career: '🚀', personal: '✨' };
const CATS = ['all', 'health', 'learning', 'finance', 'career', 'personal'];

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: 'personal', priority: 'medium', targetDate: '', progress: 0 });
  const [editId, setEditId] = useState(null);

  const fetch = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch { toast.error('Failed to load goals'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const filtered = filter === 'all' ? goals : goals.filter(g => g.category === filter);

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await api.put(`/goals/${editId}`, form);
        setGoals(gs => gs.map(g => g._id === editId ? data : g));
        toast.success('Goal updated! ✨');
      } else {
        const { data } = await api.post('/goals', form);
        setGoals(gs => [data, ...gs]);
        toast.success('Goal created! 🎯');
      }
      setShowModal(false); setForm({ name: '', description: '', category: 'personal', priority: 'medium', targetDate: '', progress: 0 }); setEditId(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving goal'); }
  };

  const deleteGoal = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try { await api.delete(`/goals/${id}`); setGoals(gs => gs.filter(g => g._id !== id)); toast.success('Goal removed'); }
    catch { toast.error('Failed to delete'); }
  };

  const updateProgress = async (id, progress) => {
    try {
      const { data } = await api.patch(`/goals/${id}/progress`, { progress });
      setGoals(gs => gs.map(g => g._id === id ? data : g));
    } catch { toast.error('Failed to update progress'); }
  };

  const openEdit = (g) => {
    setForm({ name: g.name, description: g.description || '', category: g.category, priority: g.priority, targetDate: g.targetDate?.split('T')[0] || '', progress: g.progress });
    setEditId(g._id); setShowModal(true);
  };

  const priorityBadge = (p) => {
    const map = { high: 'bg-red-500/15 text-red-400', medium: 'bg-amber-500/15 text-amber-400', low: 'bg-green-500/15 text-green-400' };
    return <span className={`badge ${map[p]}`}>{p}</span>;
  };

  if (loading) return <div className="p-8 text-text-3 text-sm">Loading goals...</div>;

  return (
    <div className="p-7 animate-fade-in">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="page-title">Goals</h1>
          <p className="text-text-3 text-sm mt-1">{goals.length} goals · {goals.filter(g => g.status === 'completed').length} completed</p>
        </div>
        <button className="btn-primary" onClick={() => { setEditId(null); setShowModal(true); }}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Goal
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {CATS.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === c ? 'bg-accent/15 text-accent-2 border-accent/30' : 'bg-transparent text-text-3 border-white/10 hover:border-white/20 hover:text-text-2'}`}>
            {c === 'all' ? 'All' : `${CAT_EMOJI[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-text-3">
          <div className="text-5xl mb-3">🎯</div>
          <p className="text-sm">No goals in this category yet.</p>
          <button className="btn-primary mx-auto mt-4" onClick={() => setShowModal(true)}>Create your first goal</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(g => (
            <div key={g._id} className="card hover:border-white/10 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{CAT_EMOJI[g.category]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold font-syne text-accent-2">{g.progress}%</span>
                  {priorityBadge(g.priority)}
                </div>
              </div>
              <h3 className="font-semibold text-sm text-text-1 font-syne mb-1 leading-tight">{g.name}</h3>
              {g.description && <p className="text-xs text-text-3 mb-2 line-clamp-2">{g.description}</p>}
              <div className="progress-bar mb-3">
                <div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, background: CAT_COLOR[g.category] }} />
              </div>
              {/* Progress slider */}
              <input type="range" min="0" max="100" value={g.progress}
                onChange={e => setGoals(gs => gs.map(gg => gg._id === g._id ? { ...gg, progress: +e.target.value } : gg))}
                onMouseUp={e => updateProgress(g._id, +e.target.value)}
                className="w-full accent-violet-500 mb-3" style={{ height: '3px' }} />
              <div className="flex items-center justify-between">
                {g.targetDate && <p className="text-[10px] text-text-3">Due: {new Date(g.targetDate).toLocaleDateString()}</p>}
                <div className="flex gap-1.5 ml-auto">
                  <button onClick={() => openEdit(g)} className="text-text-3 hover:text-accent-2 transition-colors p-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => deleteGoal(g._id)} className="text-text-3 hover:text-red-400 transition-colors p-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal animate-fade-in">
            <h2 className="text-lg font-extrabold font-syne mb-5">{editId ? 'Edit Goal' : 'Create New Goal'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Goal Name *</label>
                <input className="form-input" placeholder="e.g. Run a 5K marathon" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(CAT_EMOJI).map(([k, v]) => (
                    <button type="button" key={k} onClick={() => setForm(f => ({ ...f, category: k }))}
                      className={`px-3 py-1.5 rounded-full text-xs border transition-all ${form.category === k ? 'bg-accent/15 text-accent-2 border-accent/30' : 'border-white/10 text-text-3 hover:border-white/20'}`}>
                      {v} {k}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Priority</label>
                  <select className="form-input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Target Date</label>
                  <input className="form-input" type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Description</label>
                <textarea className="form-input" rows="2" placeholder="What does success look like?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              {editId && (
                <div>
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Progress: {form.progress}%</label>
                  <input type="range" min="0" max="100" value={form.progress} onChange={e => setForm(f => ({ ...f, progress: +e.target.value }))} className="w-full accent-violet-500" />
                </div>
              )}
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update Goal' : 'Create Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

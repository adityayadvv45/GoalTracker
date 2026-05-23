import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const FILTERS = ['all', 'pending', 'completed', 'today', 'high'];

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', priority: 'medium', dueDate: '', goal: '' });

  const fetchAll = async () => {
    try {
      const [t, g] = await Promise.all([api.get('/tasks'), api.get('/goals')]);
      setTasks(t.data);
      setGoals(g.data);
    } catch { toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = tasks.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'today') return t.dueDate?.split('T')[0] === todayStr;
    if (filter === 'high') return t.priority === 'high';
    return true;
  });

  const toggle = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      setTasks(ts => ts.map(t => t._id === id ? data : t));
      toast.success(data.status === 'completed' ? '✅ Task done!' : '↩️ Reopened');
    } catch { toast.error('Failed to toggle task'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        const { data } = await api.put(`/tasks/${editId}`, form);
        setTasks(ts => ts.map(t => t._id === editId ? data : t));
        toast.success('Task updated!');
      } else {
        const { data } = await api.post('/tasks', form);
        setTasks(ts => [data, ...ts]);
        toast.success('Task added! ✅');
      }
      closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving task'); }
  };

  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await api.delete(`/tasks/${id}`); setTasks(ts => ts.filter(t => t._id !== id)); toast.success('Task deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const openEdit = (t) => {
    setForm({ name: t.name, description: t.description || '', priority: t.priority, dueDate: t.dueDate?.split('T')[0] || '', goal: t.goal?._id || '' });
    setEditId(t._id); setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditId(null); setForm({ name: '', description: '', priority: 'medium', dueDate: '', goal: '' }); };

  const priorityColor = { high: 'text-red-400', medium: 'text-amber-400', low: 'text-green-400' };
  const priorityDot = { high: '🔴', medium: '🟡', low: '🟢' };

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const doneCount = tasks.filter(t => t.status === 'completed').length;

  if (loading) return <div className="p-8 text-text-3 text-sm">Loading tasks...</div>;

  return (
    <div className="p-7 animate-fade-in">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-text-3 text-sm mt-1">{pendingCount} pending · {doneCount} completed</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Task
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-bg-3 border border-white/10 rounded-lg px-3 py-2 mb-4">
        <svg className="w-4 h-4 text-text-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input className="flex-1 bg-transparent outline-none text-sm text-text-1 placeholder-text-3" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch('')} className="text-text-3 hover:text-text-2">✕</button>}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filter === f ? 'bg-accent/15 text-accent-2 border-accent/30' : 'bg-transparent text-text-3 border-white/10 hover:border-white/20 hover:text-text-2'}`}>
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending' : f === 'completed' ? 'Completed' : f === 'today' ? 'Today' : '🔴 High Priority'}
          </button>
        ))}
      </div>

      {/* Tasks list */}
      <div className="card">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-3">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-sm">{search ? 'No tasks match your search.' : 'No tasks here yet.'}</p>
            <button className="btn-primary mx-auto mt-4" onClick={() => setShowModal(true)}>Add a task</button>
          </div>
        ) : filtered.map(t => (
          <div key={t._id} className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 group">
            <button onClick={() => toggle(t._id)}
              className={`w-4.5 h-4.5 mt-0.5 rounded border flex-shrink-0 flex items-center justify-center transition-all ${t.status === 'completed' ? 'bg-accent border-accent' : 'border-white/25 hover:border-accent'}`}
              style={{ width: 18, height: 18 }}>
              {t.status === 'completed' && <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2"><path d="M2 6l3 3 5-5"/></svg>}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.status === 'completed' ? 'line-through text-text-3' : 'text-text-1'}`}>{t.name}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-xs ${priorityColor[t.priority]}`}>{priorityDot[t.priority]} {t.priority}</span>
                {t.dueDate && <span className="text-xs text-text-3">Due: {new Date(t.dueDate).toLocaleDateString()}</span>}
                {t.goal && <span className="text-xs text-accent-2 bg-accent/10 px-2 py-0.5 rounded-full">{t.goal.name}</span>}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(t)} className="p-1.5 text-text-3 hover:text-accent-2 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => deleteTask(t._id)} className="p-1.5 text-text-3 hover:text-red-400 transition-colors">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal animate-fade-in">
            <h2 className="text-lg font-extrabold font-syne mb-5">{editId ? 'Edit Task' : 'Add New Task'}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Task Name *</label>
                <input className="form-input" placeholder="e.g. Read 20 pages" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
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
                  <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Due Date</label>
                  <input className="form-input" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Linked Goal</label>
                <select className="form-input" value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}>
                  <option value="">No linked goal</option>
                  {goals.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Notes</label>
                <textarea className="form-input" rows="2" placeholder="Optional notes..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" className="btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update Task' : 'Add Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

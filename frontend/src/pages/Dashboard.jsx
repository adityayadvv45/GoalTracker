import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip);

const CAT_COLOR = { health: '#22c55e', learning: '#7c6ef5', finance: '#f59e0b', career: '#06b6d4', personal: '#f472b6' };
const CAT_EMOJI = { health: '🏃', learning: '📚', finance: '💰', career: '🚀', personal: '✨' };

export default function Dashboard() {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [g, t, s] = await Promise.all([
        api.get('/goals?status=active'),
        api.get('/tasks?dueToday=true'),
        api.get('/analytics/summary'),
      ]);
      setGoals(g.data.slice(0, 5));
      setTasks(t.data.slice(0, 6));
      setSummary(s.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const toggleTask = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      setTasks(ts => ts.map(t => t._id === id ? data : t));
      toast.success(data.status === 'completed' ? '✅ Task done!' : '↩️ Task reopened');
    } catch { toast.error('Failed to update task'); }
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading) return <div className="p-8 text-text-3 text-sm">Loading dashboard...</div>;

  const chartData = {
    labels: summary?.weeklyData?.map(d => d.label) || [],
    datasets: [
      { label: 'Completed', data: summary?.weeklyData?.map(d => d.completed) || [], backgroundColor: 'rgba(124,110,245,0.8)', borderRadius: 5 },
      { label: 'Total', data: summary?.weeklyData?.map(d => d.total) || [], backgroundColor: 'rgba(124,110,245,0.15)', borderRadius: 5 },
    ],
  };

  return (
    <div className="p-7 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="page-title">{greet()}, {firstName} ✦</h1>
          <p className="text-text-3 text-sm mt-1">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} · {tasks.filter(t => t.status === 'pending').length} tasks due today</p>
        </div>
        <Link to="/goals" className="btn-primary">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          New Goal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {[
          { label: 'Active Goals', value: summary?.totalGoals ?? 0, color: 'text-accent-2', change: 'Across all categories' },
          { label: 'Completion Rate', value: `${summary?.completionRate ?? 0}%`, color: 'text-brand-green', change: 'Tasks completed' },
          { label: 'Current Streak', value: `🔥 ${user?.streak ?? 0}d`, color: 'text-brand-amber', change: 'Keep it up!' },
          { label: 'Done Today', value: `${tasks.filter(t => t.status === 'completed').length}/${tasks.length}`, color: 'text-brand-cyan', change: 'Tasks completed' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-extrabold font-syne ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-text-3 mt-1.5">{s.change}</p>
          </div>
        ))}
      </div>

      {/* Goals + Tasks */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="section-title">Active Goals</div>
          {goals.length === 0 ? (
            <div className="text-center py-8 text-text-3 text-sm">
              <div className="text-3xl mb-2">🎯</div>
              <Link to="/goals" className="text-accent-2 hover:underline">Create your first goal →</Link>
            </div>
          ) : goals.map(g => (
            <div key={g._id} className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: `${CAT_COLOR[g.category]}20` }}>
                {CAT_EMOJI[g.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-1 truncate">{g.name}</p>
                <div className="progress-bar mt-1.5"><div className="h-full rounded-full transition-all" style={{ width: `${g.progress}%`, background: CAT_COLOR[g.category] }} /></div>
              </div>
              <span className="text-xs font-bold text-accent-2 font-syne ml-1">{g.progress}%</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">Today's Tasks</div>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-text-3 text-sm">
              <div className="text-3xl mb-2">✅</div>
              <Link to="/tasks" className="text-accent-2 hover:underline">Add tasks →</Link>
            </div>
          ) : tasks.map(t => (
            <div key={t._id} className="flex items-start gap-2.5 py-2.5 border-b border-white/5 last:border-0">
              <button onClick={() => toggleTask(t._id)}
                className={`w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-all ${t.status === 'completed' ? 'bg-accent border-accent' : 'border-white/20 hover:border-accent'}`}>
                {t.status === 'completed' && <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.2"><path d="M2 6l3 3 5-5"/></svg>}
              </button>
              <div className="flex-1">
                <p className={`text-xs font-medium ${t.status === 'completed' ? 'line-through text-text-3' : 'text-text-1'}`}>{t.name}</p>
                <p className="text-[10px] text-text-3 mt-0.5">{t.priority === 'high' ? '🔴' : t.priority === 'medium' ? '🟡' : '🟢'} {t.priority} · {t.goal?.name || 'No goal'}</p>
              </div>
            </div>
          ))}
          <Link to="/tasks" className="btn-ghost btn-sm w-full justify-center mt-3 text-xs">View all tasks →</Link>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <div className="section-title">Weekly Progress</div>
        <div style={{ height: 200 }}>
          <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a8a3c8', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a8a3c8', font: { size: 11 } }, beginAtZero: true } } }} />
        </div>
      </div>
    </div>
  );
}

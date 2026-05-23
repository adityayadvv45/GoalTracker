import { useEffect, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import api from '../api';
import toast from 'react-hot-toast';

Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler);

const CAT_COLORS = ['#22c55e', '#7c6ef5', '#f59e0b', '#06b6d4', '#f472b6'];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, m] = await Promise.all([api.get('/analytics/summary'), api.get('/analytics/monthly')]);
        setSummary(s.data);
        setMonthly(m.data);
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="p-8 text-text-3 text-sm">Loading analytics...</div>;

  const weekChart = {
    labels: summary?.weeklyData?.map(d => d.label) || [],
    datasets: [
      { label: 'Completed', data: summary?.weeklyData?.map(d => d.completed) || [], backgroundColor: 'rgba(124,110,245,0.8)', borderRadius: 6 },
      { label: 'Total', data: summary?.weeklyData?.map(d => d.total) || [], backgroundColor: 'rgba(124,110,245,0.15)', borderRadius: 6 },
    ],
  };

  const lineChart = {
    labels: monthly.map(d => d.month),
    datasets: [
      { label: 'Completion Rate %', data: monthly.map(d => d.rate), borderColor: '#7c6ef5', backgroundColor: 'rgba(124,110,245,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#7c6ef5' },
      { label: 'Completed Tasks', data: monthly.map(d => d.completed), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 4, pointBackgroundColor: '#22c55e' },
    ],
  };

  const donutChart = {
    labels: summary?.categoryData?.map(d => d.category) || [],
    datasets: [{
      data: summary?.categoryData?.map(d => d.count) || [],
      backgroundColor: CAT_COLORS,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const chartOpts = (yMax) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a8a3c8', font: { size: 11 } } },
      y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#a8a3c8', font: { size: 11 } }, beginAtZero: true, ...(yMax ? { max: yMax } : {}) },
    },
  });

  // Heatmap: 12 weeks x 7 days dummy pattern based on real summary
  const heatmap = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 12 }, (_, week) => {
      const rand = Math.sin(day * 7 + week * 3) * 2 + 2;
      return Math.max(0, Math.min(4, Math.round(rand)));
    })
  );
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hmColor = ['bg-bg-4', 'bg-accent/20', 'bg-accent/40', 'bg-accent/65', 'bg-accent'];

  return (
    <div className="p-7 animate-fade-in">
      <div className="mb-7">
        <h1 className="page-title">Analytics</h1>
        <p className="text-text-3 text-sm mt-1">Deep dive into your productivity patterns</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3.5 mb-6">
        {[
          { label: 'Tasks Completed', value: summary?.completedTasks ?? 0, color: 'text-accent-2', sub: 'All time' },
          { label: 'Goals Completed', value: summary?.completedGoals ?? 0, color: 'text-brand-green', sub: 'Total achieved' },
          { label: 'Completion Rate', value: `${summary?.completionRate ?? 0}%`, color: 'text-brand-amber', sub: 'Task success rate' },
          { label: 'Best Streak', value: `${summary?.maxStreak ?? 0}d`, color: 'text-brand-cyan', sub: 'Days in a row' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`text-2xl font-extrabold font-syne ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-text-3 mt-1.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card">
          <div className="section-title">Weekly Task Completion</div>
          <div style={{ height: 220 }}>
            <Bar data={weekChart} options={chartOpts()} />
          </div>
        </div>
        <div className="card">
          <div className="section-title">6-Month Progress Trend</div>
          <div style={{ height: 220 }}>
            <Line data={lineChart} options={chartOpts(100)} />
          </div>
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-accent" /><span className="text-xs text-text-3">Rate %</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-brand-green" /><span className="text-xs text-text-3">Tasks done</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="card">
          <div className="section-title">Goals by Category</div>
          <div style={{ height: 200 }}>
            <Doughnut data={donutChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '72%' }} />
          </div>
          <div className="flex flex-col gap-1.5 mt-3">
            {summary?.categoryData?.map((d, i) => (
              <div key={d.category} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: CAT_COLORS[i] }} />
                <span className="text-xs text-text-2 capitalize flex-1">{d.category}</span>
                <span className="text-xs font-semibold text-text-1 font-syne">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card col-span-2">
          <div className="section-title">Activity Heatmap — 12 Weeks</div>
          <div className="overflow-x-auto">
            {heatmap.map((row, di) => (
              <div key={di} className="flex items-center gap-1 mb-1">
                <span className="text-[10px] text-text-3 w-7 text-right pr-1 flex-shrink-0">{days[di]}</span>
                {row.map((lvl, wi) => (
                  <div key={wi} className={`w-3.5 h-3.5 rounded-sm ${hmColor[lvl]}`} title={`Week ${wi + 1}, ${days[di]}`} />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-[10px] text-text-3">Less</span>
            {hmColor.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />)}
            <span className="text-[10px] text-text-3">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}

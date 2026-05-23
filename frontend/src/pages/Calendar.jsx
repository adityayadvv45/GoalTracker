import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function Calendar() {
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState({ month: new Date().getMonth(), year: new Date().getFullYear() });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [g, t] = await Promise.all([api.get('/goals'), api.get('/tasks')]);
        setGoals(g.data);
        setTasks(t.data);
      } catch { toast.error('Failed to load calendar data'); }
    };
    fetch();
  }, []);

  const changeMonth = (dir) => {
    setCurrent(c => {
      let m = c.month + dir, y = c.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { month: m, year: y };
    });
    setSelected(null);
  };

  const goToday = () => { setCurrent({ month: today.getMonth(), year: today.getFullYear() }); setSelected(null); };

  const getEventsForDate = (day) => {
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const goalEvents = goals.filter(g => g.targetDate?.split('T')[0] === dateStr);
    const taskEvents = tasks.filter(t => t.dueDate?.split('T')[0] === dateStr);
    return { goalEvents, taskEvents };
  };

  const buildCalendar = () => {
    const first = new Date(current.year, current.month, 1);
    const last = new Date(current.year, current.month + 1, 0);
    const startDay = first.getDay();
    const days = [];

    // prev month fill
    for (let i = 0; i < startDay; i++) {
      const d = new Date(current.year, current.month, 1 - startDay + i);
      days.push({ day: d.getDate(), current: false, date: d });
    }
    // current month
    for (let d = 1; d <= last.getDate(); d++) {
      days.push({ day: d, current: true, date: new Date(current.year, current.month, d) });
    }
    // next month fill
    const rem = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= rem; i++) {
      days.push({ day: i, current: false, date: new Date(current.year, current.month + 1, i) });
    }
    return days;
  };

  const calDays = buildCalendar();

  const isToday = (d) =>
    d.current && d.day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();

  const selectedEvents = selected ? getEventsForDate(selected) : null;

  return (
    <div className="p-7 animate-fade-in">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="page-title">Calendar</h1>
          <p className="text-text-3 text-sm mt-1">Visualize your goals and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost btn-sm" onClick={goToday}>Today</button>
          <button className="btn-ghost btn-sm" onClick={() => changeMonth(-1)}>←</button>
          <span className="text-sm font-semibold font-syne text-text-1 min-w-[140px] text-center">
            {MONTHS[current.month]} {current.year}
          </span>
          <button className="btn-ghost btn-sm" onClick={() => changeMonth(1)}>→</button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Calendar grid */}
        <div className="col-span-2 card">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-text-3 py-2 font-syne">{d}</div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calDays.map((cell, i) => {
              const { goalEvents, taskEvents } = cell.current ? getEventsForDate(cell.day) : { goalEvents: [], taskEvents: [] };
              const hasEvents = goalEvents.length + taskEvents.length > 0;
              return (
                <div key={i}
                  onClick={() => cell.current && setSelected(cell.day)}
                  className={`min-h-[70px] rounded-lg p-1.5 border transition-all cursor-pointer
                    ${!cell.current ? 'opacity-30 cursor-default' : 'hover:border-white/15'}
                    ${isToday(cell) ? 'border-accent bg-accent/5' : 'border-white/5'}
                    ${selected === cell.day && cell.current ? 'border-accent/50 bg-accent/10' : ''}`}>
                  <p className={`text-xs font-semibold font-syne mb-1 ${isToday(cell) ? 'text-accent-2' : 'text-text-2'}`}>
                    {cell.day}
                  </p>
                  {goalEvents.slice(0, 1).map(g => (
                    <div key={g._id} className="text-[10px] px-1 py-0.5 rounded bg-accent/20 text-accent-2 truncate mb-0.5">{g.name}</div>
                  ))}
                  {taskEvents.slice(0, 1).map(t => (
                    <div key={t._id} className="text-[10px] px-1 py-0.5 rounded bg-green-500/15 text-green-400 truncate mb-0.5">{t.name}</div>
                  ))}
                  {(goalEvents.length + taskEvents.length > 2) && (
                    <div className="text-[10px] text-text-3">+{goalEvents.length + taskEvents.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-accent/30" />
              <span className="text-xs text-text-3">Goal deadline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500/25" />
              <span className="text-xs text-text-3">Task due</span>
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="card">
          {selected && selectedEvents ? (
            <>
              <p className="section-title">
                {MONTHS[current.month]} {selected}, {current.year}
              </p>
              {selectedEvents.goalEvents.length === 0 && selectedEvents.taskEvents.length === 0 ? (
                <div className="text-center py-8 text-text-3">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-xs">Nothing scheduled</p>
                </div>
              ) : (
                <>
                  {selectedEvents.goalEvents.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">Goal Deadlines</p>
                      {selectedEvents.goalEvents.map(g => (
                        <div key={g._id} className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg mb-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-2 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-text-1 truncate">{g.name}</p>
                            <p className="text-[10px] text-text-3">{g.progress}% complete</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedEvents.taskEvents.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-2">Tasks Due</p>
                      {selectedEvents.taskEvents.map(t => (
                        <div key={t._id} className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg mb-2">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-green-400' : 'bg-amber-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${t.status === 'completed' ? 'line-through text-text-3' : 'text-text-1'}`}>{t.name}</p>
                            <p className="text-[10px] text-text-3 capitalize">{t.priority} priority · {t.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-text-3">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-sm font-medium text-text-2 mb-1">Select a date</p>
              <p className="text-xs">Click any day to see scheduled goals and tasks</p>
            </div>
          )}

          {/* Upcoming events */}
          <div className="mt-6 pt-4 border-t border-white/5">
            <p className="text-[10px] font-semibold text-text-3 uppercase tracking-wider mb-3">Upcoming Deadlines</p>
            {goals
              .filter(g => g.targetDate && new Date(g.targetDate) >= today)
              .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))
              .slice(0, 4)
              .map(g => (
                <div key={g._id} className="flex items-center gap-2 mb-2.5">
                  <div className="w-1 h-8 rounded-full bg-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text-1 truncate">{g.name}</p>
                    <p className="text-[10px] text-text-3">{new Date(g.targetDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</p>
                  </div>
                  <span className="text-xs font-bold text-accent-2 font-syne">{g.progress}%</span>
                </div>
              ))}
            {goals.filter(g => g.targetDate && new Date(g.targetDate) >= today).length === 0 && (
              <p className="text-xs text-text-3">No upcoming deadlines</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

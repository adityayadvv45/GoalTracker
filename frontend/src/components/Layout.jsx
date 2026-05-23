import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: <GridIcon /> },
  { to: '/goals', label: 'Goals', icon: <TargetIcon /> },
  { to: '/tasks', label: 'Tasks', icon: <CheckIcon /> },
];
const NAV2 = [
  { to: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
  { to: '/streaks', label: 'Streaks', icon: <FlashIcon /> },
  { to: '/calendar', label: 'Calendar', icon: <CalIcon /> },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-bg-2 border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <h1 className="text-xl font-extrabold font-syne gradient-text">GoalFlow</h1>
          <p className="text-xs text-text-3 mt-0.5">Productivity OS</p>
        </div>
        <nav className="p-3 flex-1">
          <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest px-2 py-2 font-syne">Main</p>
          {NAV.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} mb-0.5`}>
              {icon} {label}
            </NavLink>
          ))}
          <p className="text-[10px] font-bold text-text-3 uppercase tracking-widest px-2 py-2 mt-3 font-syne">Insights</p>
          {NAV2.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} mb-0.5`}>
              {icon} {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-2.5 p-2.5 bg-bg-3 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-brand-cyan flex items-center justify-center text-xs font-bold font-syne text-white flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-1 truncate">{user?.name}</p>
              <p className="text-[10px] text-text-3">⚡ Lv.{user?.level} · {user?.xp} XP</p>
            </div>
            <button onClick={() => { logout(); navigate('/login'); }} className="text-text-3 hover:text-brand-red transition-colors" title="Logout">
              <LogoutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-bg-1">
        <Outlet />
      </main>
    </div>
  );
}

function GridIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>; }
function TargetIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>; }
function CheckIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>; }
function ChartIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>; }
function FlashIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>; }
function CalIcon() { return <svg className="w-4 h-4 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function LogoutIcon() { return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>; }

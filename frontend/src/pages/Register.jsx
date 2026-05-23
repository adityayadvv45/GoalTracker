import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { register, loading } = useAuth();

  const handle = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    const res = await register(form.name, form.email, form.password);
    if (!res.success) toast.error(res.message);
    else toast.success('Welcome to GoalFlow! 🎯');
  };

  return (
    <div className="min-h-screen bg-bg-1 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold font-syne gradient-text">GoalFlow</h1>
          <p className="text-text-3 text-sm mt-1">Start crushing your goals today</p>
        </div>
        <div className="card">
          <form onSubmit={handle} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Full Name</label>
              <input className="form-input" type="text" placeholder="Aditya Yadav" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-3 uppercase tracking-wider block mb-1.5">Password</label>
              <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2 disabled:opacity-50">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-text-3 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-2 hover:text-accent-3 transition-colors">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

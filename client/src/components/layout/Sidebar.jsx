import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Search, BarChart3, Brain,
  Bookmark, LogOut, Menu, X, Flame,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/library', icon: BookOpen, label: 'Library' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/models', icon: Brain, label: 'ML Models' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-white/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center font-bold text-lg">E</div>
          <div>
            <h1 className="font-display font-bold text-lg">EduSearch</h1>
            <p className="text-xs text-gray-500">Smart Assistant</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                active ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="glass p-4 mb-3">
          <div className="flex items-center gap-2 text-orange-400 mb-1">
            <Flame size={16} />
            <span className="text-sm font-semibold">{user?.studyStreak || 0} day streak</span>
          </div>
          <p className="text-xs text-gray-500">{user?.name}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-gray-400 hover:text-red-400 transition-colors">
          <LogOut size={18} /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2 glass">
        <Menu size={24} />
      </button>

      <aside className="hidden lg:flex w-64 h-screen flex-col glass border-r border-white/10 fixed left-0 top-0">
        <NavContent />
      </aside>

      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:hidden fixed inset-0 z-50 bg-black/60" onClick={() => setOpen(false)}>
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} className="w-72 h-full glass flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1"><X size={20} /></button>
            <NavContent />
          </motion.aside>
        </motion.div>
      )}
    </>
  );
}

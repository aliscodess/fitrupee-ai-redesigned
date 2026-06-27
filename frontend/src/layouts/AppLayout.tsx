import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Salad, Dumbbell, ShoppingCart, IndianRupee,
  MessageSquare, BarChart3, User, TrendingUp, LogOut,
  Menu, X, Zap, ChevronRight, Home,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: '#9b72ef' },
  { to: '/app/diet', icon: Salad, label: 'Diet Planner', color: '#34b96f' },
  { to: '/app/workout', icon: Dumbbell, label: 'Workout', color: '#3b82f6' },
  { to: '/app/grocery', icon: ShoppingCart, label: 'Grocery', color: '#a78bfa' },
  { to: '/app/protein-budget', icon: IndianRupee, label: 'Protein ₹100', color: '#f59e0b' },
  { to: '/app/chat', icon: MessageSquare, label: 'AI Chat', color: '#f472b6' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics', color: '#06b6d4' },
  { to: '/app/progress', icon: TrendingUp, label: 'Progress', color: '#10b981' },
  { to: '/app/profile', icon: User, label: 'Profile', color: '#8b5cf6' },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="app-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -288 }}
        className="app-sidebar"
      >
        <div className="app-sidebar-inner">
          {/* Logo */}
          <div className="app-sidebar-logo">
            <div className="app-logo-icon">
              <Zap size={17} />
            </div>
            <div>
              <h1 className="app-logo-name">FitRupee</h1>
              <span className="app-logo-sub">AI Fitness Coach</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="app-nav">
            {navItems.map(({ to, icon: Icon, label, color }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `app-nav-item ${isActive ? 'app-nav-item--active' : ''}`
                }
                style={({ isActive }) => isActive ? ({ '--nav-color': color } as any) : {}}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} style={{ color: isActive ? color : undefined }} />
                    <span className="flex-1">{label}</span>
                    {isActive && <ChevronRight size={13} style={{ color }} />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User */}
          <div className="app-sidebar-user">
            <div className="app-user-row">
              <div className="app-user-avatar">
                {user?.name.charAt(0).toUpperCase()}
              </div>
              <div className="app-user-info">
                <p className="app-user-name">{user?.name}</p>
                <p className="app-user-email">{user?.email}</p>
              </div>
            </div>
            <Link to="/" className="app-logout-btn" style={{ color: 'var(--text-muted)' }}>
              <Home size={15} />
              <span>Back to Home</span>
            </Link>
            <button onClick={handleLogout} className="app-logout-btn">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="app-main">
        {/* Mobile header */}
        <header className="app-mobile-header">
          <div className="flex items-center gap-2">
            <div className="app-logo-icon app-logo-icon--sm">
              <Zap size={13} />
            </div>
            <span className="app-logo-name">FitRupee AI</span>
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="app-hamburger">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {/* Page content */}
        <main className="app-content bg-mesh">
          <div className="app-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, Zap, IndianRupee, TrendingUp, Salad, Dumbbell,
  ShoppingCart, MessageSquare, AlertCircle, ArrowRight, Activity, Home,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { format, subDays } from 'date-fns';

interface DashboardData {
  profile: {
    bmi?: number;
    dailyCalorieTarget?: number;
    dailyProteinTarget?: number;
    monthlyBudget?: number;
    isProfileComplete?: boolean;
  };
  stats: {
    currentStreak: number;
    avgCaloriesThisWeek: number;
    avgProteinThisWeek: number;
    weeklyBudget: number;
    totalWorkoutsThisMonth: number;
  };
  hasMealPlan: boolean;
  hasWorkoutPlan: boolean;
  recentProgress: Array<{ date: string; calories?: number; protein?: number; weight?: number; workoutCompleted?: boolean }>;
}

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`skeleton ${className}`} />
);

export default function DashboardPage() {
  const { user, profile } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const chartData = data?.recentProgress.map(p => ({
    date: format(new Date(p.date), 'MMM d'),
    calories: p.calories || 0,
    protein: p.protein || 0,
    weight: p.weight || 0,
  })) || [];

  // Fill in last 7 days if no data
  const displayChartData = chartData.length > 0 ? chartData : Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM d'),
    calories: 0, protein: 0, weight: 0,
  }));

  const statCards = [
    {
      icon: Flame, label: 'Streak', value: loading ? '—' : `${data?.stats.currentStreak || 0} days`,
      sub: 'Keep it up!', color: 'text-saffron-400', bg: 'bg-saffron-500/10',
    },
    {
      icon: Zap, label: 'Avg Calories', value: loading ? '—' : `${data?.stats.avgCaloriesThisWeek || 0}`,
      sub: `Target: ${data?.profile.dailyCalorieTarget || '—'} kcal`, color: 'text-brand-400', bg: 'bg-brand-500/10',
    },
    {
      icon: Activity, label: 'Avg Protein', value: loading ? '—' : `${data?.stats.avgProteinThisWeek || 0}g`,
      sub: `Target: ${data?.profile.dailyProteinTarget || '—'}g/day`, color: 'text-blue-400', bg: 'bg-blue-500/10',
    },
    {
      icon: IndianRupee, label: 'Weekly Budget', value: loading ? '—' : `₹${data?.stats.weeklyBudget || 0}`,
      sub: `₹${data?.profile.monthlyBudget || 0}/month`, color: 'text-purple-400', bg: 'bg-purple-500/10',
    },
  ];

  const quickActions = [
    { to: '/app/diet', icon: Salad, label: 'Generate Meal Plan', color: 'brand', has: data?.hasMealPlan },
    { to: '/app/workout', icon: Dumbbell, label: 'Create Workout Plan', color: 'blue', has: data?.hasWorkoutPlan },
    { to: '/app/grocery', icon: ShoppingCart, label: 'Plan Groceries', color: 'purple', has: false },
    { to: '/app/chat', icon: MessageSquare, label: 'Ask AI Coach', color: 'saffron', has: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm -mb-2" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <Home size={13} /> Home
        </Link>
        <span>/</span><span>Dashboard</span>
      </div>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Here's your fitness overview for today</p>
        </div>
        {data?.profile.bmi && (
          <div className="glass rounded-xl px-4 py-2 text-center hidden sm:block">
            <p className="text-xs text-slate-500">BMI</p>
            <p className="text-xl font-bold" style={{ color: "var(--text-dark)" }}>{data.profile.bmi}</p>
          </div>
        )}
      </div>

      {/* Profile incomplete banner */}
      {!loading && !data?.profile.isProfileComplete && (
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1.5px solid rgba(245,158,11,0.2)' }}
        >
          <AlertCircle size={20} style={{ color: '#d97706' }} className="flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Complete your profile for personalized plans</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add your age, weight, height, and goals to unlock AI features</p>
          </div>
          <Link to="/app/profile" className="btn-secondary text-sm py-2 px-4 flex-shrink-0">
            Complete Profile <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card"
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <card.icon size={18} className={card.color} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{card.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.sub}</p>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calories Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-dark)' }}>Calorie Intake</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 14 days</p>
            </div>
            {data?.profile.dailyCalorieTarget && (
              <span className="badge-green">Target: {data.profile.dailyCalorieTarget} kcal</span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={displayChartData}>
                <defs>
                  <linearGradient id="calorieGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.96)', border: '1.5px solid rgba(205,180,255,0.35)', borderRadius: 12, color: '#1e1b2e' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="calories" stroke="#22c55e" strokeWidth={2} fill="url(#calorieGrad)" name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Protein Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass-card"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold" style={{ color: 'var(--text-dark)' }}>Protein Intake</h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Last 14 days</p>
            </div>
            {data?.profile.dailyProteinTarget && (
              <span className="badge-blue">Target: {data.profile.dailyProteinTarget}g</span>
            )}
          </div>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={displayChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(255,255,255,0.96)', border: '1.5px solid rgba(205,180,255,0.35)', borderRadius: 12, color: '#1e1b2e' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Bar dataKey="protein" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Protein (g)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="glass-card flex flex-col items-start gap-3 hover:border-brand-500/20 group"
            >
              <div className={`w-10 h-10 rounded-xl bg-${action.color}-500/10 flex items-center justify-center`}>
                <action.icon size={18} className={`text-${action.color}-400`} />
              </div>
              <span className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-dark)' }}>{action.label}</span>
              {action.has && <span className="badge-green text-xs">Active</span>}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Workouts this month */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="glass-card flex items-center gap-6"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <Dumbbell size={24} className="text-brand-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Workouts This Month</h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {data?.stats.totalWorkoutsThisMonth || 0} sessions completed — keep pushing!
            </p>
          </div>
          <Link to="/app/workout" className="btn-secondary text-sm py-2 px-4">
            View Plan <ArrowRight size={14} />
          </Link>
        </motion.div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { BarChart3, TrendingUp, Flame, Beef, Scale, Calendar } from 'lucide-react';
import api from '../../services/api';
import { format, subDays } from 'date-fns';
import { useAuthStore } from '../../store/authStore';

interface ProgressEntry {
  date: string;
  calories?: number;
  protein?: number;
  weight?: number;
  workoutCompleted?: boolean;
  mood?: number;
}

const tooltipStyle = {
  contentStyle: { background: 'rgba(255,255,255,0.96)', border: '1.5px solid rgba(205,180,255,0.35)', borderRadius: 12, color: '#1e1b2e' },
  labelStyle: { color: '#8b7fa8' },
};

export default function AnalyticsPage() {
  const { profile } = useAuthStore();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    api.get(`/analytics/progress?days=${range}`)
      .then(r => setEntries(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [range]);

  const chartData = entries.map(e => ({
    date: format(new Date(e.date), 'MMM d'),
    calories: e.calories || 0,
    protein: e.protein || 0,
    weight: e.weight || 0,
    mood: e.mood || 0,
    workout: e.workoutCompleted ? 1 : 0,
  }));

  // Fill missing days for smooth chart
  const filled = Array.from({ length: range }, (_, i) => {
    const d = format(subDays(new Date(), range - 1 - i), 'MMM d');
    return chartData.find(e => e.date === d) || { date: d, calories: 0, protein: 0, weight: 0, mood: 0, workout: 0 };
  });

  const avgCalories = entries.length ? Math.round(entries.reduce((s, e) => s + (e.calories || 0), 0) / entries.length) : 0;
  const avgProtein = entries.length ? Math.round(entries.reduce((s, e) => s + (e.protein || 0), 0) / entries.length) : 0;
  const totalWorkouts = entries.filter(e => e.workoutCompleted).length;
  const latestWeight = [...entries].reverse().find(e => e.weight)?.weight || 0;

  const Skeleton = ({ className }: { className?: string }) => <div className={`skeleton ${className}`} />;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>Analytics</span>
      </div>
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            <BarChart3 className="text-cyan-400" size={24} /> Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Track your nutrition, workout and body metrics</p>
        </div>
        <div className="flex gap-2">
          {([30, 60, 90] as const).map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                range === r ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'glass text-slate-400 hover:text-white'
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Calories', value: loading ? '—' : `${avgCalories}`, target: profile?.dailyCalorieTarget, unit: 'kcal', icon: Flame, color: 'text-saffron-400', bg: 'bg-saffron-500/10' },
          { label: 'Avg Protein', value: loading ? '—' : `${avgProtein}g`, target: profile?.dailyProteinTarget, unit: 'g', icon: Beef, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { label: 'Workouts', value: loading ? '—' : `${totalWorkouts}`, target: null, unit: `in ${range}d`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Current Weight', value: loading ? '—' : latestWeight ? `${latestWeight}kg` : 'N/A', target: null, unit: '', icon: Scale, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card">
            {loading ? (
              <div className="space-y-3"><Skeleton className="w-8 h-8 rounded-lg" /><Skeleton className="h-7 w-20" /><Skeleton className="h-4 w-24" /></div>
            ) : (
              <>
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                {s.target && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Target: {s.target}{s.unit}</p>
                )}
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calories */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Calorie Intake</h3>
            {profile?.dailyCalorieTarget && (
              <span className="badge-orange text-xs">Target: {profile.dailyCalorieTarget}</span>
            )}
          </div>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={filled}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#g1)" name="Calories" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Protein */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Protein Intake</h3>
            {profile?.dailyProteinTarget && (
              <span className="badge-green text-xs">Target: {profile.dailyProteinTarget}g</span>
            )}
          </div>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filled}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="protein" fill="#22c55e" radius={[3, 3, 0, 0]} name="Protein (g)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Weight trend */}
        <div className="glass-card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Weight Trend</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={filled.filter(d => d.weight > 0)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 3 }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Workout frequency */}
        <div className="glass-card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Workout Activity</h3>
          {loading ? <Skeleton className="h-52" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={filled}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(205,180,255,0.2)" />
                <XAxis dataKey="date" tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#8b7fa8', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 1]} ticks={[0, 1]} />
                <Tooltip {...tooltipStyle} formatter={(v) => [v === 1 ? 'Yes' : 'No', 'Workout']} />
                <Bar dataKey="workout" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Workout" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Log reminder */}
      {!loading && entries.length === 0 && (
        <div className="glass-card flex flex-col items-center py-12 gap-3 text-center">
          <Calendar size={32} className="text-slate-500" />
          <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>No data yet</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Start logging your daily progress to see analytics here.</p>
          <a href="/app/progress" className="btn-primary text-sm py-2 px-5">Log Today's Progress</a>
        </div>
      )}
    </div>
  );
}

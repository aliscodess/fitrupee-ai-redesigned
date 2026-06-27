import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { TrendingUp, CheckCircle2, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface ProgressForm {
  weight?: number;
  calories?: number;
  protein?: number;
  water?: number;
  workoutCompleted: boolean;
  mood: number;
  notes?: string;
}

interface ProgressEntry extends ProgressForm {
  _id: string;
  date: string;
}

const MOOD_LABELS = ['', '😫 Terrible', '😕 Bad', '😐 Okay', '🙂 Good', '😄 Great'];

export default function ProgressPage() {
  const { profile } = useAuthStore();
  const [entries, setEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, watch } = useForm<ProgressForm>({
    defaultValues: { workoutCompleted: false, mood: 3 },
  });

  const mood = watch('mood');

  useEffect(() => {
    api.get('/analytics/progress?days=14')
      .then(r => setEntries(r.data.data))
      .catch(console.error);
  }, []);

  const onSubmit = async (data: ProgressForm) => {
    setSaving(true);
    try {
      const { data: resp } = await api.post('/analytics/progress', data);
      setEntries(prev => {
        const idx = prev.findIndex(e => format(new Date(e.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
        if (idx >= 0) { const n = [...prev]; n[idx] = resp.data; return n; }
        return [resp.data, ...prev];
      });
      toast.success('Progress logged!');
      reset({ workoutCompleted: false, mood: 3 });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>Progress Tracker</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-dark)", fontFamily: "Syne, sans-serif" }}>
          <TrendingUp className="text-cyan-400" size={24} /> Progress Tracker
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Log today's stats to track your fitness journey</p>
      </div>

      {/* Log form */}
      <div className="glass-card">
        <h3 className="font-semibold mb-5 flex items-center gap-2" style={{ color: "var(--text-dark)", fontFamily: "Syne, sans-serif" }}>
          <Calendar size={16} className="text-brand-400" />
          Log for Today — {format(new Date(), 'EEEE, MMM d')}
        </h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'weight', label: 'Weight (kg)', placeholder: '70', step: '0.1' },
              { name: 'calories', label: `Calories (target: ${profile?.dailyCalorieTarget || '?'})`, placeholder: '1800', step: '1' },
              { name: 'protein', label: `Protein g (target: ${profile?.dailyProteinTarget || '?'}g)`, placeholder: '100', step: '1' },
              { name: 'water', label: 'Water (litres)', placeholder: '2.5', step: '0.5' },
            ].map(f => (
              <div key={f.name}>
                <label className="label">{f.label}</label>
                <input
                  {...register(f.name as any, { valueAsNumber: true })}
                  type="number" step={f.step} placeholder={f.placeholder}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          {/* Workout toggle */}
          <div className="flex items-center justify-between glass rounded-xl p-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>Workout Completed</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Did you exercise today?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input {...register('workoutCompleted')} type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500" />
            </label>
          </div>

          {/* Mood selector */}
          <div>
            <label className="label">How do you feel today?</label>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map(m => (
                <label key={m} className="cursor-pointer">
                  <input {...register('mood', { valueAsNumber: true })} type="radio" value={m} className="sr-only" />
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                    Number(mood) === m ? 'bg-brand-500/20 border border-brand-500/30 scale-110' : 'bg-white/5 hover:bg-white/10'
                  }`}>
                    {MOOD_LABELS[m].split(' ')[0]}
                  </div>
                </label>
              ))}
              <span className="text-sm text-slate-400 self-center ml-2">{MOOD_LABELS[Number(mood)]?.split(' ').slice(1).join(' ')}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              {...register('notes')}
              placeholder="How did your day go? Any challenges or wins?"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
              : <><CheckCircle2 size={16} /> Save Today's Progress</>}
          </button>
        </form>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <div className="glass-card overflow-hidden p-0">
          <div className="p-4 border-b border-white/5">
            <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Recent Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Date', 'Weight', 'Calories', 'Protein', 'Water', 'Workout', 'Mood'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.slice(0, 14).map((e, i) => (
                  <motion.tr
                    key={e._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-300 font-medium">{format(new Date(e.date), 'MMM d, EEE')}</td>
                    <td className="px-4 py-3" style={{ color: "var(--text-dark)" }}>{e.weight ? `${e.weight}kg` : '—'}</td>
                    <td className="px-4 py-3">
                      {e.calories ? (
                        <span className={`font-medium ${e.calories >= (profile?.dailyCalorieTarget || 0) * 0.9 ? 'text-brand-400' : 'text-saffron-400'}`}>
                          {e.calories}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {e.protein ? (
                        <span className={`font-medium ${e.protein >= (profile?.dailyProteinTarget || 0) * 0.9 ? 'text-brand-400' : 'text-red-400'}`}>
                          {e.protein}g
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{e.water ? `${e.water}L` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${e.workoutCompleted ? 'badge-green' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                        {e.workoutCompleted ? 'Done ✓' : 'Rest'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-lg">{e.mood ? MOOD_LABELS[e.mood]?.split(' ')[0] : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

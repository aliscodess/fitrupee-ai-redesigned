import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell, Zap, ChevronDown, ChevronUp, Clock, Flame, Target,
  CheckCircle2, Circle, Settings2, X, Play, RotateCcw, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Exercise {
  name: string; sets: number; reps: string;
  restSeconds: number; instructions: string;
  targetMuscles: string[]; equipment: string;
}
interface WorkoutDay {
  day: string; focus: string; exercises: Exercise[];
  estimatedDuration: number; caloriesBurned: number;
}
interface WorkoutPlan {
  _id: string; title: string; level: string;
  type: string; goal: string; daysPerWeek: number; plan: WorkoutDay[];
}

const levelColors: Record<string, string> = {
  beginner: 'badge-green',
  intermediate: 'badge-orange',
  advanced: 'bg-red-500/20 text-red-400 border border-red-500/20',
};

/* ── Rest Timer Component ── */
function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    ref.current = setInterval(() => {
      setLeft(p => {
        if (p <= 1) { clearInterval(ref.current!); onDone(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current!);
  }, []);

  const pct = ((seconds - left) / seconds) * 100;
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(155,114,239,0.15)" strokeWidth="6" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="#9b72ef" strokeWidth="6"
            strokeDasharray={`${2 * Math.PI * 34}`}
            strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-bold text-xl" style={{ color: 'var(--accent-lav)' }}>{left}s</span>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Rest time remaining</p>
      <button onClick={onDone} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(155,114,239,0.1)', color: 'var(--accent-lav)' }}>Skip</button>
    </div>
  );
}

/* ── Preferences Modal ── */
function PreferencesModal({ open, onClose, onGenerate }: {
  open: boolean; onClose: () => void;
  onGenerate: (prefs: WorkoutPrefs) => void;
}) {
  const [prefs, setPrefs] = useState<WorkoutPrefs>({
    daysPerWeek: 4, equipment: 'both', focus: 'general',
    sessionDuration: 45, notes: '',
  });

  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(100,80,160,0.18)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
          className="glass-card w-full max-w-md"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
              <Settings2 size={18} className="inline mr-2" style={{ color: 'var(--accent-lav)' }} />Workout Preferences
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="auth-label mb-2 block">Days per week</label>
              <div className="flex gap-2">
                {[3,4,5,6].map(d => (
                  <button key={d} onClick={() => setPrefs(p => ({ ...p, daysPerWeek: d }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${prefs.daysPerWeek === d ? 'pref-active' : 'pref-pill'}`}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Equipment available</label>
              <div className="flex gap-2 flex-wrap">
                {[['home','🏠 Home'],['gym','🏋️ Gym'],['both','💪 Both']].map(([v,l]) => (
                  <button key={v} onClick={() => setPrefs(p => ({ ...p, equipment: v }))}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${prefs.equipment === v ? 'pref-active' : 'pref-pill'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Focus goal</label>
              <div className="flex gap-2 flex-wrap">
                {[['general','General'],['strength','Strength'],['fat_loss','Fat Loss'],['endurance','Endurance'],['muscle','Muscle']].map(([v,l]) => (
                  <button key={v} onClick={() => setPrefs(p => ({ ...p, focus: v }))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${prefs.focus === v ? 'pref-active' : 'pref-pill'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Session duration: <strong>{prefs.sessionDuration} min</strong></label>
              <input type="range" min={20} max={90} step={5} value={prefs.sessionDuration}
                onChange={e => setPrefs(p => ({ ...p, sessionDuration: +e.target.value }))}
                className="w-full" />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}><span>20 min</span><span>90 min</span></div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Additional notes (optional)</label>
              <textarea value={prefs.notes} onChange={e => setPrefs(p => ({ ...p, notes: e.target.value }))}
                placeholder="e.g. bad knees, no jumping, prefer upper body…"
                rows={2} className="input-field resize-none text-sm" />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={() => { onGenerate(prefs); onClose(); }} className="btn-primary flex-1 py-2.5 text-sm">
              <Zap size={15} /> Generate Plan
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface WorkoutPrefs {
  daysPerWeek: number; equipment: string; focus: string;
  sessionDuration: number; notes: string;
}

export default function WorkoutPlannerPage() {
  const { profile } = useAuthStore();
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [expandedEx, setExpandedEx] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [daysDone, setDaysDone] = useState<Set<number>>(new Set());
  const [showPrefs, setShowPrefs] = useState(false);
  const [restTimer, setRestTimer] = useState<{ active: boolean; seconds: number }>({ active: false, seconds: 60 });

  useEffect(() => {
    api.get('/ai/workout-plan')
      .then(r => { if (r.data.data) setPlan(r.data.data); })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, []);

  // Reset exercise completions when switching day
  useEffect(() => { setCompletedExercises(new Set()); setExpandedEx(null); }, [activeDay]);

  const generate = async (prefs?: WorkoutPrefs) => {
    if (!profile?.isProfileComplete) { toast.error('Complete your profile first'); return; }
    setLoading(true);
    try {
      const payload = prefs ? {
        daysPerWeek: prefs.daysPerWeek,
        equipment: prefs.equipment,
        focus: prefs.focus,
        sessionDuration: prefs.sessionDuration,
        notes: prefs.notes,
      } : {};
      const { data } = await api.post('/ai/workout-plan', payload);
      setPlan(data.data);
      setActiveDay(0);
      setDaysDone(new Set());
      setCompletedExercises(new Set());
      toast.success('Workout plan generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setLoading(false); }
  };

  const toggleExercise = (key: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const markDayDone = async () => {
    const today = plan?.plan[activeDay];
    if (!today) return;
    setDaysDone(prev => new Set([...prev, activeDay]));
    // Log to progress
    try {
      await api.post('/analytics/progress', {
        workoutCompleted: true,
        calories: today.caloriesBurned,
        mood: 4,
        notes: `Completed: ${today.focus}`,
      });
      toast.success(`✅ ${today.focus} session logged!`);
    } catch {
      toast.success(`✅ ${today.focus} marked as done!`);
    }
  };

  const today = plan?.plan[activeDay];
  const exDone = today ? today.exercises.filter((_, i) => completedExercises.has(`${activeDay}-${i}`)).length : 0;
  const allExDone = today ? exDone === today.exercises.length : false;
  const dayAlreadyDone = daysDone.has(activeDay);

  return (
    <div className="space-y-6 animate-fade-in">
      <PreferencesModal open={showPrefs} onClose={() => setShowPrefs(false)} onGenerate={generate} />

      {/* Breadcrumb + Header */}
      <div className="flex items-center gap-2 text-sm mb-1" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1"><Home size={13} /> Home</Link>
        <span>/</span>
        <span>Workout Planner</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            <Dumbbell size={24} style={{ color: '#3b82f6' }} /> Workout Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>AI-generated workout plan tailored to your fitness level and goals</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {plan && (
            <button onClick={() => setShowPrefs(true)} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
              <Settings2 size={15} /> Preferences
            </button>
          )}
          <button onClick={() => plan ? setShowPrefs(true) : generate()} disabled={loading || fetching} className="btn-primary">
            {loading ? <><span className="auth-spinner" /> Generating...</>
              : <><Zap size={16} /> {plan ? 'Regenerate' : 'Generate Plan'}</>}
          </button>
        </div>
      </div>

      {(fetching || loading) && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="auth-spinner" style={{ width: 40, height: 40, borderWidth: 3, borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3b82f6' }} />
          <p style={{ color: 'var(--text-muted)' }}>{loading ? 'Creating your personalized workout plan...' : 'Loading...'}</p>
        </div>
      )}

      {!fetching && !loading && plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Plan header */}
          <div className="glass-card">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)' }}>{plan.title}</h2>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`badge ${levelColors[plan.level] || 'badge-green'}`}>{plan.level}</span>
                  <span className="badge-blue">{plan.type}</span>
                  <span className="badge" style={{ background: 'rgba(205,180,255,0.2)', color: 'var(--text-body)', border: '1px solid rgba(205,180,255,0.3)' }}>{plan.daysPerWeek} days/week</span>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{plan.daysPerWeek}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days/week</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#d97706' }}>{today?.estimatedDuration || 45}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Min/session</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: '#34b96f' }}>{daysDone.size}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Days done</p>
                </div>
              </div>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {plan.plan.map((d, i) => (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeDay === i ? 'pref-active' : 'pref-pill'
                }`}>
                {daysDone.has(i) && <CheckCircle2 size={13} style={{ color: '#34b96f' }} />}
                {d.day}
              </button>
            ))}
          </div>

          {/* Day summary */}
          {today && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card">
                  <Clock size={16} className="text-blue-400 mb-2" />
                  <p className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>{today.estimatedDuration} min</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Duration</p>
                </div>
                <div className="glass-card">
                  <Flame size={16} style={{ color: '#d97706' }} className="mb-2" />
                  <p className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>{today.caloriesBurned}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Calories burned</p>
                </div>
                <div className="glass-card">
                  <Target size={16} style={{ color: 'var(--accent-lav)' }} className="mb-2" />
                  <p className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>{exDone}/{today.exercises.length}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exercises done</p>
                </div>
              </div>

              {/* Exercise progress bar */}
              {today.exercises.length > 0 && (
                <div className="glass-card py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-body)' }}>Session Progress</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--accent-lav)' }}>{Math.round((exDone / today.exercises.length) * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(205,180,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${(exDone / today.exercises.length) * 100}%` }}
                      transition={{ duration: 0.4 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, #9b72ef, #CDB4FF)', borderRadius: 99 }}
                    />
                  </div>
                </div>
              )}

              {/* Rest timer */}
              {restTimer.active && (
                <div className="glass-card">
                  <RestTimer seconds={restTimer.seconds} onDone={() => { setRestTimer({ active: false, seconds: 60 }); toast('💪 Rest done! Next set!'); }} />
                </div>
              )}

              <div className="glass-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>{today.day} — {today.focus}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Tap an exercise to expand • tick to mark done • start timer after each set</p>
                  </div>
                  {dayAlreadyDone && (
                    <span className="badge-green flex items-center gap-1"><CheckCircle2 size={12} /> Done!</span>
                  )}
                </div>

                <div className="space-y-3">
                  {today.exercises.map((ex, i) => {
                    const key = `${activeDay}-${i}`;
                    const done = completedExercises.has(key);
                    return (
                      <div key={i} className="rounded-xl overflow-hidden transition-all"
                        style={{ border: done ? '1.5px solid rgba(52,185,111,0.35)' : '1.5px solid rgba(205,180,255,0.2)', background: done ? 'rgba(52,185,111,0.04)' : 'rgba(255,255,255,0.45)' }}>
                        <button onClick={() => setExpandedEx(expandedEx === i ? null : i)}
                          className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/20">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={e => { e.stopPropagation(); toggleExercise(key); }}
                              className="flex-shrink-0 transition-transform hover:scale-110"
                            >
                              {done
                                ? <CheckCircle2 size={22} style={{ color: '#34b96f' }} />
                                : <Circle size={22} style={{ color: 'rgba(155,114,239,0.4)' }} />}
                            </button>
                            <div>
                              <p className={`text-sm font-semibold ${done ? 'line-through' : ''}`} style={{ color: done ? 'var(--text-muted)' : 'var(--text-dark)' }}>{ex.name}</p>
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ex.sets} sets × {ex.reps} · {ex.equipment}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); setRestTimer({ active: true, seconds: ex.restSeconds || 60 }); }}
                              className="p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
                              style={{ background: 'rgba(155,114,239,0.1)', color: 'var(--accent-lav)' }}
                              title={`Start ${ex.restSeconds}s rest timer`}>
                              <Play size={12} /> {ex.restSeconds}s
                            </button>
                            {expandedEx === i ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                          </div>
                        </button>

                        <AnimatePresence>
                          {expandedEx === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(205,180,255,0.2)' }}>
                                <div className="flex flex-wrap gap-2">
                                  {ex.targetMuscles.map((m, j) => (
                                    <span key={j} className="badge" style={{ background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' }}>{m}</span>
                                  ))}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  {[['Sets', ex.sets], ['Reps', ex.reps], ['Rest', `${ex.restSeconds}s`]].map(([l, v]) => (
                                    <div key={l as string} className="text-center p-2 rounded-xl" style={{ background: 'rgba(155,114,239,0.07)' }}>
                                      <p className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>{v}</p>
                                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{l}</p>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: 'rgba(155,114,239,0.05)', color: 'var(--text-body)' }}>{ex.instructions}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Mark day done */}
                <div className="mt-6 pt-4" style={{ borderTop: '1.5px solid rgba(205,180,255,0.2)' }}>
                  {dayAlreadyDone ? (
                    <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(52,185,111,0.08)', color: '#34b96f' }}>
                      <CheckCircle2 size={18} /> <span className="font-semibold">Workout completed & logged!</span>
                    </div>
                  ) : (
                    <button
                      onClick={markDayDone}
                      className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                        allExDone ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {allExDone
                        ? <><CheckCircle2 size={16} /> Mark Workout Complete & Log Progress</>
                        : <><RotateCcw size={15} /> Mark as Done Anyway ({exDone}/{today.exercises.length} exercises)</>}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      )}

      {!fetching && !loading && !plan && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <Dumbbell size={28} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>No workout plan yet</h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>Generate a personalized workout plan. Set your preferences for equipment, days per week, and focus goal.</p>
          <button onClick={() => setShowPrefs(true)} className="btn-primary mt-2"><Zap size={16} /> Generate Workout Plan</button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Salad, Zap, ChevronDown, ChevronUp, Clock, IndianRupee,
  Flame, Beef, Settings2, X, CheckCircle2, Circle,
  RefreshCw, Home
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Meal {
  name: string; ingredients: string[]; calories: number;
  protein: number; carbs: number; fat: number;
  estimatedCost: number; preparationTime: number; instructions: string;
}
interface DayPlan {
  day: string;
  meals: { breakfast: Meal; lunch: Meal; dinner: Meal; snacks: Meal[] };
  totalCalories: number; totalProtein: number; totalCost: number;
}
interface MealPlan {
  _id: string; title: string; plan: DayPlan[];
  weeklyGroceryCost: number; dailyCalorieTarget: number;
  dailyProteinTarget: number; createdAt: string;
}

/* ── Preferences Modal ── */
interface DietPrefs {
  days: number; cuisinePreference: string; avoidIngredients: string;
  maxCostPerDay: string; mealCount: number; specialNotes: string;
}

function DietPrefsModal({ open, onClose, onGenerate }: {
  open: boolean; onClose: () => void; onGenerate: (p: DietPrefs) => void;
}) {
  const [prefs, setPrefs] = useState<DietPrefs>({
    days: 7, cuisinePreference: 'mixed', avoidIngredients: '',
    maxCostPerDay: '', mealCount: 3, specialNotes: '',
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
          className="glass-card w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
              <Settings2 size={18} className="inline mr-2" style={{ color: '#34b96f' }} />Meal Plan Preferences
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="auth-label mb-2 block">Plan duration</label>
              <div className="flex gap-2">
                {[3,5,7].map(d => (
                  <button key={d} onClick={() => setPrefs(p => ({ ...p, days: d }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${prefs.days === d ? 'pref-active' : 'pref-pill'}`}>
                    {d} days
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Meals per day</label>
              <div className="flex gap-2">
                {[2,3,4].map(m => (
                  <button key={m} onClick={() => setPrefs(p => ({ ...p, mealCount: m }))}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${prefs.mealCount === m ? 'pref-active' : 'pref-pill'}`}>
                    {m} meals
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Cuisine preference</label>
              <div className="flex gap-2 flex-wrap">
                {[['mixed','Mixed'],['north_indian','North Indian'],['south_indian','South Indian'],['continental','Continental']].map(([v,l]) => (
                  <button key={v} onClick={() => setPrefs(p => ({ ...p, cuisinePreference: v }))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${prefs.cuisinePreference === v ? 'pref-active' : 'pref-pill'}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="auth-label mb-2 block">Max cost per day (₹, optional)</label>
              <input type="number" value={prefs.maxCostPerDay}
                onChange={e => setPrefs(p => ({ ...p, maxCostPerDay: e.target.value }))}
                placeholder="e.g. 150" className="input-field" />
            </div>

            <div>
              <label className="auth-label mb-2 block">Ingredients to avoid</label>
              <input value={prefs.avoidIngredients}
                onChange={e => setPrefs(p => ({ ...p, avoidIngredients: e.target.value }))}
                placeholder="e.g. onion, garlic, mushrooms…" className="input-field" />
            </div>

            <div>
              <label className="auth-label mb-2 block">Special notes</label>
              <textarea value={prefs.specialNotes}
                onChange={e => setPrefs(p => ({ ...p, specialNotes: e.target.value }))}
                placeholder="e.g. high protein breakfast, light dinners, quick recipes only…"
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

/* ── Meal Card with eaten toggle ── */
const MealCard = ({ meal, label, mealKey, eatenSet, onToggleEaten, onSwap }: {
  meal: Meal; label: string; mealKey: string;
  eatenSet: Set<string>; onToggleEaten: (k: string) => void; onSwap: (label: string, meal: Meal) => void;
}) => {
  const [open, setOpen] = useState(false);
  const eaten = eatenSet.has(mealKey);
  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ border: eaten ? '1.5px solid rgba(52,185,111,0.35)' : '1.5px solid rgba(205,180,255,0.2)', background: eaten ? 'rgba(52,185,111,0.03)' : 'rgba(255,255,255,0.55)' }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/20">
        <div className="flex items-center gap-3">
          <button onClick={e => { e.stopPropagation(); onToggleEaten(mealKey); }} className="flex-shrink-0 transition-transform hover:scale-110">
            {eaten ? <CheckCircle2 size={20} style={{ color: '#34b96f' }} /> : <Circle size={20} style={{ color: 'rgba(155,114,239,0.35)' }} />}
          </button>
          <span className="text-xs font-bold uppercase tracking-wide w-16" style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span className={`text-sm font-semibold ${eaten ? 'line-through' : ''}`} style={{ color: eaten ? 'var(--text-muted)' : 'var(--text-dark)' }}>{meal.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold hidden sm:block" style={{ color: 'var(--accent-lav)' }}>{meal.protein}g protein</span>
          <span className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>₹{meal.estimatedCost}</span>
          <button onClick={e => { e.stopPropagation(); onSwap(label, meal); }}
            className="p-1.5 rounded-lg text-xs transition-all hidden sm:flex items-center gap-1"
            style={{ background: 'rgba(249,115,22,0.1)', color: '#c2530f' }}
            title="Swap this meal">
            <RefreshCw size={11} /> Swap
          </button>
          {open ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 space-y-3" style={{ borderTop: '1px solid rgba(205,180,255,0.2)' }}>
              <div className="flex flex-wrap gap-2">
                {meal.ingredients.map((ing, i) => (
                  <span key={i} className="badge" style={{ background: 'rgba(205,180,255,0.15)', color: 'var(--text-body)', border: '1px solid rgba(205,180,255,0.25)' }}>{ing}</span>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Calories', value: meal.calories, icon: Flame, color: '#d97706' },
                  { label: 'Protein', value: `${meal.protein}g`, icon: Beef, color: 'var(--accent-lav)' },
                  { label: 'Time', value: `${meal.preparationTime}m`, icon: Clock, color: '#2563eb' },
                  { label: 'Cost', value: `₹${meal.estimatedCost}`, icon: IndianRupee, color: '#7c3aed' },
                ].map(s => (
                  <div key={s.label} className="text-center p-2 rounded-xl" style={{ background: 'rgba(155,114,239,0.06)' }}>
                    <s.icon size={13} style={{ color: s.color, margin: '0 auto 4px' }} />
                    <p className="text-xs font-bold" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs leading-relaxed p-3 rounded-xl" style={{ background: 'rgba(155,114,239,0.04)', color: 'var(--text-body)' }}>{meal.instructions}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Swap Meal Modal ── */
function SwapModal({ swapping, onClose, onConfirm, loading }: {
  swapping: { label: string; meal: Meal } | null;
  onClose: () => void; onConfirm: (note: string) => void; loading: boolean;
}) {
  const [note, setNote] = useState('');
  if (!swapping) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(100,80,160,0.18)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="glass-card w-full max-w-sm"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
              <RefreshCw size={16} className="inline mr-2" style={{ color: '#34b96f' }} />Swap {swapping.label}
            </h3>
            <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Current: <strong style={{ color: 'var(--text-dark)' }}>{swapping.meal.name}</strong>
          </p>
          <label className="auth-label mb-2 block">Preference for replacement (optional)</label>
          <textarea value={note} onChange={e => setNote(e.target.value)}
            placeholder="e.g. something lighter, no dairy, quick to make…"
            rows={2} className="input-field resize-none text-sm mb-4" />
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
            <button onClick={() => onConfirm(note)} disabled={loading} className="btn-primary flex-1 py-2.5 text-sm">
              {loading ? <><span className="auth-spinner" /> Finding...</> : <><RefreshCw size={14} /> Find Swap</>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function DietPlannerPage() {
  const { profile } = useAuthStore();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const [showPrefs, setShowPrefs] = useState(false);
  const [eatenMeals, setEatenMeals] = useState<Set<string>>(new Set());
  const [swapping, setSwapping] = useState<{ label: string; meal: Meal } | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);

  useEffect(() => {
    api.get('/ai/meal-plan')
      .then(r => { if (r.data.data) setPlan(r.data.data); })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, []);

  const generatePlan = async (prefs?: DietPrefs) => {
    if (!profile?.isProfileComplete) { toast.error('Please complete your profile first'); return; }
    setLoading(true);
    try {
      const payload = prefs ? {
        days: prefs.days,
        cuisinePreference: prefs.cuisinePreference,
        avoidIngredients: prefs.avoidIngredients,
        maxCostPerDay: prefs.maxCostPerDay || undefined,
        mealCount: prefs.mealCount,
        specialNotes: prefs.specialNotes,
      } : { days: 7 };
      const { data } = await api.post('/ai/meal-plan', payload);
      setPlan(data.data);
      setActiveDay(0);
      setEatenMeals(new Set());
      toast.success(`${payload.days}-day meal plan generated!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setLoading(false); }
  };

  const toggleEaten = (key: string) => {
    setEatenMeals(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleSwap = async (note: string) => {
    if (!swapping || !plan) return;
    setSwapLoading(true);
    try {
      const { data } = await api.post('/ai/chat', {
        messages: [{
          role: 'user',
          content: `I need to swap my ${swapping.label} meal. Current meal: ${swapping.meal.name} (${swapping.meal.calories} cal, ₹${swapping.meal.estimatedCost}). ${note ? `Preference: ${note}` : ''} Suggest one alternative Indian meal with similar calories and cost in 2-3 sentences.`
        }]
      });
      toast.success('Swap suggestion ready!', { duration: 6000 });
      toast(data.data.response, { duration: 10000, icon: '🍽️' });
    } catch {
      toast.error('Could not get swap suggestion');
    } finally {
      setSwapLoading(false);
      setSwapping(null);
    }
  };

  const today = plan?.plan[activeDay];
  const todayMeals = today ? [
    { meal: today.meals.breakfast, label: 'Breakfast', key: `${activeDay}-breakfast` },
    { meal: today.meals.lunch, label: 'Lunch', key: `${activeDay}-lunch` },
    { meal: today.meals.dinner, label: 'Dinner', key: `${activeDay}-dinner` },
    ...(today.meals.snacks || []).map((s, i) => ({ meal: s, label: 'Snack', key: `${activeDay}-snack-${i}` })),
  ] : [];
  const mealsEatenToday = todayMeals.filter(m => eatenMeals.has(m.key)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <DietPrefsModal open={showPrefs} onClose={() => setShowPrefs(false)} onGenerate={generatePlan} />
      <SwapModal swapping={swapping} onClose={() => setSwapping(null)} onConfirm={handleSwap} loading={swapLoading} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1"><Home size={13} /> Home</Link>
        <span>/</span><span>Diet Planner</span>
      </div>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            <Salad size={24} style={{ color: '#34b96f' }} /> Diet Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>AI-generated meal plan optimized for your budget and goals</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {plan && (
            <button onClick={() => setShowPrefs(true)} className="btn-secondary flex items-center gap-2 text-sm py-2.5 px-4">
              <Settings2 size={15} /> Preferences
            </button>
          )}
          <button onClick={() => setShowPrefs(true)} disabled={loading || fetching} className="btn-primary">
            {loading ? <><span className="auth-spinner" /> Generating...</>
              : <><Zap size={16} /> {plan ? 'Regenerate Plan' : 'Generate Plan'}</>}
          </button>
        </div>
      </div>

      {!profile?.isProfileComplete && (
        <div className="rounded-xl p-4 text-sm flex items-center gap-3" style={{ background: 'rgba(245,158,11,0.08)', border: '1.5px solid rgba(245,158,11,0.2)', color: '#a16207' }}>
          ⚠️ Complete your profile to generate personalized meal plans based on your goals and budget.
          <Link to="/app/profile" className="underline font-semibold ml-auto">Complete →</Link>
        </div>
      )}

      {(fetching || loading) && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="auth-spinner" style={{ width: 40, height: 40, borderWidth: 3, borderColor: 'rgba(52,185,111,0.2)', borderTopColor: '#34b96f' }} />
          <p style={{ color: 'var(--text-muted)' }}>{loading ? 'AI is crafting your perfect meal plan...' : 'Loading your plan...'}</p>
        </div>
      )}

      {!fetching && !loading && plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Plan summary */}
          <div className="glass-card">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-dark)' }}>{plan.title}</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Personalized {plan.plan.length}-day plan</p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--accent-lav)' }}>₹{plan.weeklyGroceryCost}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Weekly cost</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: '#d97706' }}>{plan.dailyCalorieTarget}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>kcal/day</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: '#2563eb' }}>{plan.dailyProteinTarget}g</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>protein/day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Day tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {plan.plan.map((day, i) => (
              <button key={i} onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeDay === i ? 'pref-active' : 'pref-pill'}`}>
                {day.day}
              </button>
            ))}
          </div>

          {/* Day stats */}
          {today && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Calories', value: `${today.totalCalories} kcal`, pct: Math.round((today.totalCalories / (plan.dailyCalorieTarget || 2000)) * 100), color: '#d97706', bar: '#f59e0b' },
                { label: 'Total Protein', value: `${today.totalProtein}g`, pct: Math.round((today.totalProtein / (plan.dailyProteinTarget || 100)) * 100), color: 'var(--accent-lav)', bar: '#9b72ef' },
                { label: 'Meals Eaten', value: `${mealsEatenToday}/${todayMeals.length}`, pct: todayMeals.length ? Math.round((mealsEatenToday / todayMeals.length) * 100) : 0, color: '#34b96f', bar: '#34b96f' },
              ].map(s => (
                <div key={s.label} className="glass-card">
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="text-xl font-bold mb-2" style={{ color: s.color }}>{s.value}</p>
                  <div style={{ height: 4, background: 'rgba(205,180,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(s.pct, 100)}%`, height: '100%', background: s.bar, borderRadius: 99, transition: 'width 0.4s' }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.pct}%</p>
                </div>
              ))}
            </div>
          )}

          {/* Meals */}
          {today && (
            <div className="space-y-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>✅ Tap the circle to mark a meal eaten · 🔄 Swap to get an AI alternative</p>
              {todayMeals.map(({ meal, label, key }) => (
                <MealCard key={key} meal={meal} label={label} mealKey={key}
                  eatenSet={eatenMeals} onToggleEaten={toggleEaten}
                  onSwap={(l, m) => setSwapping({ label: l, meal: m })} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {!fetching && !loading && !plan && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(52,185,111,0.1)' }}>
            <Salad size={28} style={{ color: '#34b96f' }} />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>No meal plan yet</h3>
          <p className="text-sm max-w-sm" style={{ color: 'var(--text-muted)' }}>Set your preferences — cuisine style, cost limits, ingredients to avoid — and let AI build your perfect plan.</p>
          <button onClick={() => setShowPrefs(true)} disabled={loading} className="btn-primary mt-2">
            <Zap size={16} /> Generate My Meal Plan
          </button>
        </div>
      )}
    </div>
  );
}

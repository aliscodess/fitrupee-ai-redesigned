import { Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, Zap, TrendingUp, Award, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ProteinSource {
  food: string;
  proteinPer100g: number;
  costPer100g: number;
  proteinPerRupee: number;
}

interface PlanMeal {
  name: string;
  time: string;
  ingredients: Array<{ item: string; quantity: string; cost: number; protein: number }>;
  totalCost: number;
  totalProtein: number;
  totalCalories: number;
  recipe: string;
}

interface ProteinBudgetPlan {
  title: string;
  totalBudget: number;
  totalProtein: number;
  totalCalories: number;
  meals: PlanMeal[];
  proteinSources: ProteinSource[];
  tips: string[];
}

export default function ProteinBudgetPage() {
  const { profile } = useAuthStore();
  const [plan, setPlan] = useState<ProteinBudgetPlan | null>(null);
  const [budget, setBudget] = useState(100);
  const [loading, setLoading] = useState(false);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  const generate = async () => {
    if (!profile?.isProfileComplete) { toast.error('Complete your profile first'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/ai/protein-budget', { budget });
      setPlan(data.data);
      toast.success(`Max-protein ₹${budget} plan generated!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>Protein Budget</span>
      </div>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
          <IndianRupee className="text-saffron-400" size={24} /> Protein Under ₹100
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Maximum protein on minimum budget — optimized for Indian foods</p>
      </div>

      {/* Budget selector */}
      <div className="glass-card">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Set Your Daily Food Budget</h3>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex-1 min-w-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Daily Budget</span>
              <span className="text-2xl font-bold text-saffron-400">₹{budget}</span>
            </div>
            <input
              type="range" min={50} max={300} step={10} value={budget}
              onChange={e => setBudget(Number(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-saffron-400 [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>₹50</span><span>₹300</span>
            </div>
          </div>
          <div className="flex gap-3">
            {[60, 100, 150, 200].map(b => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  budget === b ? 'pref-active' : 'pref-pill'
                }`}
              >
                ₹{b}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary mt-4">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Optimizing...</>
            : <><Zap size={16} /> Generate Max-Protein Plan</>}
        </button>
      </div>

      {loading && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-12 h-12 border-2 border-saffron-500/30 border-t-saffron-500 rounded-full animate-spin" />
          <p className="text-slate-400">Calculating maximum protein within ₹{budget}...</p>
        </div>
      )}

      {!loading && plan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass-card text-center">
              <IndianRupee size={20} className="text-saffron-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>₹{plan.totalBudget}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily budget</p>
            </div>
            <div className="glass-card text-center border border-brand-500/20 bg-brand-500/5">
              <TrendingUp size={20} className="text-brand-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-brand-400">{plan.totalProtein}g</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total protein</p>
            </div>
            <div className="glass-card text-center">
              <Zap size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{plan.totalCalories}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total calories</p>
            </div>
          </div>

          {/* Meals */}
          <div className="glass-card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>{plan.title}</h3>
            <div className="space-y-3">
              {plan.meals?.map((meal, i) => (
                <div key={i} className="border border-white/5 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedMeal(expandedMeal === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 w-20">{meal.time}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>{meal.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-brand-400 font-bold text-sm">{meal.totalProtein}g</span>
                      <span className="text-saffron-400 text-sm">₹{meal.totalCost}</span>
                      {expandedMeal === i ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </button>
                  {expandedMeal === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="p-4 space-y-3">
                        <div className="space-y-2">
                          {meal.ingredients?.map((ing, j) => (
                            <div key={j} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">{ing.item} — {ing.quantity}</span>
                              <div className="flex gap-3">
                                <span className="text-brand-400 text-xs">{ing.protein}g protein</span>
                                <span className="text-slate-500 text-xs">₹{ing.cost}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 bg-white/3 rounded-lg p-3 leading-relaxed">{meal.recipe}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Protein sources leaderboard */}
          {plan.proteinSources?.length > 0 && (
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-4">
                <Award size={18} className="text-saffron-400" />
                <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Best Protein-per-Rupee Foods</h3>
              </div>
              <div className="space-y-3">
                {plan.proteinSources.map((s, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-saffron-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-500'}`}>#{i + 1}</span>
                    <span className="flex-1 text-sm font-semibold" style={{ color: "var(--text-dark)" }}>{s.food}</span>
                    <span className="text-xs text-brand-400">{s.proteinPer100g}g/100g</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>₹{s.costPer100g}/100g</span>
                    <div className="flex items-center gap-1">
                      <div className="w-16 h-1.5 bg-white/5 rounded-full">
                        <div className="h-full bg-saffron-400 rounded-full" style={{ width: `${Math.min((s.proteinPerRupee / 6) * 100, 100)}%` }} />
                      </div>
                      <span className="text-xs text-saffron-400 font-bold">{s.proteinPerRupee?.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-3">Value score = grams of protein per ₹1 spent</p>
            </div>
          )}

          {/* Tips */}
          {plan.tips?.length > 0 && (
            <div className="glass-card border border-brand-500/10 bg-brand-500/5">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "var(--text-dark)" }}>
                <Zap size={16} className="text-brand-400" /> Budget Nutrition Tips
              </h3>
              <ul className="space-y-2">
                {plan.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-brand-400 mt-0.5">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      {!loading && !plan && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-saffron-500/10 flex items-center justify-center">
            <IndianRupee size={36} className="text-saffron-400" />
          </div>
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-dark)" }}>Maximum Protein, Minimum Cost</h3>
          <p className="text-slate-400 text-sm max-w-md">
            Our AI finds the best combination of affordable Indian foods (soya chunks, dal, eggs, peanuts) to hit your protein target within ₹{budget}/day.
          </p>
          <div className="flex gap-4 flex-wrap justify-center mt-2">
            {[
              { food: 'Soya Chunks', value: '5.8g/₹' },
              { food: 'Moong Dal', value: '2.0g/₹' },
              { food: 'Peanuts', value: '1.7g/₹' },
            ].map(f => (
              <div key={f.food} className="glass px-4 py-2 rounded-xl text-center">
                <p className="text-sm font-semibold" style={{ color: "var(--text-dark)" }}>{f.food}</p>
                <p className="text-saffron-400 text-xs font-bold">{f.value} protein</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

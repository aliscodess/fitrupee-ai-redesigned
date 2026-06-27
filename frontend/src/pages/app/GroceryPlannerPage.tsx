import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, TrendingUp, IndianRupee, Search } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface GroceryItem {
  name: string;
  quantity: string;
  unit: string;
  estimatedPrice: number;
  category: string;
  nutritionPer100g: { protein: number; calories: number; carbs: number; fat: number };
  affordabilityScore: number;
}

interface GroceryPlan {
  _id: string;
  title: string;
  weeklyBudget: number;
  items: GroceryItem[];
  totalEstimatedCost: number;
  nutritionSummary: { totalCalories: number; totalProtein: number; totalCarbs: number; totalFat: number };
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  Protein: 'badge-green',
  Grains: 'badge-orange',
  Vegetables: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
  Dairy: 'badge-blue',
  Fruits: 'bg-pink-500/20 text-pink-400 border border-pink-500/20',
  Fats: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
  Spices: 'bg-red-500/20 text-red-400 border border-red-500/20',
};

export default function GroceryPlannerPage() {
  const { profile } = useAuthStore();
  const [plans, setPlans] = useState<GroceryPlan[]>([]);
  const [activePlan, setActivePlan] = useState<GroceryPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    api.get('/ai/grocery-plans')
      .then(r => {
        setPlans(r.data.data);
        if (r.data.data.length > 0) setActivePlan(r.data.data[0]);
      })
      .catch(console.error)
      .finally(() => setFetching(false));
  }, []);

  const generate = async () => {
    if (!profile?.isProfileComplete) { toast.error('Complete your profile first'); return; }
    setLoading(true);
    try {
      const weeklyBudget = Math.round((profile.monthlyBudget || 3000) / 4.3);
      const { data } = await api.post('/ai/grocery-plan', { weeklyBudget });
      setActivePlan(data.data);
      setPlans(prev => [data.data, ...prev.slice(0, 4)]);
      toast.success('Grocery plan generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate plan');
    } finally { setLoading(false); }
  };

  const categories = activePlan
    ? ['All', ...Array.from(new Set(activePlan.items.map(i => i.category)))]
    : ['All'];

  const filteredItems = activePlan?.items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>Grocery Planner</span>
      </div>
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
            <ShoppingCart className="text-purple-400" size={24} /> Grocery Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Optimized grocery lists with nutrition-per-rupee analytics</p>
        </div>
        <button onClick={generate} disabled={loading || fetching} className="btn-primary">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
            : <><Zap size={16} /> {activePlan ? 'New Grocery Plan' : 'Generate Plan'}</>}
        </button>
      </div>

      {(fetching || loading) && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-slate-400">{loading ? 'Optimizing your grocery list for maximum nutrition...' : 'Loading...'}</p>
        </div>
      )}

      {!fetching && !loading && activePlan && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Weekly Budget', value: `₹${activePlan.weeklyBudget}`, sub: 'allocated', icon: IndianRupee, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              { label: 'Estimated Cost', value: `₹${activePlan.totalEstimatedCost}`, sub: `₹${activePlan.weeklyBudget - activePlan.totalEstimatedCost} saved`, icon: TrendingUp, color: 'text-brand-400', bg: 'bg-brand-500/10' },
              { label: 'Weekly Protein', value: `${activePlan.nutritionSummary.totalProtein}g`, sub: 'total', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Total Items', value: `${activePlan.items.length}`, sub: 'grocery items', icon: ShoppingCart, color: 'text-saffron-400', bg: 'bg-saffron-500/10' },
            ].map((s) => (
              <div key={s.label} className="glass-card">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="text-xl font-bold" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search items..."
                className="input-field pl-9 py-2.5 text-sm"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'pref-pill'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items table */}
          <div className="glass-card overflow-hidden p-0">
            <div className="p-4 border-b border-white/5">
              <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Grocery Items ({filteredItems.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Item', 'Category', 'Quantity', 'Price', 'Protein/100g', 'Value Score'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors" style={{ borderBottom: "1px solid rgba(205,180,255,0.15)" }}
                    >
                      <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-dark)" }}>{item.name}</td>
                      <td className="px-4 py-3">
                        <span className={`badge text-xs ${categoryColors[item.category] || 'badge-blue'}`}>{item.category}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.quantity}{item.unit}</td>
                      <td className="px-4 py-3 text-purple-400 font-semibold">₹{item.estimatedPrice}</td>
                      <td className="px-4 py-3 text-brand-400 font-semibold">{item.nutritionPer100g.protein}g</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full max-w-16">
                            <div
                              className="h-full bg-brand-400 rounded-full"
                              style={{ width: `${Math.min((item.affordabilityScore / 6) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.affordabilityScore?.toFixed(1)}</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Nutrition Summary */}
          <div className="glass-card">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--text-dark)' }}>Weekly Nutrition Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Calories', value: activePlan.nutritionSummary.totalCalories, unit: 'kcal', color: 'bg-saffron-400' },
                { label: 'Protein', value: activePlan.nutritionSummary.totalProtein, unit: 'g', color: 'bg-brand-400' },
                { label: 'Carbs', value: activePlan.nutritionSummary.totalCarbs, unit: 'g', color: 'bg-blue-400' },
                { label: 'Fat', value: activePlan.nutritionSummary.totalFat, unit: 'g', color: 'bg-yellow-400' },
              ].map(n => (
                <div key={n.label} className="text-center p-4 bg-white/3 rounded-xl">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{n.value}<span className="text-sm text-slate-400 ml-1">{n.unit}</span></p>
                  <p className="text-xs text-slate-500 mt-1">{n.label}/week</p>
                  <div className={`h-1 ${n.color} rounded-full mt-2 opacity-60`} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {!fetching && !loading && !activePlan && (
        <div className="glass-card flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <ShoppingCart size={28} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-dark)' }}>No grocery plan yet</h3>
          <p className="text-slate-400 text-sm max-w-sm">Generate an AI-optimized grocery list that maximizes nutrition while staying within your budget.</p>
          <button onClick={generate} className="btn-primary mt-2"><Zap size={16} /> Generate Grocery Plan</button>
        </div>
      )}
    </div>
  );
}

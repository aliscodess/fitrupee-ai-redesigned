import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Save, Zap, Scale, Ruler, Target, Wallet, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  age: z.number().min(10).max(100),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(100).max(250),
  weight: z.number().min(20).max(300),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']),
  fitnessGoal: z.enum(['weight_loss', 'muscle_gain', 'maintain', 'endurance', 'general_fitness']),
  foodPreference: z.enum(['veg', 'non-veg', 'vegan', 'eggetarian']),
  allergies: z.string().optional(),
  monthlyBudget: z.number().min(500).max(50000),
  city: z.string().min(2),
  gymPreference: z.enum(['gym', 'home', 'both']),
  targetWeight: z.number().optional(),
});

type FormData = z.infer<typeof schema>;

const Select = ({ label, name, options, register, error }: any) => (
  <div>
    <label className="label">{label}</label>
    <select {...register(name)} className="input-field">
      {options.map(([v, l]: [string, string]) => <option key={v} value={v}>{l}</option>)}
    </select>
    {error && <p className="text-red-400 text-xs mt-1">{error.message}</p>}
  </div>
);

const NumberInput = ({ label, name, placeholder, min, max, step = 1, icon: Icon, register, errors }: any) => (
  <div>
    <label className="label">{label}</label>
    <div className="relative">
      {Icon && <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />}
      <input
        {...register(name, { valueAsNumber: true })}
        type="number" step={step} min={min} max={max}
        placeholder={placeholder}
        className={`input-field ${Icon ? 'pl-9' : ''}`}
      />
    </div>
    {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name].message}</p>}
  </div>
);

export default function ProfilePage() {
  const { profile, user, updateProfile } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        age: profile.age,
        gender: profile.gender as any,
        height: profile.height,
        weight: profile.weight,
        activityLevel: profile.activityLevel as any,
        fitnessGoal: profile.fitnessGoal as any,
        foodPreference: profile.foodPreference as any,
        monthlyBudget: profile.monthlyBudget,
        city: profile.city,
        gymPreference: profile.gymPreference as any,
        targetWeight: profile.targetWeight,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(s => s.trim()).filter(Boolean) : [],
      };
      await updateProfile(payload);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Link to="/" className="hover:text-purple-500 transition-colors flex items-center gap-1">
          <span>🏠</span> Home
        </Link>
        <span>/</span><span>Profile</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-dark)', fontFamily: 'Syne, sans-serif' }}>
          <User className="text-brand-400" size={24} /> Profile Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Complete your profile for personalized AI recommendations</p>
      </div>

      {/* User info card */}
      <div className="glass-card flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white" style={{ background: "linear-gradient(135deg, #9b72ef, #CDB4FF)" }}>
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--text-dark)' }}>{user?.name}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
        </div>
        {profile?.bmi && (
          <div className="ml-auto glass px-4 py-2 rounded-xl text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-dark)' }}>{profile.bmi}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>BMI</p>
          </div>
        )}
        {profile?.isProfileComplete && (
          <span className="badge-green ml-2 hidden sm:flex">Profile Complete</span>
        )}
      </div>

      {/* Targets card (read-only) */}
      {profile?.dailyCalorieTarget && (
        <div className="glass-card">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-dark)", fontFamily: "Syne, sans-serif" }}>
            <Zap size={16} className="text-brand-400" /> Your AI-Calculated Targets
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Daily Calories', value: `${profile.dailyCalorieTarget} kcal`, color: 'text-saffron-400' },
              { label: 'Daily Protein', value: `${profile.dailyProteinTarget}g`, color: 'text-brand-400' },
              { label: 'BMI', value: `${profile.bmi}`, color: 'text-blue-400' },
            ].map(t => (
              <div key={t.label} className="text-center p-3 bg-white/3 rounded-xl">
                <p className={`text-xl font-bold ${t.color}`}>{t.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-3">* Recalculated automatically when you update your profile</p>
        </div>
      )}

      {/* Profile form */}
      <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-6">
        <h3 className="font-semibold" style={{ color: 'var(--text-dark)' }}>Personal Information</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <NumberInput label="Age" name="age" placeholder="25" min={10} max={100} icon={User} register={register} errors={errors} />
          <NumberInput label="Height (cm)" name="height" placeholder="170" min={100} max={250} icon={Ruler} register={register} errors={errors} />
          <NumberInput label="Weight (kg)" name="weight" placeholder="70" min={20} max={300} step={0.1} icon={Scale} register={register} errors={errors} />
        </div>

        <Select
          label="Gender" name="gender" register={register} error={errors.gender}
          options={[['male', 'Male'], ['female', 'Female'], ['other', 'Other']]}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Activity Level" name="activityLevel" register={register}
            options={[
              ['sedentary', 'Sedentary (desk job, no exercise)'],
              ['light', 'Light (1-2x/week)'],
              ['moderate', 'Moderate (3-5x/week)'],
              ['active', 'Active (6-7x/week)'],
              ['very_active', 'Very Active (twice daily)'],
            ]}
          />
          <Select
            label="Fitness Goal" name="fitnessGoal" register={register}
            options={[
              ['weight_loss', 'Weight Loss'],
              ['muscle_gain', 'Muscle Gain'],
              ['maintain', 'Maintain Weight'],
              ['endurance', 'Improve Endurance'],
              ['general_fitness', 'General Fitness'],
            ]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Select
            label="Food Preference" name="foodPreference" register={register}
            options={[
              ['veg', '🥦 Vegetarian'],
              ['non-veg', '🍗 Non-Vegetarian'],
              ['vegan', '🌱 Vegan'],
              ['eggetarian', '🥚 Eggetarian'],
            ]}
          />
          <Select
            label="Workout Preference" name="gymPreference" register={register}
            options={[['home', '🏠 Home Workout'], ['gym', '🏋️ Gym'], ['both', '💪 Both']]}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <NumberInput label="Monthly Food Budget (₹)" name="monthlyBudget" placeholder="3000" min={500} icon={Wallet} register={register} errors={errors} />
          <div>
            <label className="label">City</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input {...register('city')} type="text" placeholder="Mumbai" className="input-field pl-9" />
            </div>
            {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city.message}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <NumberInput label="Target Weight (kg, optional)" name="targetWeight" placeholder="65" min={30} icon={Target} register={register} errors={errors} />
          <div>
            <label className="label">Allergies (comma-separated)</label>
            <input {...register('allergies')} type="text" placeholder="peanuts, gluten, dairy" className="input-field" />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
          {isSubmitting
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
            : <><Save size={16} /> Save Profile</>}
        </button>
      </form>
    </div>
  );
}

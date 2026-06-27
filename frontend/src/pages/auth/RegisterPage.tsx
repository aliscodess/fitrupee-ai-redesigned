import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: regUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await regUser(data.name, data.email, data.password);
      navigate('/app/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card"
      >
        <Link to="/" className="auth-logo">
          <div className="app-logo-icon">
            <Zap size={16} />
          </div>
          <span className="auth-logo-text">FitRupee <span style={{ color: 'var(--accent-lav)' }}>AI</span></span>
        </Link>

        <div className="auth-eyebrow">
          <Sparkles size={11} /> Get started for free
        </div>
        <h1 className="auth-h1">Create your account</h1>
        <p className="auth-sub">Start your AI-powered fitness journey today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <User size={15} className="auth-input-icon" />
              <input {...register('name')} type="text" placeholder="Rahul Sharma" className="auth-input" />
            </div>
            {errors.name && <p className="auth-error">{errors.name.message}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={15} className="auth-input-icon" />
              <input {...register('email')} type="email" placeholder="you@example.com" className="auth-input" />
            </div>
            {errors.email && <p className="auth-error">{errors.email.message}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="At least 6 characters" className="auth-input auth-input--pr" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password.message}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password</label>
            <div className="auth-input-wrap">
              <Lock size={15} className="auth-input-icon" />
              <input {...register('confirmPassword')} type={showPass ? 'text' : 'password'} placeholder="Repeat password" className="auth-input" />
            </div>
            {errors.confirmPassword && <p className="auth-error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="auth-submit">
            {isLoading
              ? <><span className="auth-spinner" /> Creating account...</>
              : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}

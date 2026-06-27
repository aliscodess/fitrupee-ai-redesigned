import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate('/app/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      {/* Blobs */}
      <div className="auth-blob auth-blob--1" />
      <div className="auth-blob auth-blob--2" />
      <div className="auth-blob auth-blob--3" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="auth-card"
      >
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="app-logo-icon">
            <Zap size={16} />
          </div>
          <span className="auth-logo-text">FitRupee <span style={{ color: 'var(--accent-lav)' }}>AI</span></span>
        </Link>

        <div className="auth-eyebrow">
          <Sparkles size={11} /> Welcome back
        </div>
        <h1 className="auth-h1">Sign in to your account</h1>
        <p className="auth-sub">Your wellness journey continues here.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
              <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" className="auth-input auth-input--pr" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="auth-eye">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="auth-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={isLoading} className="auth-submit">
            {isLoading
              ? <><span className="auth-spinner" /> Signing in...</>
              : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div className="auth-divider"><span>or</span></div>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}

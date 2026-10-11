import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Briefcase } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'employee1@abc.com',
      password: 'Employee@123',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await login(data.email, data.password);
      success(`Welcome back, ${res.user.name}!`);

      // Redirect according to user role
      if (res.user.role === 'DIRECTOR') {
        navigate('/director/dashboard');
      } else if (res.user.role === 'ACCOUNTS') {
        navigate('/accounts/dashboard');
      } else {
        navigate('/employee/dashboard');
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (email, password) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen aurora-mesh relative overflow-hidden flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Ambient background floating blurred orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none floating-element" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none floating-element" style={{ animationDelay: '-2s' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 shadow-2xl shadow-blue-500/40 text-white font-black text-3xl mb-4 border border-white/30 floating-element">
          P
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Prachay Capital
        </h2>
        <p className="mt-2 text-sm text-slate-300 font-medium">
          Expense Voucher Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-white/95 backdrop-blur-2xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/60 glow-rim">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@abc.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm input-focus-glow transition-all ${
                    errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  {...register('password')}
                  placeholder="••••••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm input-focus-glow transition-all ${
                    errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] shadow-lg shadow-blue-500/30 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher for Evaluator Convenience */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Quick Role Login (Click to populate)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('employee1@abc.com', 'Employee@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-slate-700 transition-all group hover-lift-card"
              >
                <Briefcase className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Employee</span>
                <span className="text-[10px] text-slate-400">Engineering</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('director@abc.com', 'Director@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/60 text-slate-700 transition-all group hover-lift-card"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Director</span>
                <span className="text-[10px] text-slate-400">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => fillCredentials('accounts@abc.com', 'Accounts@123')}
                className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 text-slate-700 transition-all group hover-lift-card"
              >
                <UserCheck className="w-4 h-4 text-blue-600 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Accounts</span>
                <span className="text-[10px] text-slate-400">Finance</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

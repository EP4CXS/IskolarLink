import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';
const HERO_BG = "/Banner_default.png";

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(from, {
        replace: true
      });
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${HERO_BG})`
        }}
        aria-hidden="true" />
      
      {/* Dark overlay for legibility */}
      <div className="absolute inset-0 bg-slate-950/70" aria-hidden="true" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          to="/"
          className="flex justify-center text-white mb-6 hover:opacity-90 transition-opacity">
          
          <div className="w-14 h-14 rounded-2xl bg-sky-500/20 border border-sky-400/40 backdrop-blur-md flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-sky-300" />
          </div>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Sign in to your account
        </h2>
        <p className="text-center text-sm text-slate-300 mt-2">
          Welcome back to IskolarLink
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 sm:px-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error &&
            <div className="bg-red-500/15 border border-red-400/40 text-red-100 px-4 py-3 rounded-md text-sm flex items-start gap-2 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            }

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@nemsu.edu.ph"
                className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition" />
              
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur pl-3 pr-10 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  
                  {showPassword ?
                  <EyeOff className="w-4 h-4" /> :

                  <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-sky-500 focus:ring-sky-400 border-white/30 bg-white/10 rounded mr-2" />
                
                Remember me
              </label>
              <a
                href="#"
                className="text-sm font-medium text-sky-300 hover:text-sky-200">
                
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0">
              
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 pt-6 border-t border-white/15 text-center text-sm text-slate-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="inline-block font-semibold text-sky-300 hover:text-white hover:-translate-y-0.5 transition-all duration-200">
              
              Create a new account →
            </Link>
          </p>
        </div>
      </div>
    </div>);

}
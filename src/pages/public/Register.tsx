import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
const HERO_BG = "/Banner_default.png";

type TextFieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

function TextField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder
}: TextFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1">
        {label}
      </label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
      />
    </div>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
};

function PasswordField({
  label,
  value,
  onChange,
  show,
  setShow
}: PasswordFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-200 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="flex h-10 w-full rounded-md border border-white/20 bg-white/10 backdrop-blur pl-3 pr-10 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition"
        />

        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register(name, email, password);
      navigate('/student/dashboard', {
        replace: true
      });
    } catch (err: any) {
      setError(err.message || 'Could not create account.');
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
      
      {/* Dark overlay */}
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
          Create your student account
        </h2>
        <p className="text-center text-sm text-slate-300 mt-2">
          Join the NEMSU IskolarLink community
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="py-8 px-4 sm:px-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error &&
            <div className="bg-red-500/15 border border-red-400/40 text-red-100 px-4 py-3 rounded-md text-sm flex items-start gap-2 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            }

            <TextField
              label="Full Name"
              value={name}
              onChange={setName}
              placeholder="Juan Dela Cruz" />
            
            <TextField
              label="Email address"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="juan@nemsu.edu.ph" />
            
            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
              show={showPassword}
              setShow={setShowPassword} />
            
            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
              show={showConfirm}
              setShow={setShowConfirm} />
            

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-lg bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:hover:translate-y-0">
              
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="text-xs text-center text-slate-400">
              Administrator accounts are provisioned by the scholarship office.
            </p>
          </form>

          <p className="mt-6 pt-6 border-t border-white/15 text-center text-sm text-slate-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="inline-block font-semibold text-sky-300 hover:text-white hover:-translate-y-0.5 transition-all duration-200">
              
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>);

}
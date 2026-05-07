import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  FileText,
  ArrowRight } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui';
const HERO_BG = "/Banner_default.png";

export function Landing() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return (
    <div className="min-h-screen bg-white">
      {/* Hero with background image */}
      <div className="relative">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_BG})`
          }}
          aria-hidden="true" />
        
        {/* Dark overlay for legibility */}
        <div className="absolute inset-0 bg-slate-950/70" aria-hidden="true" />

        <div className="relative z-10">
          {/* Navigation */}
          <nav className="border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 text-white">
                <GraduationCap className="w-8 h-8 text-sky-400" />
                <span className="text-xl font-bold tracking-tight">
                  IskolarLink
                </span>
              </Link>
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-white/80 hover:text-white hover:-translate-y-0.5 px-3 py-2 transition-all duration-200 relative group">
                  
                  Sign In
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-sky-400 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-200"></span>
                </Link>
                <Link to="/register">
                  <button className="h-9 px-4 rounded-lg bg-sky-500 text-white font-semibold text-sm shadow-lg shadow-sky-500/30 hover:bg-sky-400 hover:shadow-sky-400/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                    Create Account
                  </button>
                </Link>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center pt-24 pb-36 sm:pt-32 sm:pb-44">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-medium tracking-wide uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              NEMSU Scholarship Portal
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6 max-w-4xl mx-auto">
              Your Bridge to{' '}
              <span className="text-sky-400">Educational Opportunities</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto mb-10">
              A centralized platform for students to discover, apply, and track
              scholarships — built for the NEMSU community.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <button className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-sky-500 text-white font-semibold text-base shadow-xl shadow-sky-500/40 hover:bg-sky-400 hover:shadow-2xl hover:shadow-sky-400/60 hover:-translate-y-1 active:translate-y-0 transition-all duration-200">
                  Apply for Scholarships
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* Features Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              Why use IskolarLink?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Streamlining the scholarship process from application to approval.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Paperless Applications
              </h3>
              <p className="text-gray-600">
                Upload your documents once to your secure vault and apply to
                multiple scholarships with a single click.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Real-time Tracking
              </h3>
              <p className="text-gray-600">
                No more guessing. Track your application status through our
                visual timeline from submission to approval.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Screening
              </h3>
              <p className="text-gray-600">
                For admins, our system automatically filters applicants based on
                eligibility criteria, saving hours of manual work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4">
            <img
              src="/54669d56-2b5e-43fd-be9a-3d65a5d0c9b4.png"
              alt="NEMSU Seal"
              className="w-16 h-16 object-contain bg-white rounded-full p-1 flex-shrink-0" />
            
            <div>
              <p className="text-white font-semibold">
                North Eastern Mindanao State University
              </p>
              <p className="text-sm text-slate-400 mt-1">
                Surigao del Sur, Philippines
              </p>
              <p className="text-xs text-slate-500 mt-2">Established 1982</p>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">IskolarLink</h4>
            <p className="text-sm text-slate-400">
              The official scholarship application and screening platform of
              NEMSU — connecting students to opportunities.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-slate-400 hover:text-sky-400">
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-slate-400 hover:text-sky-400">
                  
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} NEMSU Scholarship Office. All rights
          reserved.
        </div>
      </footer>
    </div>);

}
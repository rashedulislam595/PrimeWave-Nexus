'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  BarChart3,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PrimeWave
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-indigo-400">
                Resource Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/resources"
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Browse Catalog
            </Link>
            <Link
              href="/calendar"
              className="text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hidden sm:block"
            >
              Schedule
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>PrimeWave Lab Technical Assessment Solution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Seamless Coordination for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
              Shared Facilities
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate scheduling confusion, overlapping bookings, and resource uncertainty.
            An enterprise-grade centralized digital system for meeting rooms, AI compute rigs,
            and research laboratories.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/resources"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold transition-all hover:border-slate-700"
            >
              View Resource Inventory
            </Link>
          </div>

          {/* Value Highlights */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-indigo-400 mb-2" />
              <div className="font-bold text-xl text-white">0%</div>
              <div className="text-xs text-slate-400 mt-0.5">Scheduling Overlaps</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-cyan-400 mb-2" />
              <div className="font-bold text-xl text-white">Real-Time</div>
              <div className="text-xs text-slate-400 mt-0.5">Conflict Prevention</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <div className="font-bold text-xl text-white">Role-Based</div>
              <div className="text-xs text-slate-400 mt-0.5">Admin & User Access</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <BarChart3 className="w-5 h-5 text-amber-400 mb-2" />
              <div className="font-bold text-xl text-white">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Utilization Visibility</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
              Engineered for Scalability
            </h2>
            <p className="text-3xl font-extrabold text-white">
              Addressing Real-World Operational Challenges
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">
                  Intelligent Conflict Detection
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Automatic mathematical validation prevents overlapping time windows, enforces
                  resource capacity constraints, and generates recommended free slots instantly.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-indigo-400 font-semibold flex items-center gap-1">
                <span>Deterministic collision prevention</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-5">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">
                  Visual Schedule Timeline
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Interactive multi-resource calendar view gives staff and facility managers full
                  visibility over today&apos;s occupancy, upcoming bookings, and free slots.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold flex items-center gap-1">
                <span>Multi-resource grid visualization</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2">
                  Administrative Governance
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Configurable approval workflows, resource status maintenance toggles, user
                  management, and an immutable activity audit log.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span>Full lifecycle audit trail</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 PrimeWave Lab (Pvt) Ltd. Technical Assessment Submission.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-slate-300 transition-colors">
              App Portal
            </Link>
            <span>•</span>
            <Link href="/calendar" className="hover:text-slate-300 transition-colors">
              Schedule
            </Link>
            <span>•</span>
            <Link href="/analytics" className="hover:text-slate-300 transition-colors">
              Analytics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

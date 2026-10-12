'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { AnalyticsStats } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Layers,
  Award,
  Sparkles,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load analytics', err);
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const handleExport = () => {
    toast.success('Generating organizational facility utilization summary...');
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-indigo-400" />
              Utilization & Capacity Analytics
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Data-driven insights into resource demand, peak hours, and scheduling efficiency.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Report</span>
          </button>
        </div>

        {loading || !stats ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            Calculating organizational metrics...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top 4 Insight Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Facility Utilization
                </span>
                <div className="text-3xl font-extrabold text-indigo-400">
                  {stats.utilizationRate}%
                </div>
                <p className="text-xs text-slate-400">
                  Proportion of shared resources actively occupied today
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Bookings Handled
                </span>
                <div className="text-3xl font-extrabold text-cyan-400">
                  {stats.totalReservations}
                </div>
                <p className="text-xs text-slate-400">
                  Zero manual booking errors or schedule collisions
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Active Department Users
                </span>
                <div className="text-3xl font-extrabold text-emerald-400">
                  {stats.activeUsers}
                </div>
                <p className="text-xs text-slate-400">
                  Engineering, R&D, Hardware, Media & Operations
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Approvals
                </span>
                <div className="text-3xl font-extrabold text-amber-400">
                  {stats.pendingApprovals}
                </div>
                <p className="text-xs text-slate-400">
                  Awaiting administrative sign-off
                </p>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Peak Booking Hours Chart */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      Peak Operating Hours
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Hourly distribution of reservations throughout working day
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.peakHours}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="hour"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        allowDecimals={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '1rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="bookings" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Breakdown Donut Chart */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      Reservation Status Breakdown
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ratio of approved, pending, completed, and rejected requests
                    </p>
                  </div>
                </div>

                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.reservationsByStatus.filter((s) => s.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.reservationsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '1rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Bottom Row: Most Booked Facilities & Category Demand */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Most Booked Resources */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  Most High-Demand Facilities
                </h3>
                <div className="space-y-3">
                  {stats.topResources.map((res, index) => (
                    <div
                      key={res.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-white">
                            {res.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {res.code} • {res.category}
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 font-mono">
                        {res.bookingsCount} booking{res.bookingsCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Demand by Category */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  Category Allocation
                </h3>
                <div className="space-y-3">
                  {stats.reservationsByCategory.map((c) => {
                    const total = stats.totalReservations || 1;
                    const percent = Math.round((c.count / total) * 100);
                    return (
                      <div key={c.category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-300">{c.category}</span>
                          <span className="font-mono text-slate-400">
                            {c.count} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                            style={{ width: `${Math.max(5, percent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

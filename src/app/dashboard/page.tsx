'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingModal } from '@/components/BookingModal';
import { ReservationDetailModal } from '@/components/ReservationDetailModal';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import {
  Resource,
  Reservation,
  AnalyticsStats,
  ActivityLog,
} from '@/types';
import {
  Layers,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  Activity,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [mounted, setMounted] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, resvRes, statsRes, logsRes] = await Promise.all([
        fetch('/api/resources').then((r) => r.json()),
        fetch('/api/reservations').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/activity-logs?limit=8').then((r) => r.json()),
      ]);

      setResources(resRes);
      setReservations(resvRes);
      setStats(statsRes);
      setActivityLogs(logsRes);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const handleQuickApprove = async (resvId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          adminId: currentUser.id,
          adminNotes: 'Quick-approved from administrative dashboard.',
        }),
      });

      if (res.ok) {
        toast.success('Reservation approved!');
        fetchData();
      } else {
        toast.error('Failed to approve');
      }
    } catch {
      toast.error('Error updating reservation');
    }
  };

  const handleQuickReject = async (resvId: string) => {
    try {
      const res = await fetch(`/api/reservations/${resvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          adminId: currentUser.id,
          adminNotes: 'Declined via administrative queue.',
        }),
      });

      if (res.ok) {
        toast.success('Reservation rejected');
        fetchData();
      } else {
        toast.error('Failed to reject');
      }
    } catch {
      toast.error('Error updating reservation');
    }
  };

  const pendingBookings = reservations.filter((r) => r.status === 'PENDING');
  
  const todaysBookings = mounted
    ? reservations
        .filter((r) => {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          const todayEnd = new Date();
          todayEnd.setHours(23, 59, 59, 999);
          const st = new Date(r.startTime).getTime();
          return st >= todayStart.getTime() && st <= todayEnd.getTime();
        })
        .slice(0, 5)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenBookingModal={() => setIsBookingModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Operations Dashboard
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
              >
                {isAdmin ? 'Admin View' : 'Member Portal'}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Welcome back, <strong className="text-slate-200">{currentUser.name}</strong> •{' '}
              {currentUser.department}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/calendar"
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Full Schedule</span>
            </Link>
            <button
              onClick={() => {
                setSelectedResourceId(undefined);
                setIsBookingModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Reserve Resource</span>
            </button>
          </div>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Facilities
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.totalResources || resources.length}
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {stats?.activeResources || resources.filter((r) => r.status === 'AVAILABLE').length} Available
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Rooms, Compute rigs & Labs
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Reservations
              </span>
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.totalReservations || reservations.length}
              </span>
              <span className="text-xs text-cyan-400 font-medium">
                +{stats?.approvedToday || 0} today
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Across all organizational teams
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-400">
                {stats?.pendingApprovals ?? pendingBookings.length}
              </span>
              {(stats?.pendingApprovals ?? pendingBookings.length) > 0 && (
                <span className="text-xs text-amber-300 font-medium bg-amber-500/20 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Requires administrative review
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Utilization Rate
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">
                {stats?.utilizationRate ?? 67}%
              </span>
              <span className="text-xs text-emerald-400 font-medium">Healthy</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Optimized resource turnover
            </div>
          </div>
        </div>

        {/* Main Content 2-Column Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (2 spans): Pending Queue + Today's Bookings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Administrative Action Queue (If pending bookings exist) */}
            {isAdmin && pendingBookings.length > 0 && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <h2 className="font-bold text-base text-white">
                      Administrative Approval Queue ({pendingBookings.length})
                    </h2>
                  </div>
                  <Link
                    href="/reservations?status=PENDING"
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {pendingBookings.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => setSelectedReservation(item)}
                      >
                        <div className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-300">
                            {item.resource?.name}
                          </span>
                          <span>•</span>
                          <span>By {item.user?.name}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-300">
                            {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuickReject(item.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-950/30 border border-rose-900/30 transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleQuickApprove(item.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Schedule Overview */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    Today&apos;s Active Reservations
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {todaysBookings.length} booking{todaysBookings.length === 1 ? '' : 's'} scheduled for today
                  </p>
                </div>
                <Link
                  href="/calendar"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {todaysBookings.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  No reservations scheduled for today. All facilities are free.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {todaysBookings.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedReservation(b)}
                      className="py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 px-2 rounded-xl transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-sm text-slate-200">
                          {b.title}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="font-mono text-indigo-300">
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span>•</span>
                          <span>{b.resource?.name}</span>
                        </div>
                      </div>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Shared Facilities Quick Grid */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-base text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-cyan-400" />
                    Shared Facilities & Labs
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any resource to initiate an instant booking
                  </p>
                </div>
                <Link
                  href="/resources"
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                >
                  <span>All ({resources.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {resources.slice(0, 4).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedResourceId(r.id);
                      setIsBookingModalOpen(true);
                    }}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-900/80 transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-mono text-[11px] font-bold text-indigo-400">
                        {r.code}
                      </div>
                      <div className="font-semibold text-xs text-slate-200 group-hover:text-white line-clamp-1">
                        {r.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Cap: {r.capacity} • {r.location.split(',')[0]}
                      </div>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 span): Live Activity Feed & Peak Hours */}
          <div className="space-y-6">
            {/* Activity Audit Trail */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Activity & Audit Trail
                </h2>
                <span className="text-[10px] uppercase font-bold text-slate-500">Live</span>
              </div>

              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-300">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-snug">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Conflict Demonstration Widget */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 to-slate-900/90 border border-indigo-500/30 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Conflict Prevention Engine
              </div>
              <h3 className="font-bold text-sm text-white">
                How Overlaps Are Prevented
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                When two teams attempt to book Boardroom Alpha at the same hour, the system
                automatically flags the collision in real time and offers free candidate slots.
              </p>
              <button
                onClick={() => {
                  setSelectedResourceId('res-1');
                  setIsBookingModalOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all"
              >
                Test Conflict Checker (CR-ALPHA)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchData}
        preselectedResourceId={selectedResourceId}
      />

      {/* Reservation Detail Modal */}
      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onRefresh={fetchData}
      />
    </div>
  );
}

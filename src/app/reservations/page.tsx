'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { BookingModal } from '@/components/BookingModal';
import { ReservationDetailModal } from '@/components/ReservationDetailModal';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { Reservation, ReservationStatus } from '@/types';
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Building,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReservationsPage() {
  const { currentUser, isAdmin } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [activeTab, setActiveTab] = useState<'ALL' | 'MINE' | ReservationStatus>('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reservations');
      const data = await res.json();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations', err);
      toast.error('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (resvId: string, status: ReservationStatus) => {
    try {
      const res = await fetch(`/api/reservations/${resvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          adminId: currentUser.id,
        }),
      });

      if (res.ok) {
        toast.success(`Reservation marked as ${status}`);
        fetchReservations();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Error updating reservation');
    }
  };

  const handleCancel = async (resvId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      const res = await fetch(`/api/reservations/${resvId}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Reservation cancelled');
        fetchReservations();
      } else {
        toast.error('Failed to cancel');
      }
    } catch {
      toast.error('Error cancelling reservation');
    }
  };

  // Filter logic
  const filtered = reservations.filter((r) => {
    if (activeTab === 'MINE' && r.userId !== currentUser.id) return false;
    if (activeTab !== 'ALL' && activeTab !== 'MINE' && r.status !== activeTab) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const titleMatch = r.title.toLowerCase().includes(q);
      const resMatch = r.resource?.name.toLowerCase().includes(q) || r.resource?.code.toLowerCase().includes(q);
      const userMatch = r.user?.name.toLowerCase().includes(q) || r.user?.department.toLowerCase().includes(q);
      return titleMatch || resMatch || userMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenBookingModal={() => setIsBookingModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <ClipboardList className="w-7 h-7 text-indigo-400" />
              Reservation Management
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review, approve, reject, or cancel facility bookings across the organization.
            </p>
          </div>

          <button
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Reservation</span>
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="space-y-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'ALL', label: 'All Reservations' },
              { id: 'MINE', label: 'My Bookings' },
              { id: 'PENDING', label: 'Pending Approval' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'COMPLETED', label: 'Completed' },
              { id: 'REJECTED', label: 'Rejected' },
              { id: 'CANCELLED', label: 'Cancelled' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Filter by booking title, resource, or reserver..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Reservations List Table / Cards */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Loading reservations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 space-y-2">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="text-base font-semibold text-slate-300">
              No reservations found
            </div>
            <p className="text-xs text-slate-500">
              No bookings match the selected tab filter or query.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden divide-y divide-slate-800/80">
            {filtered.map((item) => {
              const startDate = new Date(item.startTime);
              const endDate = new Date(item.endTime);
              const isOwner = item.userId === currentUser.id;

              return (
                <div
                  key={item.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedReservation(item)}
                >
                  {/* Left: Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-sm text-white hover:text-indigo-300 transition-colors">
                        {item.title}
                      </h3>
                      <StatusBadge status={item.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-300">
                        <Building className="w-3.5 h-3.5 text-indigo-400" />
                        {item.resource?.name} ({item.resource?.code})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-cyan-400" />
                        {item.user?.name} ({item.user?.department})
                      </span>
                    </div>

                    {item.purpose && (
                      <p className="text-xs text-slate-400 line-clamp-1 italic">
                        &quot;{item.purpose}&quot;
                      </p>
                    )}
                  </div>

                  {/* Middle: Timing */}
                  <div className="text-xs text-slate-300 space-y-0.5 md:text-right shrink-0">
                    <div className="font-semibold text-slate-200">
                      {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-indigo-400 font-mono">
                      {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {item.attendeesCount} pax
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div
                    className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isAdmin && item.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item.id, 'APPROVED')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, 'REJECTED')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/40 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {(isOwner || isAdmin) && item.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        title="Cancel reservation"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors border border-transparent hover:border-rose-900/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedReservation(item)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchReservations}
      />

      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onRefresh={fetchReservations}
      />
    </div>
  );
}

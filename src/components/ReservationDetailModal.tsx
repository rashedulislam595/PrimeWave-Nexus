'use client';

import React, { useState } from 'react';
import { Reservation } from '@/types';
import { StatusBadge } from './StatusBadge';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  Calendar,
  Clock,
  User,
  Building,
  MapPin,
  CheckCircle,
  XCircle,
  Trash2,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ReservationDetailModalProps {
  reservation: Reservation | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export function ReservationDetailModal({
  reservation,
  onClose,
  onRefresh,
}: ReservationDetailModalProps) {
  const { currentUser, isAdmin } = useAuth();
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!reservation) return null;

  const isOwner = currentUser.id === reservation.userId;
  const canManage = isAdmin;
  const canCancel = isOwner || isAdmin;

  const handleStatusChange = async (newStatus: 'APPROVED' | 'REJECTED') => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: adminNoteInput || undefined,
          adminId: currentUser.id,
        }),
      });

      if (!res.ok) {
        toast.error('Failed to update status');
        return;
      }

      toast.success(`Reservation marked as ${newStatus}!`);
      if (onRefresh) onRefresh();
      onClose();
    } catch {
      toast.error('Network error updating reservation');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/reservations/${reservation.id}?userId=${currentUser.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        toast.error('Failed to cancel reservation');
        return;
      }

      toast.success('Reservation cancelled successfully!');
      if (onRefresh) onRefresh();
      onClose();
    } catch {
      toast.error('Network error cancelling reservation');
    } finally {
      setUpdating(false);
    }
  };

  const startDate = new Date(reservation.startTime);
  const endDate = new Date(reservation.endTime);
  const durationMins = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={reservation.status} />
            <span className="font-mono text-xs text-slate-400">ID: {reservation.id}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">{reservation.title}</h2>
            {reservation.purpose && (
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                {reservation.purpose}
              </p>
            )}
          </div>

          {/* Time & Duration Card */}
          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Date & Time
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs text-indigo-300 font-mono mt-0.5">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duration & Size
              </div>
              <div className="text-sm font-semibold text-slate-200">
                {Math.floor(durationMins / 60)}h {durationMins % 60 > 0 ? `${durationMins % 60}m` : ''}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {reservation.attendeesCount} Attendee{reservation.attendeesCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Resource & User Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resource */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-400" />
                Target Facility
              </div>
              <div className="font-bold text-sm text-white">
                {reservation.resource?.name || 'Shared Resource'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                {reservation.resource?.location}
              </div>
            </div>

            {/* Requested By */}
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/60">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                Requested By
              </div>
              <div className="font-bold text-sm text-white">
                {reservation.user?.name || reservation.userId}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {reservation.user?.department || 'PrimeWave Team'}
              </div>
            </div>
          </div>

          {/* User notes if any */}
          {reservation.userNotes && (
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs">
              <div className="font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                Reserver Notes:
              </div>
              <div className="text-slate-300">{reservation.userNotes}</div>
            </div>
          )}

          {/* Admin notes if any */}
          {reservation.adminNotes && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
              <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
                Administrative Remarks:
              </div>
              <div className="text-indigo-200">{reservation.adminNotes}</div>
            </div>
          )}

          {/* Admin Decision Note Input (Only for admins if pending) */}
          {canManage && reservation.status === 'PENDING' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Approval / Rejection Remark (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Approved. Keys prepared in dispatch lockbox."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-5 border-t border-slate-800 bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            {canCancel && reservation.status !== 'CANCELLED' && (
              <button
                onClick={handleCancel}
                disabled={updating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/30 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel Reservation
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {canManage && reservation.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-semibold transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange('APPROVED')}
                  disabled={updating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 text-xs font-semibold transition-all hover:scale-105"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve Reservation
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

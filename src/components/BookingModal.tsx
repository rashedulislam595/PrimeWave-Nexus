'use client';

import React, { useState, useEffect } from 'react';
import { Resource, ConflictCheckResult } from '@/types';
import { useAuth } from '@/lib/auth-context';
import {
  X,
  AlertTriangle,
  Clock,
  Users,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedResourceId?: string;
}

export function BookingModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedResourceId,
}: BookingModalProps) {
  const { currentUser, isAdmin } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingResources, setLoadingResources] = useState(true);

  // Form states
  const [resourceId, setResourceId] = useState(preselectedResourceId || '');
  const [title, setTitle] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('2026-10-15');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [attendeesCount, setAttendeesCount] = useState(2);
  const [userNotes, setUserNotes] = useState('');
  const [forceBooking, setForceBooking] = useState(false);

  // Conflict state
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [conflictResult, setConflictResult] = useState<ConflictCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all resources on mount
  useEffect(() => {
    async function fetchRes() {
      setDate(new Date().toISOString().split('T')[0]);
      try {
        const res = await fetch('/api/resources');
        const data = await res.json();
        setResources(data);
        if (!preselectedResourceId && data.length > 0) {
          setResourceId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load resources', err);
      } finally {
        setLoadingResources(false);
      }
    }
    fetchRes();
  }, [preselectedResourceId]);

  useEffect(() => {
    if (preselectedResourceId) {
      setResourceId(preselectedResourceId);
    }
  }, [preselectedResourceId]);

  const selectedResource = resources.find((r) => r.id === resourceId);

  // Auto-check conflict whenever resource, date, startTime, or endTime changes
  useEffect(() => {
    if (!resourceId || !date || !startTime || !endTime) return;

    const startISO = new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = new Date(`${date}T${endTime}:00`).toISOString();

    const timer = setTimeout(async () => {
      setCheckingConflict(true);
      try {
        const res = await fetch('/api/reservations/check-conflict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resourceId,
            startTime: startISO,
            endTime: endISO,
            attendeesCount,
          }),
        });
        const result = await res.json();
        setConflictResult(result);
      } catch (err) {
        console.error('Error pre-checking conflicts', err);
      } finally {
        setCheckingConflict(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [resourceId, date, startTime, endTime, attendeesCount]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resourceId || !title.trim()) {
      toast.error('Please enter a booking title and select a resource');
      return;
    }

    const startISO = new Date(`${date}T${startTime}:00`).toISOString();
    const endISO = new Date(`${date}T${endTime}:00`).toISOString();

    if (new Date(startISO) >= new Date(endISO)) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          purpose,
          userId: currentUser.id,
          resourceId,
          startTime: startISO,
          endTime: endISO,
          attendeesCount,
          userNotes,
          force: forceBooking && isAdmin,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error(data.error || 'Scheduling conflict detected!');
          setConflictResult(data.conflict);
        } else {
          toast.error(data.error || 'Failed to submit booking');
        }
        return;
      }

      toast.success(
        data.status === 'APPROVED'
          ? 'Reservation successfully approved and confirmed!'
          : 'Reservation submitted! Pending administrative approval.'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast.error('Network error creating reservation');
    } finally {
      setSubmitting(false);
    }
  };

  const applySuggestedSlot = (slot: { startTime: string; endTime: string }) => {
    const sDate = new Date(slot.startTime);
    const eDate = new Date(slot.endTime);

    const pad = (n: number) => n.toString().padStart(2, '0');
    setDate(sDate.toISOString().split('T')[0]);
    setStartTime(`${pad(sDate.getHours())}:${pad(sDate.getMinutes())}`);
    setEndTime(`${pad(eDate.getHours())}:${pad(eDate.getMinutes())}`);
    toast.success('Applied suggested alternative time slot!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 bg-slate-900/60">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Reserve Resource
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Booking on behalf of{' '}
              <span className="font-semibold text-slate-200">{currentUser.name}</span> (
              {currentUser.role})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Select Resource */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Target Resource *
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={loadingResources}
            >
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} — {r.name} ({r.location}) [Cap: {r.capacity}]
                </option>
              ))}
            </select>
          </div>

          {/* Selected Resource Overview Pill */}
          {selectedResource && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300">
              <Info className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                <strong>Capacity:</strong> {selectedResource.capacity} pax
              </span>
              <span>•</span>
              <span>
                <strong>Approval:</strong>{' '}
                {selectedResource.requiresApproval ? 'Requires Admin Approval' : 'Instant Confirmation'}
              </span>
              <span>•</span>
              <span>
                <strong>Policy:</strong> {selectedResource.minDurationMinutes}m -{' '}
                {selectedResource.maxDurationMinutes / 60}h
              </span>
            </div>
          )}

          {/* Title & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reservation Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sprint Architecture Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expected Attendees Count
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min={1}
                  max={selectedResource ? selectedResource.capacity : 50}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Date, Start Time, End Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* REAL-TIME CONFLICT NOTIFICATION / SUGGESTIONS BANNER */}
          {checkingConflict && (
            <div className="flex items-center gap-2 text-xs text-indigo-400 py-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Verifying schedule availability in real-time...</span>
            </div>
          )}

          {!checkingConflict && conflictResult && conflictResult.hasConflict && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm text-rose-200">
                    Schedule Conflict Detected
                  </div>
                  <div className="text-xs text-rose-300/90 mt-0.5">
                    {conflictResult.reason}
                  </div>
                </div>
              </div>

              {/* Conflicting Reservations List */}
              {conflictResult.conflictingReservations?.length > 0 && (
                <div className="pl-7 space-y-1 text-xs">
                  <div className="text-rose-400 font-medium">Overlapping booking(s):</div>
                  {conflictResult.conflictingReservations.map((c) => (
                    <div
                      key={c.id}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-900/30 border border-rose-800/40 text-slate-200 flex items-center justify-between"
                    >
                      <span className="font-medium truncate max-w-[280px]">
                        {c.title}
                      </span>
                      <span className="text-[11px] text-rose-300 font-mono">
                        {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Alternative Free Slots */}
              {conflictResult.suggestedSlots && conflictResult.suggestedSlots.length > 0 && (
                <div className="pt-2 border-t border-rose-900/40 pl-7 space-y-2">
                  <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Recommended alternative free slots today:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conflictResult.suggestedSlots.map((slot, idx) => {
                      const sStr = new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const eStr = new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => applySuggestedSlot(slot)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-all hover:scale-105"
                        >
                          {sStr} – {eStr} (Select)
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Admin Force Override Toggle */}
              {isAdmin && (
                <div className="pt-2 border-t border-rose-900/40 pl-7 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="forceOverride"
                    checked={forceBooking}
                    onChange={(e) => setForceBooking(e.target.checked)}
                    className="rounded bg-slate-900 border-rose-500 text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="forceOverride" className="text-xs text-amber-300 font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Administrative Override: Force booking regardless of overlap
                  </label>
                </div>
              )}
            </div>
          )}

          {!checkingConflict && conflictResult && !conflictResult.hasConflict && (
            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Slot Available!</strong> No schedule collisions found for selected time range.
              </span>
            </div>
          )}

          {/* Purpose & Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Purpose & Operational Notes
            </label>
            <textarea
              rows={2}
              placeholder="Outline project goal, special equipment needs, or preparation requirements..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || (conflictResult?.hasConflict && !(isAdmin && forceBooking))}
              className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg transition-all ${
                conflictResult?.hasConflict && !(isAdmin && forceBooking)
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/30 hover:scale-[1.02]'
              }`}
            >
              {submitting ? 'Confirming...' : forceBooking ? 'Force Book (Admin)' : 'Submit Reservation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

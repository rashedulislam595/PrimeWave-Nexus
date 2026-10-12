'use client';

import React, { useState, useEffect } from 'react';
import { Reservation, Resource } from '@/types';
import { StatusBadge } from './StatusBadge';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';

interface CalendarViewProps {
  resources: Resource[];
  reservations: Reservation[];
  onOpenBooking: (resourceId?: string) => void;
  onSelectReservation?: (reservation: Reservation) => void;
}

export function CalendarView({
  resources,
  reservations,
  onOpenBooking,
  onSelectReservation,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState('2026-10-15');
  const [filterResourceId, setFilterResourceId] = useState<string>('ALL');

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Change date helpers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Filter resources to display
  const displayedResources =
    filterResourceId === 'ALL'
      ? resources
      : resources.filter((r) => r.id === filterResourceId);

  // Filter reservations occurring on the selected date
  const dayReservations = reservations.filter((res) => {
    const startStr = res.startTime.split('T')[0];
    const endStr = res.endTime.split('T')[0];
    return selectedDate >= startStr && selectedDate <= endStr;
  });

  // Hours: 08:00 to 20:00 (12 hours)
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const formattedDateHeader = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* Calendar Header Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-2xl bg-slate-950 border border-slate-800 p-1">
            <button
              onClick={handlePrevDay}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextDay}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm text-white">{formattedDateHeader}</span>
          </div>
        </div>

        {/* Resource Filter */}
        <div className="flex items-center gap-3">
          <select
            value={filterResourceId}
            onChange={(e) => setFilterResourceId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Shared Resources ({resources.length})</option>
            {resources.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} — {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => onOpenBooking(filterResourceId !== 'ALL' ? filterResourceId : undefined)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Slot</span>
          </button>
        </div>
      </div>

      {/* Visual Timeline Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[850px]">
          {/* Hour Markers Bar */}
          <div className="grid grid-cols-13 border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 font-mono">
            <div className="p-3 font-semibold text-slate-300 border-r border-slate-800 truncate">
              Resource
            </div>
            {hours.map((h) => (
              <div
                key={h}
                className="p-3 text-center border-r border-slate-800/60 last:border-r-0 truncate"
              >
                {h > 12 ? `${h - 12} PM` : `${h} AM`}
              </div>
            ))}
          </div>

          {/* Resource Rows */}
          <div className="divide-y divide-slate-800/80">
            {displayedResources.map((res) => {
              // Find reservations for this resource today
              const resBookings = dayReservations.filter((b) => b.resourceId === res.id);

              return (
                <div key={res.id} className="grid grid-cols-13 min-h-[85px] relative group">
                  {/* Resource Column Header */}
                  <div className="p-3 border-r border-slate-800 bg-slate-950/40 flex flex-col justify-center">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {res.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 line-clamp-1">
                      {res.name}
                    </span>
                    <span className="text-[10px] text-slate-500 line-clamp-1">
                      {res.location.split(',')[0]}
                    </span>
                  </div>

                  {/* 12 Hour Slot Backgrounds */}
                  {hours.map((h) => (
                    <div
                      key={h}
                      onClick={() => onOpenBooking(res.id)}
                      className="border-r border-slate-800/40 last:border-r-0 hover:bg-indigo-950/20 cursor-pointer transition-colors relative"
                    />
                  ))}

                  {/* Render Booked Interval Blocks */}
                  {resBookings.map((b) => {
                    const startH = new Date(b.startTime).getHours() + new Date(b.startTime).getMinutes() / 60;
                    const endH = new Date(b.endTime).getHours() + new Date(b.endTime).getMinutes() / 60;

                    // Clamped to 8 to 20 range
                    const visualStart = Math.max(8, startH);
                    const visualEnd = Math.min(20, endH);

                    if (visualEnd <= 8 || visualStart >= 20) return null;

                    // Calculate percentage offset: column 1 is 1/13th (7.69%), the other 12 columns cover the remaining 92.31%
                    const timelineWidthPercent = 92.307;
                    const leftOffsetPercent = 7.692 + ((visualStart - 8) / 12) * timelineWidthPercent;
                    const blockWidthPercent = Math.max(2, ((visualEnd - visualStart) / 12) * timelineWidthPercent);

                    const isApproved = b.status === 'APPROVED';
                    const isPending = b.status === 'PENDING';

                    return (
                      <div
                        key={b.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectReservation) onSelectReservation(b);
                        }}
                        style={{
                          left: `${leftOffsetPercent}%`,
                          width: `${blockWidthPercent}%`,
                        }}
                        className={`absolute top-2 bottom-2 z-10 rounded-xl px-2.5 py-1.5 flex flex-col justify-between overflow-hidden shadow-lg border cursor-pointer transition-transform hover:scale-[1.01] hover:z-20 ${
                          isApproved
                            ? 'bg-gradient-to-r from-emerald-950/90 to-teal-900/90 border-emerald-500/40 text-emerald-200'
                            : isPending
                            ? 'bg-gradient-to-r from-amber-950/90 to-orange-900/90 border-amber-500/40 text-amber-200'
                            : 'bg-slate-800/90 border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate">{b.title}</span>
                          <StatusBadge status={b.status} size="sm" />
                        </div>
                        <div className="flex items-center justify-between text-[10px] opacity-80 font-mono">
                          <span>
                            {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                            {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="truncate max-w-[90px]">{b.user?.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Legend */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span>Approved Reservation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/30 border border-amber-500" />
            <span>Pending Approval</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span>Available Slot (Click to Book)</span>
          </div>
        </div>
        <div>
          Click any free hour cell to book immediately.
        </div>
      </div>
    </div>
  );
}

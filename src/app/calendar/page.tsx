'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { CalendarView } from '@/components/CalendarView';
import { BookingModal } from '@/components/BookingModal';
import { ReservationDetailModal } from '@/components/ReservationDetailModal';
import { Resource, Reservation } from '@/types';
import { Calendar, Layers, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | undefined>();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resRes, resvRes] = await Promise.all([
        fetch('/api/resources').then((r) => r.json()),
        fetch('/api/reservations').then((r) => r.json()),
      ]);
      setResources(resRes);
      setReservations(resvRes);
    } catch (err) {
      console.error('Failed to load schedule', err);
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar onOpenBookingModal={() => setIsBookingModalOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-7 h-7 text-cyan-400" />
              Interactive Occupancy Schedule
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Visual real-time timeline across all PrimeWave facilities. Click any empty slot to book instantly.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedResourceId(undefined);
              setIsBookingModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Booking</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center text-slate-400 text-sm">
            Loading facility schedule timeline...
          </div>
        ) : (
          <CalendarView
            resources={resources}
            reservations={reservations}
            onOpenBooking={(resId) => {
              setSelectedResourceId(resId);
              setIsBookingModalOpen(true);
            }}
            onSelectReservation={(resv) => setSelectedReservation(resv)}
          />
        )}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={fetchData}
        preselectedResourceId={selectedResourceId}
      />

      <ReservationDetailModal
        reservation={selectedReservation}
        onClose={() => setSelectedReservation(null)}
        onRefresh={fetchData}
      />
    </div>
  );
}

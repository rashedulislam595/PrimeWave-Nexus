'use client';

import React from 'react';
import { Resource } from '@/types';
import { StatusBadge } from './StatusBadge';
import { Users, MapPin, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface ResourceCardProps {
  resource: Resource;
  onBook: (resourceId: string) => void;
}

export function ResourceCard({ resource, onBook }: ResourceCardProps) {
  const isAvailable = resource.status === 'AVAILABLE';

  return (
    <div className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
        {resource.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resource.imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-slate-950 to-indigo-950 text-slate-600">
            No Preview Available
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-mono font-bold text-indigo-300">
            {resource.code}
          </span>
          <StatusBadge status={resource.status} size="sm" />
        </div>

        {/* Category Pill on bottom of image */}
        {resource.category && (
          <div className="absolute bottom-3 left-3">
            <span
              className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide backdrop-blur-md bg-slate-950/80 border border-slate-700/60"
              style={{ color: resource.category.color || '#818cf8' }}
            >
              {resource.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {resource.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Capacity: {resource.capacity}</span>
            </div>
            <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">{resource.location.split(',')[0]}</span>
            </div>
          </div>

          {/* Amenities Chips */}
          {resource.amenities && resource.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {resource.amenities.slice(0, 3).map((a, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800/60 text-slate-300 text-[10px] font-medium border border-slate-700/40"
                >
                  {a}
                </span>
              ))}
              {resource.amenities.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-slate-800/30 text-slate-400 text-[10px]">
                  +{resource.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer info & Action button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              {resource.minDurationMinutes}m - {resource.maxDurationMinutes / 60}h
            </span>
          </div>

          <button
            onClick={() => onBook(resource.id)}
            disabled={!isAvailable}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isAvailable
                ? 'bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            {isAvailable ? 'Book Slot' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
}

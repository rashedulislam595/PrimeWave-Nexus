import { Reservation, Resource, ConflictCheckResult } from '@/types';

/**
 * Validates and checks for any scheduling conflicts for a resource reservation.
 */
export function checkReservationConflict(params: {
  resource: Resource;
  startTime: Date | string;
  endTime: Date | string;
  attendeesCount?: number;
  existingReservations: Reservation[];
  excludeReservationId?: string;
}): ConflictCheckResult {
  const { resource, existingReservations, excludeReservationId, attendeesCount } = params;

  const start = new Date(params.startTime);
  const end = new Date(params.endTime);

  // 1. Time validity checks
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: 'Invalid start or end time format.',
    };
  }

  if (start >= end) {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: 'Reservation end time must be after start time.',
    };
  }

  // Duration in minutes
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / 60000);

  if (resource.minDurationMinutes && durationMinutes < resource.minDurationMinutes) {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: `Duration (${durationMinutes} mins) is below the minimum allowed duration (${resource.minDurationMinutes} mins) for this resource.`,
    };
  }

  if (resource.maxDurationMinutes && durationMinutes > resource.maxDurationMinutes) {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: `Duration (${durationMinutes} mins) exceeds the maximum allowed duration (${resource.maxDurationMinutes} mins) for this resource.`,
    };
  }

  // 2. Resource status check
  if (resource.status !== 'AVAILABLE') {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: `Resource is currently ${resource.status.toLowerCase()} and cannot accept new reservations.`,
    };
  }

  // 3. Capacity check
  if (attendeesCount && resource.capacity && attendeesCount > resource.capacity) {
    return {
      hasConflict: true,
      conflictingReservations: [],
      reason: `Expected attendees (${attendeesCount}) exceed maximum resource capacity (${resource.capacity}).`,
    };
  }

  // 4. Overlap conflict detection against active bookings (APPROVED and PENDING)
  const conflictingReservations = existingReservations.filter((r) => {
    // Skip self when updating an existing booking
    if (excludeReservationId && r.id === excludeReservationId) return false;
    // Only check against bookings for the same resource
    if (r.resourceId !== resource.id) return false;
    // Only consider bookings that actively hold the resource
    if (r.status !== 'APPROVED' && r.status !== 'PENDING') return false;

    const rStart = new Date(r.startTime);
    const rEnd = new Date(r.endTime);

    // Overlap condition: start < rEnd && end > rStart
    return start < rEnd && end > rStart;
  });

  if (conflictingReservations.length > 0) {
    // Generate intelligent suggested alternative slots on the same day
    const suggestedSlots = findAlternativeSlots({
      resource,
      targetDate: start,
      durationMinutes,
      existingReservations,
      excludeReservationId,
    });

    return {
      hasConflict: true,
      conflictingReservations,
      reason: `Resource "${resource.name}" is already reserved for an overlapping time slot (${conflictingReservations.length} conflicting booking${conflictingReservations.length > 1 ? 's' : ''}).`,
      suggestedSlots,
    };
  }

  return {
    hasConflict: false,
    conflictingReservations: [],
  };
}

/**
 * Searches for free alternative time slots for a given day (e.g. 08:00 to 19:00).
 */
export function findAlternativeSlots(params: {
  resource: Resource;
  targetDate: Date;
  durationMinutes: number;
  existingReservations: Reservation[];
  excludeReservationId?: string;
  maxSlots?: number;
}): { startTime: string; endTime: string }[] {
  const { resource, targetDate, durationMinutes, existingReservations, excludeReservationId, maxSlots = 3 } = params;

  const results: { startTime: string; endTime: string }[] = [];
  const activeBookings = existingReservations.filter((r) => {
    if (excludeReservationId && r.id === excludeReservationId) return false;
    if (r.resourceId !== resource.id) return false;
    if (r.status !== 'APPROVED' && r.status !== 'PENDING') return false;
    return true;
  });

  // Check candidate slots every 30 minutes between 08:00 and 18:00
  const candidate = new Date(targetDate);
  candidate.setHours(8, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(19, 0, 0, 0);

  while (candidate.getTime() + durationMinutes * 60000 <= endOfDay.getTime() && results.length < maxSlots) {
    const slotStart = new Date(candidate);
    const slotEnd = new Date(candidate.getTime() + durationMinutes * 60000);

    const hasConflict = activeBookings.some((r) => {
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      return slotStart < rEnd && slotEnd > rStart;
    });

    if (!hasConflict && slotStart.getTime() > Date.now()) {
      results.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
      });
    }

    // Advance by 30 mins
    candidate.setMinutes(candidate.getMinutes() + 30);
  }

  return results;
}

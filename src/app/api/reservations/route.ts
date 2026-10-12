import { NextRequest, NextResponse } from 'next/server';
import { getReservations, createReservation, getResourceById } from '@/lib/storage';
import { checkReservationConflict } from '@/lib/conflict-detector';
import { ReservationStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const resourceId = searchParams.get('resourceId') || undefined;
    const status = (searchParams.get('status') as ReservationStatus) || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    const reservations = await getReservations({
      userId,
      resourceId,
      status,
      startDate,
      endDate,
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('Failed to get reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      purpose,
      userId,
      resourceId,
      startTime,
      endTime,
      attendeesCount,
      userNotes,
      force,
    } = body;

    if (!title || !userId || !resourceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields (title, userId, resourceId, startTime, endTime)' },
        { status: 400 }
      );
    }

    const resource = await getResourceById(resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    // Run conflict detection unless explicitly forced by an Admin
    if (!force) {
      const existing = await getReservations({ resourceId });
      const conflictCheck = checkReservationConflict({
        resource,
        startTime,
        endTime,
        attendeesCount: attendeesCount ? Number(attendeesCount) : undefined,
        existingReservations: existing,
      });

      if (conflictCheck.hasConflict) {
        return NextResponse.json(
          {
            error: conflictCheck.reason || 'Scheduling conflict detected.',
            conflict: conflictCheck,
          },
          { status: 409 }
        );
      }
    }

    const reservation = await createReservation({
      title,
      purpose,
      userId,
      resourceId,
      startTime,
      endTime,
      attendeesCount: attendeesCount ? Number(attendeesCount) : 1,
      userNotes,
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('Failed to create reservation:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getResourceById, getReservations } from '@/lib/storage';
import { checkReservationConflict } from '@/lib/conflict-detector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resourceId, startTime, endTime, attendeesCount, excludeReservationId } = body;

    if (!resourceId || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required parameters (resourceId, startTime, endTime)' },
        { status: 400 }
      );
    }

    const resource = await getResourceById(resourceId);
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const allReservations = await getReservations({ resourceId });

    const result = checkReservationConflict({
      resource,
      startTime,
      endTime,
      attendeesCount: attendeesCount ? Number(attendeesCount) : undefined,
      existingReservations: allReservations,
      excludeReservationId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to check conflict:', error);
    return NextResponse.json({ error: 'Internal error checking conflict' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getReservationById, updateReservationStatus, deleteReservation } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservation = await getReservationById(id);

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Failed to get reservation:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { status, adminNotes, adminId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status field' }, { status: 400 });
    }

    const updated = await updateReservationStatus({
      id,
      status,
      adminNotes,
      adminId,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update reservation:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;

    const deleted = await deleteReservation(id, userId);

    if (!deleted) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Reservation cancelled' });
  } catch (error) {
    console.error('Failed to delete reservation:', error);
    return NextResponse.json({ error: 'Failed to cancel reservation' }, { status: 500 });
  }
}

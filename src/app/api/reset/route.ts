import { NextResponse } from 'next/server';
import { resetDatabaseToSeed } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await resetDatabaseToSeed();
    return NextResponse.json({ success: true, message: 'Database reset to initial seed state.' });
  } catch (error) {
    console.error('Failed to reset database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
}

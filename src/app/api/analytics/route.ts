import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getAnalytics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

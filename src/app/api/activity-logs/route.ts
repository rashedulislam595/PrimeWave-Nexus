import { NextRequest, NextResponse } from 'next/server';
import { getActivityLogs } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 30;

    const logs = await getActivityLogs(limit);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Failed to get activity logs:', error);
    return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 });
  }
}

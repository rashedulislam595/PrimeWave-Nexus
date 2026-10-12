import { NextResponse } from 'next/server';
import { getCategories } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

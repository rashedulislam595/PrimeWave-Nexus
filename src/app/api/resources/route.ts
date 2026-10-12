import { NextRequest, NextResponse } from 'next/server';
import { getResources, createResource } from '@/lib/storage';
import { ResourceStatus } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const status = (searchParams.get('status') as ResourceStatus) || undefined;
    const search = searchParams.get('search') || undefined;

    const resources = await getResources({ categoryId, status, search });
    return NextResponse.json(resources);
  } catch (error) {
    console.error('Failed to get resources:', error);
    return NextResponse.json({ error: 'Failed to fetch resources' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.code || !body.categoryId || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields (name, code, categoryId, location)' },
        { status: 400 }
      );
    }

    const newResource = await createResource({
      name: body.name,
      code: body.code.toUpperCase().trim(),
      description: body.description || '',
      categoryId: body.categoryId,
      capacity: Number(body.capacity) || 1,
      location: body.location,
      status: body.status || 'AVAILABLE',
      amenities: Array.isArray(body.amenities) ? body.amenities : [],
      imageUrl: body.imageUrl || null,
      requiresApproval: body.requiresApproval !== undefined ? Boolean(body.requiresApproval) : true,
      minDurationMinutes: Number(body.minDurationMinutes) || 30,
      maxDurationMinutes: Number(body.maxDurationMinutes) || 480,
    });

    return NextResponse.json(newResource, { status: 201 });
  } catch (error) {
    console.error('Failed to create resource:', error);
    return NextResponse.json({ error: 'Failed to create resource' }, { status: 500 });
  }
}

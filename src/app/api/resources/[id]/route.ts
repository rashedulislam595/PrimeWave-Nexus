import { NextRequest, NextResponse } from 'next/server';
import { getResourceById, updateResource, deleteResource } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const resource = await getResourceById(id);

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Failed to get resource:', error);
    return NextResponse.json({ error: 'Failed to fetch resource' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateResource(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update resource:', error);
    return NextResponse.json({ error: 'Failed to update resource' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteResource(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('Failed to delete resource:', error);
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}

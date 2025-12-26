import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('articles')
    .select('*, blogs(name, slug)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: 'Article non trouvé' },
      { status: 404 }
    );
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  // Only include fields that are provided
  const allowedFields = [
    'title',
    'slug',
    'excerpt',
    'content',
    'category',
    'status',
    'tags',
    'featured_image',
    'seo_title',
    'seo_description',
    'published_at',
  ];

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  const { error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const blogId = searchParams.get('blog_id');

  let query = supabase
    .from('articles')
    .select('id, title, slug, category, status, product_ids, created_at, blogs(name, slug)')
    .order('created_at', { ascending: false });

  if (blogId) {
    query = query.eq('blog_id', blogId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

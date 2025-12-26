import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const blog_id = searchParams.get('blog_id');

  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (blog_id) {
    query = query.eq('blog_id', blog_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const {
    blog_id,
    product_id,
    partner_id = 'amazon',
    title,
    price,
    currency = 'EUR',
    images,
    features,
    description,
    rating,
    review_count,
  } = body;

  if (!blog_id || !product_id || !title) {
    return NextResponse.json(
      { error: 'blog_id, product_id et title sont requis' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      blog_id,
      partner_id,
      product_id,
      title,
      price,
      currency,
      images: images || [],
      features: features || [],
      description,
      rating,
      review_count,
      manual_override: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

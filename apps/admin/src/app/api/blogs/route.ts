import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('blogs')
    .select('*, articles(count)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { name, slug, niche, description, primary_color, amazon_affiliate_id, domain } = body;

  if (!name || !slug || !niche) {
    return NextResponse.json(
      { error: 'Nom, slug et niche sont requis' },
      { status: 400 }
    );
  }

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('blogs')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'Ce slug est déjà utilisé' },
      { status: 400 }
    );
  }

  // Create the blog
  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .insert({
      name,
      slug,
      niche,
      description,
      primary_color: primary_color || '#3B82F6',
      domain,
    })
    .select()
    .single();

  if (blogError) {
    return NextResponse.json({ error: blogError.message }, { status: 500 });
  }

  // If Amazon affiliate ID is provided, create the affiliate link
  if (amazon_affiliate_id && blog) {
    await supabase.from('blog_affiliate_ids').insert({
      blog_id: blog.id,
      partner_id: 'amazon',
      affiliate_id: amazon_affiliate_id,
      is_primary: true,
    });
  }

  return NextResponse.json(blog, { status: 201 });
}

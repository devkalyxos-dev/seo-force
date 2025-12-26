import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [blogResult, affiliateResult] = await Promise.all([
    supabase.from('blogs').select('*').eq('id', id).single(),
    supabase.from('blog_affiliate_ids').select('*').eq('blog_id', id),
  ]);

  if (blogResult.error) {
    return NextResponse.json(
      { error: 'Blog non trouvé' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    blog: blogResult.data,
    affiliateIds: affiliateResult.data || [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { name, niche, description, primary_color, domain, amazon_affiliate_id } = body;

  // Update blog
  const { error: blogError } = await supabase
    .from('blogs')
    .update({
      name,
      niche,
      description,
      primary_color,
      domain,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (blogError) {
    return NextResponse.json({ error: blogError.message }, { status: 500 });
  }

  // Update Amazon affiliate ID
  if (amazon_affiliate_id !== undefined) {
    // Check if exists
    const { data: existing } = await supabase
      .from('blog_affiliate_ids')
      .select('id')
      .eq('blog_id', id)
      .eq('partner_id', 'amazon')
      .single();

    if (existing) {
      if (amazon_affiliate_id) {
        await supabase
          .from('blog_affiliate_ids')
          .update({ affiliate_id: amazon_affiliate_id })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('blog_affiliate_ids')
          .delete()
          .eq('id', existing.id);
      }
    } else if (amazon_affiliate_id) {
      await supabase.from('blog_affiliate_ids').insert({
        blog_id: id,
        partner_id: 'amazon',
        affiliate_id: amazon_affiliate_id,
        is_primary: true,
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  // Delete related records first (cascade not always reliable)
  await Promise.all([
    supabase.from('articles').delete().eq('blog_id', id),
    supabase.from('products').delete().eq('blog_id', id),
    supabase.from('blog_affiliate_ids').delete().eq('blog_id', id),
    supabase.from('legal_pages').delete().eq('blog_id', id),
    supabase.from('subscribers').delete().eq('blog_id', id),
  ]);

  // Delete the blog
  const { error } = await supabase.from('blogs').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

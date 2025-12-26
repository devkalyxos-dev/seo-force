import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data } = await supabase
    .from('admin_settings')
    .select('key, value')
    .in('key', ['openai_api_key']);

  const settings: Record<string, string> = {
    openai_api_key: '',
  };

  if (data) {
    for (const row of data) {
      settings[row.key] = row.value || '';
    }
  }

  // Mask the API key for security
  if (settings.openai_api_key) {
    settings.openai_api_key = settings.openai_api_key.slice(0, 7) + '...' + settings.openai_api_key.slice(-4);
  }

  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.json();

  const { openai_api_key } = body;

  // Only update if it's a new key (not masked)
  if (openai_api_key && !openai_api_key.includes('...')) {
    await supabase
      .from('admin_settings')
      .upsert(
        { key: 'openai_api_key', value: openai_api_key },
        { onConflict: 'key' }
      );
  }

  return NextResponse.json({ success: true });
}

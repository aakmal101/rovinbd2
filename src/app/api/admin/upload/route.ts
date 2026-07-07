import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Not an image' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'png';
  const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  );

  const arrayBuffer = await file.arrayBuffer();
  const { error } = await supabase.storage
    .from('images')
    .upload(filename, arrayBuffer, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from('images').getPublicUrl(filename);
  return NextResponse.json({ url: data.publicUrl });
}

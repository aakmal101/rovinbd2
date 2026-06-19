import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Not an image' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'png';
  const name = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'Image storage not configured. Set BLOB_READ_WRITE_TOKEN (Vercel Blob).' },
      { status: 500 },
    );
  }

  const blob = await put(name, file, { access: 'public', addRandomSuffix: false });
  return NextResponse.json({ url: blob.url });
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Not an image' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeExt = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext) ? ext : 'png';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  if (!token || !repo) {
    return NextResponse.json(
      { error: 'Image storage not configured. Set GITHUB_TOKEN and GITHUB_REPO.' },
      { status: 500 },
    );
  }

  const content = Buffer.from(await file.arrayBuffer()).toString('base64');
  const res = await fetch(`https://api.github.com/repos/${repo}/contents/public/uploads/${filename}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: `Add uploaded image ${filename}`,
      content,
      branch,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: `GitHub commit failed (${res.status}): ${detail}` }, { status: 502 });
  }

  // Committed to the repo — Vercel's Git auto-deploy will publish it live in ~1-2 min.
  return NextResponse.json({ url: `/uploads/${filename}`, pending: true });
}

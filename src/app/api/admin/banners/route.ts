import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const b = await db.createBanner({
    title: body.title, subtitle: body.subtitle,
    ctaText: body.ctaText, ctaLink: body.ctaLink,
    image: body.image || '/placeholder.svg',
    active: !!body.active, order: Number(body.order) || 1,
  });
  return NextResponse.json(b);
}

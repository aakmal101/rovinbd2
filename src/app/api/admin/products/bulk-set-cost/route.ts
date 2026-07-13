import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const cost = Number(body.cost);
  if (!Number.isFinite(cost) || cost < 0) return NextResponse.json({ error: 'Invalid cost' }, { status: 400 });
  const updated = await db.setAllProductCosts(cost);
  return NextResponse.json({ updated });
}

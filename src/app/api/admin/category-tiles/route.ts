import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const tile = await db.createCategoryTile({
    kind: body.kind || 'product',
    label: body.label || '',
    sublabel: body.sublabel || '',
    link: body.link || '/shop',
    image: body.image || '/placeholder.svg',
    bgColor: body.bgColor || '#e7e5e4',
    order: body.order,
  });
  return NextResponse.json(tile);
}

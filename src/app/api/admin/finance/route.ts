import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { computeFinance } from '@/lib/finance';

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = Number(searchParams.get('from')) || 0;
  const to = Number(searchParams.get('to')) || Infinity;

  const [allOrders, products, content] = await Promise.all([
    db.listOrders(),
    db.listProducts(),
    db.getContent(),
  ]);

  return NextResponse.json(computeFinance(allOrders, products, content, from, to));
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { parsePathaoDeliveryRows } from '@/lib/pathaoCsv';

export const maxDuration = 60;

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const csvText = typeof body.csv === 'string' ? body.csv : '';
  if (!csvText.trim()) return NextResponse.json({ error: 'No CSV content provided' }, { status: 400 });

  const rows = parsePathaoDeliveryRows(csvText);
  if (rows.length === 0) {
    return NextResponse.json({ error: 'No delivery rows found — check this is a Pathao deliveries export' }, { status: 400 });
  }

  let feeUpdated = 0;
  let statusUpdated = 0;
  const unmatched: string[] = [];

  for (const row of rows) {
    const order = await db.findOrderByNumberOrConsignment(row.merchantOrderId);
    if (!order) {
      unmatched.push(row.merchantOrderId);
      continue;
    }
    if (order.pathaoDeliveryFee !== row.totalFee) {
      await db.updateOrderDeliveryFee(order.id, row.totalFee);
      feeUpdated++;
    }
    if (row.mappedStatus && row.mappedStatus !== order.status) {
      await db.updateOrderStatus(order.id, row.mappedStatus);
      statusUpdated++;
    }
  }

  return NextResponse.json({
    rowsInCsv: rows.length,
    feeUpdated,
    statusUpdated,
    unmatched,
  });
}

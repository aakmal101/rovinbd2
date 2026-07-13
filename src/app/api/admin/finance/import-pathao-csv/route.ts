import { NextResponse } from 'next/server';
import { db, type Order } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { parsePathaoDeliveryRows, normalizePhone } from '@/lib/pathaoCsv';

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

  const allOrders = await db.listOrders();
  const usedOrderIds = new Set<string>();

  let feeUpdated = 0;
  let statusUpdated = 0;
  let linkedByPhone = 0;
  const unmatched: string[] = [];
  const ambiguous: string[] = [];

  // Pass 1: rows that carry Pathao's merchant_order_id (our order number)
  const withId = rows.filter((r) => r.merchantOrderId != null);
  for (const row of withId) {
    const order = await db.findOrderByNumberOrConsignment(row.merchantOrderId!);
    if (!order) {
      unmatched.push(`#${row.merchantOrderId} (${row.consignmentId})`);
      continue;
    }
    usedOrderIds.add(order.id);
    if (order.pathaoDeliveryFee !== row.totalFee) {
      await db.updateOrderDeliveryFee(order.id, row.totalFee);
      feeUpdated++;
    }
    if (row.mappedStatus && row.mappedStatus !== order.status) {
      await db.updateOrderStatus(order.id, row.mappedStatus);
      statusUpdated++;
    }
  }

  // Pass 2: pre-API deliveries with no merchant_order_id — match by phone (+ amount to disambiguate)
  const withoutId = rows.filter((r) => r.merchantOrderId == null);
  const unlinkedByPhone = new Map<string, Order[]>();
  for (const o of allOrders) {
    if (o.pathaoConsignmentId || usedOrderIds.has(o.id)) continue;
    const key = normalizePhone(o.customerPhone);
    if (!unlinkedByPhone.has(key)) unlinkedByPhone.set(key, []);
    unlinkedByPhone.get(key)!.push(o);
  }

  for (const row of withoutId) {
    const key = normalizePhone(row.recipientPhone);
    const candidates = (unlinkedByPhone.get(key) || []).filter((o) => !usedOrderIds.has(o.id));

    let match: Order | undefined;
    if (candidates.length === 1) {
      match = candidates[0];
    } else if (candidates.length > 1) {
      const byAmount = candidates.filter((o) => o.total === row.collectableAmount);
      if (byAmount.length === 1) match = byAmount[0];
    }

    if (!match) {
      if (candidates.length > 1) ambiguous.push(`${row.recipientName} / ${row.recipientPhone} (${row.consignmentId}) — ${candidates.length} possible orders`);
      else unmatched.push(`${row.recipientName} / ${row.recipientPhone} (${row.consignmentId}, no phone match)`);
      continue;
    }

    usedOrderIds.add(match.id);
    await db.updateOrderPathaoConsignment(match.id, row.consignmentId, row.totalFee);
    linkedByPhone++;
    if (row.mappedStatus && row.mappedStatus !== match.status) {
      await db.updateOrderStatus(match.id, row.mappedStatus);
      statusUpdated++;
    }
  }

  return NextResponse.json({
    rowsInCsv: rows.length,
    feeUpdated,
    statusUpdated,
    linkedByPhone,
    unmatched,
    ambiguous,
  });
}

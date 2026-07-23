import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sql } from '@/lib/pg';

// One-off repair: the order_number_seq got out of sync with the actual max
// order_number in the table (likely a DB restore/branch reset), so it started
// re-issuing numbers already in use. This realigns the sequence to be safely
// past the current max, then renumbers every duplicate except the
// chronologically-first order in each group (Pathao consignments already
// created reference the old number in merchant_order_id, but we only use that
// at creation time — pathaoConsignmentId is the durable link — so renumbering
// is safe going forward).
export async function POST() {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await db.listOrders();
  const byNumber = new Map<number, typeof orders>();
  for (const o of orders) {
    if (!byNumber.has(o.orderNumber)) byNumber.set(o.orderNumber, []);
    byNumber.get(o.orderNumber)!.push(o);
  }

  const dupGroups = [...byNumber.entries()].filter(([, list]) => list.length > 1);
  if (dupGroups.length === 0) return NextResponse.json({ renumbered: [], message: 'No duplicates found' });

  // Realign the sequence above the current max order_number.
  const maxNumber = Math.max(...orders.map((o) => o.orderNumber));
  await sql`SELECT setval('order_number_seq', ${maxNumber})`;

  const renumbered: { orderId: string; customerName: string; oldNumber: number; newNumber: number }[] = [];

  for (const [, group] of dupGroups) {
    const sorted = [...group].sort((a, b) => a.createdAt - b.createdAt);
    // Keep the earliest as-is; renumber the rest.
    for (const order of sorted.slice(1)) {
      const { rows } = await sql`SELECT nextval('order_number_seq') AS n`;
      const newNumber = Number(rows[0].n);
      await sql`UPDATE orders SET order_number = ${newNumber} WHERE id = ${order.id}`;
      renumbered.push({ orderId: order.id, customerName: order.customerName, oldNumber: order.orderNumber, newNumber });
    }
  }

  return NextResponse.json({ renumbered });
}

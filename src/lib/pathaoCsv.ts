import type { Order } from './db';

// Minimal RFC4180-ish CSV parser — handles quoted fields containing commas,
// newlines, and escaped ("") quotes, which Pathao's export relies on.
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const DELIVERED_STATUSES = new Set(['Delivered', 'Partial Delivery']);
const RETURNED_STATUSES = new Set(['Return', 'Paid Return', 'Cancelled', 'Exchange']);

export type PathaoCsvRow = {
  merchantOrderId: string;
  totalFee: number;
  orderStatus: string;
  mappedStatus: Order['status'] | null;
};

export function parsePathaoDeliveryRows(csvText: string): PathaoCsvRow[] {
  const table = parseCsv(csvText);
  if (table.length === 0) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iMerchantOrderId = idx('merchant order id');
  const iTotalFee = idx('total fee');
  const iOrderStatus = idx('order status');
  const iOrderType = idx('order type');

  if (iMerchantOrderId === -1 || iTotalFee === -1 || iOrderStatus === -1 || iOrderType === -1) return [];

  const out: PathaoCsvRow[] = [];
  for (const r of table.slice(1)) {
    const orderType = (r[iOrderType] || '').trim();
    if (orderType !== 'Delivery') continue; // skip reverse-logistics rows, they carry no merchant order id

    const rawId = (r[iMerchantOrderId] || '').trim().replace(/^"+|"+$/g, '');
    if (!rawId || rawId.toUpperCase() === 'N/A') continue;

    const totalFee = Number(r[iTotalFee]);
    const orderStatus = (r[iOrderStatus] || '').trim();
    const mappedStatus: Order['status'] | null = DELIVERED_STATUSES.has(orderStatus)
      ? 'received'
      : RETURNED_STATUSES.has(orderStatus)
        ? 'returned'
        : orderStatus
          ? 'dispatched'
          : null;

    out.push({ merchantOrderId: rawId, totalFee: Number.isFinite(totalFee) ? totalFee : 0, orderStatus, mappedStatus });
  }
  return out;
}

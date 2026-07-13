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
  consignmentId: string;
  merchantOrderId: string | null; // null when Pathao has no merchant_order_id (pre-API orders)
  recipientName: string;
  recipientPhone: string;
  collectableAmount: number;
  collectedAmount: number;
  totalFee: number;
  orderStatus: string;
  mappedStatus: Order['status'] | null;
};

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10); // last 10 digits — tolerant of +880/leading-0 formatting differences
}

function mapStatus(orderStatus: string): Order['status'] | null {
  if (DELIVERED_STATUSES.has(orderStatus)) return 'received';
  if (RETURNED_STATUSES.has(orderStatus)) return 'returned';
  return orderStatus ? 'dispatched' : null;
}

export function parsePathaoDeliveryRows(csvText: string): PathaoCsvRow[] {
  const table = parseCsv(csvText);
  if (table.length === 0) return [];
  const header = table[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);

  const iConsignmentId = idx('order consignment id');
  const iMerchantOrderId = idx('merchant order id');
  const iRecipientName = idx('recipient name');
  const iRecipientPhone = idx('recipient phone');
  const iCollectableAmount = idx('collectable amount');
  const iCollectedAmount = idx('collected amount');
  const iTotalFee = idx('total fee');
  const iOrderStatus = idx('order status');
  const iOrderType = idx('order type');

  if (iMerchantOrderId === -1 || iTotalFee === -1 || iOrderStatus === -1 || iOrderType === -1) return [];

  const out: PathaoCsvRow[] = [];
  for (const r of table.slice(1)) {
    const orderType = (r[iOrderType] || '').trim();
    if (orderType !== 'Delivery') continue; // skip reverse-logistics rows

    const rawId = (r[iMerchantOrderId] || '').trim().replace(/^"+|"+$/g, '');
    const merchantOrderId = rawId && rawId.toUpperCase() !== 'N/A' ? rawId : null;

    const totalFee = Number(r[iTotalFee]);
    const collectableAmount = Number(r[iCollectableAmount]);
    const collectedAmount = Number(r[iCollectedAmount]);
    const orderStatus = (r[iOrderStatus] || '').trim();

    out.push({
      consignmentId: (r[iConsignmentId] || '').trim(),
      merchantOrderId,
      recipientName: (r[iRecipientName] || '').trim(),
      recipientPhone: (r[iRecipientPhone] || '').trim(),
      collectableAmount: Number.isFinite(collectableAmount) ? collectableAmount : 0,
      collectedAmount: Number.isFinite(collectedAmount) ? collectedAmount : 0,
      totalFee: Number.isFinite(totalFee) ? totalFee : 0,
      orderStatus,
      mappedStatus: mapStatus(orderStatus),
    });
  }
  return out;
}

import type { Customer } from './db';

export type Segment = 'all' | 'vip' | 'new' | 'at_risk' | 'repeat';

export const SEGMENT_LABELS: Record<Segment, string> = {
  all: 'All',
  vip: 'VIP',
  new: 'New',
  at_risk: 'At Risk',
  repeat: 'Repeat',
};

const DAY = 24 * 60 * 60 * 1000;

export function classify(c: Customer, now: number = Date.now()): Exclude<Segment, 'all'> {
  if (c.orderCount >= 3 || c.totalSpent >= 5000) return 'vip';
  if (now - c.lastOrderAt > 60 * DAY) return 'at_risk';
  if (c.orderCount === 1 && now - c.lastOrderAt < 7 * DAY) return 'new';
  if (c.orderCount >= 2) return 'repeat';
  return 'new';
}

export function inSegment(c: Customer, segment: Segment, now: number = Date.now()): boolean {
  if (segment === 'all') return true;
  return classify(c, now) === segment;
}

export function filterBySegment(customers: Customer[], segment: Segment): Customer[] {
  if (segment === 'all') return customers;
  const now = Date.now();
  return customers.filter((c) => inSegment(c, segment, now));
}

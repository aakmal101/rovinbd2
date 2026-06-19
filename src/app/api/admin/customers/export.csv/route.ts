import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sha256, normalizePhoneBD } from '@/lib/hash';
import { filterBySegment, type Segment } from '@/lib/segments';
import { cityToDivision } from '@/lib/bd-divisions';

const COLUMNS = ['email', 'phone', 'fn', 'ln', 'ct', 'st', 'country', 'external_id'] as const;

function csvEscape(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const seg = (url.searchParams.get('segment') || 'all') as Segment;
  const allowed: Segment[] = ['all', 'vip', 'new', 'at_risk', 'repeat'];
  const segment: Segment = allowed.includes(seg) ? seg : 'all';

  const customers = filterBySegment(await db.listCustomers(), segment);

  const lines: string[] = [COLUMNS.join(',')];
  for (const c of customers) {
    const [firstName, ...rest] = String(c.name).trim().split(/\s+/);
    const lastName = rest.join(' ');
    const state = c.city ? cityToDivision(c.city) || '' : '';
    const row = [
      c.email ? sha256(c.email) : '',
      c.phone ? sha256(normalizePhoneBD(c.phone)) : '',
      firstName ? sha256(firstName) : '',
      lastName ? sha256(lastName) : '',
      c.city ? sha256(c.city.replace(/\s/g, '')) : '',
      state ? sha256(state) : '',
      sha256('bd'),
      sha256(c.id),
    ];
    lines.push(row.map(csvEscape).join(','));
  }

  const csv = lines.join('\n');
  const filename = `rovinbd-customers-${segment}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendSMS, smsConfigured } from '@/lib/sms';
import { filterBySegment, type Segment } from '@/lib/segments';

type Body = {
  message: string;
  segment: Segment;
  testPhone?: string; // optional: send only to this one number, ignore segment
  dryRun?: boolean;
};

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!smsConfigured()) return NextResponse.json({ error: 'SMS not configured. Set ALPHA_SMS_API_KEY env var.' }, { status: 400 });

  const body = (await req.json()) as Body;
  const message = (body.message || '').trim();
  if (!message) return NextResponse.json({ error: 'Empty message' }, { status: 400 });

  // Build recipient list
  let recipients: { id?: string; phone: string }[] = [];
  if (body.testPhone) {
    recipients = [{ phone: body.testPhone }];
  } else {
    const segment: Segment = body.segment || 'all';
    const customers = filterBySegment(await db.listCustomers(), segment);
    recipients = customers.filter((c) => c.phone).map((c) => ({ id: c.id, phone: c.phone }));
  }

  if (body.dryRun) return NextResponse.json({ count: recipients.length });

  let sent = 0, failed = 0;
  const errors: string[] = [];

  // Send in small parallel batches to respect rate limits
  const BATCH = 5;
  for (let i = 0; i < recipients.length; i += BATCH) {
    const chunk = recipients.slice(i, i + BATCH);
    await Promise.all(chunk.map(async (r) => {
      const result = await sendSMS(r.phone, message);
      if (result.ok) {
        sent++;
        await db.logSms({ customerId: r.id, phone: r.phone, message, status: 'sent' });
      } else {
        failed++;
        if (errors.length < 5) errors.push(`${r.phone}: ${result.error}`);
        await db.logSms({ customerId: r.id, phone: r.phone, message, status: 'failed', error: result.error });
      }
    }));
  }

  return NextResponse.json({ sent, failed, total: recipients.length, errors });
}

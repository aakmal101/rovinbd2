import { normalizePhoneBD } from './hash';

// Alpha SMS (sms.bd / api.sms.net.bd) — Bangladesh bulk SMS provider.
// Docs: https://sms.bd/api
const API_KEY = process.env.ALPHA_SMS_API_KEY || '';
const SENDER_ID = process.env.ALPHA_SMS_SENDER_ID || ''; // optional masking name e.g. "ROVIN" (requires approval)
const ENDPOINT = 'https://api.sms.net.bd/sendsms';

export type SmsResult = { ok: true; messageId?: string } | { ok: false; error: string };

export async function sendSMS(phone: string, message: string): Promise<SmsResult> {
  if (!API_KEY) {
    return { ok: false, error: 'Alpha SMS not configured (ALPHA_SMS_API_KEY missing)' };
  }
  const to = normalizePhoneBD(phone);
  if (!to || to.length < 10) return { ok: false, error: 'Invalid phone number' };

  try {
    const params = new URLSearchParams();
    params.set('api_key', API_KEY);
    params.set('msg', message);
    params.set('to', to);
    if (SENDER_ID) params.set('sender_id', SENDER_ID);

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data: unknown = await res.json().catch(() => ({}));
    const d = (data || {}) as Record<string, unknown>;
    // Alpha SMS: error === 0 indicates success.
    const ok = res.ok && Number(d.error) === 0;
    if (!ok) {
      const msg = typeof d.msg === 'string' ? d.msg : `HTTP ${res.status}`;
      return { ok: false, error: msg };
    }
    const reqId = (d.data as Record<string, unknown> | undefined)?.request_id;
    return { ok: true, messageId: reqId != null ? String(reqId) : undefined };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function smsConfigured(): boolean {
  return !!API_KEY;
}

// Returns account balance in BDT, or null if unavailable.
export async function smsBalance(): Promise<number | null> {
  if (!API_KEY) return null;
  try {
    const res = await fetch(`https://api.sms.net.bd/user/balance/?api_key=${encodeURIComponent(API_KEY)}`);
    const data: unknown = await res.json().catch(() => ({}));
    const d = (data || {}) as Record<string, unknown>;
    if (Number(d.error) !== 0) return null;
    const bal = (d.data as Record<string, unknown> | undefined)?.balance;
    return bal != null ? Number(bal) : null;
  } catch {
    return null;
  }
}

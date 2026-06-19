import crypto from 'crypto';

// SHA-256 with Meta's normalization (lowercase, trim).
// Used for hashing PII before sending to Meta CAPI / Custom Audiences.
export function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

// Phone normalization: digits only. For BD numbers, strip leading 0 / + and prefix 880 if missing.
export function normalizePhoneBD(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('880')) return digits;
  if (digits.startsWith('0')) return '880' + digits.slice(1);
  if (digits.length === 10) return '880' + digits;
  return digits;
}

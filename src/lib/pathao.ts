// Pathao Courier Merchant API integration

const BASE_URL =
  process.env.PATHAO_ENVIRONMENT === 'sandbox'
    ? 'https://hermes-staging.pathao.com'
    : 'https://api-hermes.pathao.com';

const CLIENT_ID = process.env.PATHAO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.PATHAO_CLIENT_SECRET || '';
const USERNAME = process.env.PATHAO_USERNAME || '';
const PASSWORD = process.env.PATHAO_PASSWORD || '';
export const PATHAO_STORE_ID = process.env.PATHAO_STORE_ID || '';

// In-memory token cache (per server instance)
let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.accessToken;
  }

  const res = await fetch(`${BASE_URL}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: USERNAME,
      password: PASSWORD,
      grant_type: 'password',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pathao auth failed (${res.status}): ${text}`);
  }

  const data = await res.json();
  const expiresIn: number = data.expires_in || 3600;
  cachedToken = { accessToken: data.access_token, expiresAt: Date.now() + expiresIn * 1000 };
  return cachedToken.accessToken;
}

export type PathaoOrderInput = {
  merchantOrderId: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  amountToCollect: number;
  itemQuantity?: number;
  itemWeight?: number;
  specialInstruction?: string;
};

export type PathaoOrderResult =
  | { ok: true; consignmentId: string; deliveryFee?: number }
  | { ok: false; error: string };

export async function createPathaoOrder(input: PathaoOrderInput): Promise<PathaoOrderResult> {
  if (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD || !PATHAO_STORE_ID) {
    return { ok: false, error: 'Pathao credentials not configured' };
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}/aladdin/api/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        store_id: Number(PATHAO_STORE_ID),
        merchant_order_id: input.merchantOrderId,
        recipient_name: input.recipientName,
        recipient_phone: input.recipientPhone,
        recipient_address: input.recipientAddress,
        delivery_type: 48, // Normal delivery
        item_type: 2, // Parcel
        item_quantity: input.itemQuantity || 1,
        item_weight: input.itemWeight || 0.5,
        amount_to_collect: input.amountToCollect,
        special_instruction: input.specialInstruction || '',
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.message || JSON.stringify(data) };
    }

    const consignmentId: string = data?.data?.consignment_id || data?.consignment_id || '';
    if (!consignmentId) return { ok: false, error: 'No consignment_id in response' };
    const deliveryFee = Number(data?.data?.delivery_fee ?? data?.delivery_fee);
    return { ok: true, consignmentId, deliveryFee: Number.isFinite(deliveryFee) ? deliveryFee : undefined };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export type PathaoOrderInfo =
  | { ok: true; statusSlug: string }
  | { ok: false; error: string };

// Pathao's Get Order Short Info endpoint — no fee data, but gives live
// delivery status (e.g. "Delivered", "Return", "Cancelled") for an order
// that was already created via createPathaoOrder.
export async function getPathaoOrderInfo(consignmentId: string): Promise<PathaoOrderInfo> {
  if (!CLIENT_ID || !CLIENT_SECRET || !USERNAME || !PASSWORD) {
    return { ok: false, error: 'Pathao credentials not configured' };
  }
  try {
    const token = await getAccessToken();
    const res = await fetch(`${BASE_URL}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}/info`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message || JSON.stringify(data) };
    const statusSlug: string = data?.data?.order_status_slug || data?.data?.order_status || '';
    if (!statusSlug) return { ok: false, error: 'No status in response' };
    return { ok: true, statusSlug };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

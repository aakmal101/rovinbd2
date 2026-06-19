import { db } from '@/lib/db';
import BroadcastForm from './BroadcastForm';

export default async function BroadcastPage() {
  const customers = await db.listCustomers();
  const smsReady = !!process.env.ALPHA_SMS_API_KEY;
  return <BroadcastForm customers={customers} smsReady={smsReady} />;
}

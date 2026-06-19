import { db } from '@/lib/db';
import CustomersView from './CustomersView';

export default async function CustomersAdmin() {
  const customers = await db.listCustomers();
  return <CustomersView customers={customers} />;
}

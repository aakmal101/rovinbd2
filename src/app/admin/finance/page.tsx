import { db } from '@/lib/db';
import { computeFinance } from '@/lib/finance';
import FinanceView from './FinanceView';

export default async function FinancePage() {
  const [allOrders, products, content] = await Promise.all([
    db.listOrders(),
    db.listProducts(),
    db.getContent(),
  ]);
  const initial = computeFinance(allOrders, products, content);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Finance</h1>
      <p className="text-stone-600 mt-1">Profit &amp; loss, including delivery and return costs from Pathao.</p>
      <FinanceView initial={initial} />
    </div>
  );
}

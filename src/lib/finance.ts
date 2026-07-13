import type { Order, Product, SiteContent } from './db';

export type FinanceOrderRow = {
  id: string;
  orderNumber: number;
  customerName: string;
  status: Order['status'];
  total: number;
  cogs: number;
  deliveryFee: number;
  deliveryFeeIsEstimate: boolean;
  deliveryProfit: number;
  pathaoConsignmentId: string | null;
  createdAt: number;
};

export type FinanceSummary = {
  revenue: number;
  cogs: number;
  deliveryCost: number;
  deliveryProfit: number;
  returnCost: number;
  netProfit: number;
  deliveredCount: number;
  returnedCount: number;
  pendingCount: number;
  pendingValue: number;
  returnFeePerOrder: number;
};

export function computeFinance(
  allOrders: Order[],
  products: Product[],
  content: SiteContent,
  from = 0,
  to = Infinity,
): { summary: FinanceSummary; orders: FinanceOrderRow[] } {
  const costByProduct = new Map(products.map((p) => [p.id, p.cost || 0]));
  const orders = allOrders.filter((o) => o.createdAt >= from && o.createdAt <= to);

  let revenue = 0;
  let cogs = 0;
  let deliveryCost = 0;
  let deliveryProfit = 0;
  let returnCost = 0;
  let deliveredCount = 0;
  let returnedCount = 0;
  let pendingCount = 0;
  let pendingValue = 0;

  const rows: FinanceOrderRow[] = orders.map((o) => {
    const itemCost = o.items.reduce((s, i) => s + i.qty * (costByProduct.get(i.productId) || 0), 0);
    const deliveryFee = o.pathaoDeliveryFee ?? o.shipping;
    // Profit on delivery: what the customer was charged for shipping minus what
    // Pathao actually billed. Only meaningful once the real fee is known —
    // while it's still an estimate (deliveryFee === o.shipping) this is 0.
    const rowDeliveryProfit = o.pathaoDeliveryFee != null ? o.shipping - o.pathaoDeliveryFee : 0;

    if (o.status === 'received') {
      deliveredCount++;
      revenue += o.total;
      cogs += itemCost;
      deliveryCost += deliveryFee;
      deliveryProfit += rowDeliveryProfit;
    } else if (o.status === 'returned') {
      returnedCount++;
      deliveryCost += deliveryFee;
      returnCost += content.returnFee;
    } else {
      pendingCount++;
      pendingValue += o.total;
    }

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      status: o.status,
      total: o.total,
      cogs: itemCost,
      deliveryFee,
      deliveryFeeIsEstimate: o.pathaoDeliveryFee == null,
      deliveryProfit: rowDeliveryProfit,
      pathaoConsignmentId: o.pathaoConsignmentId || null,
      createdAt: o.createdAt,
    };
  });

  const netProfit = revenue - cogs - deliveryCost - returnCost;

  return {
    summary: {
      revenue, cogs, deliveryCost, deliveryProfit, returnCost, netProfit,
      deliveredCount, returnedCount, pendingCount, pendingValue,
      returnFeePerOrder: content.returnFee,
    },
    orders: rows.sort((a, b) => b.createdAt - a.createdAt),
  };
}

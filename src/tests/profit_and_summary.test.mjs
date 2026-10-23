import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeSummaryFromData } from '../EasyOverview.tsx';

test('computeSummaryFromData correctly attributes orders with payments in period', () => {
  const mockData = {
    menu: [
      { id: 1, name: 'Biryani', variants: [{ id: 101, name: 'Full', price: 50000, cost: 25000 }] },
    ],
    orders: [
      {
        id: 1,
        number: 'INV-000001',
        business_date: '2026-10-15', // Older order
        created: '2026-10-15T10:00:00.000Z',
        state: 'closed',
        total: 50000,
        subtotal: 50000,
        discount: 0,
        items: [{ variantId: 101, name: 'Biryani', qty: 1000, price: 50000, cost: 25000 }],
        payments: [
          {
            id: 10,
            amount: 50000,
            business_date: '2026-10-19', // Paid today
            created: '2026-10-19T06:00:00.000Z',
          }
        ]
      }
    ],
    expenses: [
      {
        id: 1,
        category: 'Utilities',
        amount: 5000,
        businessDate: '2026-10-19',
        created: '2026-10-19T07:00:00.000Z'
      }
    ]
  };

  const summary = computeSummaryFromData(mockData, '2026-10-19', '2026-10-19');
  assert.ok(summary, 'Summary should be returned');
  assert.equal(summary.orderCount, 1, 'Should find 1 active order paid today');
  assert.equal(summary.netSales, 50000, 'Net sales should be 500.00 PKR (50000 paise)');
  assert.equal(summary.foodCost, 25000, 'Food cost should be 250.00 PKR (25000 paise)');
  assert.equal(summary.expenses, 5000, 'Expenses should be 50.00 PKR (5000 paise)');
  assert.equal(summary.profit, 20000, 'Profit should be 200.00 PKR (50000 - 25000 - 5000)');
  assert.equal(summary.collections, 50000, 'Collections should be 50000 paise');
});

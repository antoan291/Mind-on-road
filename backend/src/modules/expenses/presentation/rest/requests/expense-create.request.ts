import { z } from 'zod';

export const expenseCreateRequestSchema = z.object({
  type: z.enum(['expense', 'friend-vat-expense']),
  title: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(100),
  amount: z.coerce.number().int().min(0).max(10_000_000),
  vatAmount: z.coerce.number().int().min(0).max(10_000_000).default(0),
  paymentMethod: z.string().trim().min(1).max(50),
  source: z.string().trim().min(1).max(200),
  counterparty: z.string().trim().min(1).max(200),
  note: z.string().trim().min(1).max(1000),
  status: z.enum(['success', 'warning', 'error']).default('warning'),
  affectsOperationalExpense: z.coerce.boolean().default(true),
  date: z.string().date()
});

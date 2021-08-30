import fetch from 'node-fetch';
import { z } from 'zod';
import * as qs from 'query-string';

const repaymentSchema = z.object({
  from: z.number(),
  to: z.number(),
  amount: z
    .string()
    .refine((str) => !isNaN(Number(str)), {
      message: 'String must parse to number',
    })
    .transform((str) => Number(str)),
});

const splitwiseExpenseSchema = z.object({
  id: z.number(),
  group_id: z.number(),
  description: z.string(),
  payment: z.boolean(),
  cost: z.string(),
  repayments: z.array(repaymentSchema),
  date: z
    .string()
    .refine((str) => !isNaN(Date.parse(str)), {
      message: 'String must parse to Date',
    })
    .transform((str) => new Date(str)),
  created_at: z
    .string()
    .refine((str) => !isNaN(Date.parse(str)), {
      message: 'String must parse to Date',
    })
    .transform((str) => new Date(str)),
  updated_at: z.union([
    z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'String must parse to Date',
      })
      .transform((str) => new Date(str)),
    z.null(),
  ]),
  deleted_at: z.union([
    z
      .string()
      .refine((str) => !isNaN(Date.parse(str)), {
        message: 'String must parse to Date',
      })
      .transform((str) => new Date(str)),
    z.null(),
  ]),
});

export type SplitwiseExpense = z.infer<typeof splitwiseExpenseSchema>;

const getExpenseByIdResponseSchema = z.object({
  expense: splitwiseExpenseSchema,
});

const getExpensesResponseSchema = z.object({
  expenses: z.array(splitwiseExpenseSchema),
});

export type GetExpenseByIdResponse = z.infer<
  typeof getExpenseByIdResponseSchema
>;

export interface Splitwise {
  getExpenses(datedAfter?: Date): Promise<SplitwiseExpense[]>;
  getExpenseById(id: string): Promise<SplitwiseExpense>;
}

const SPLITWISE_API_URL = `https://secure.splitwise.com/api/v3.0`;
class SplitwiseClient implements Splitwise {
  constructor(
    private readonly apiKey: string,
    private readonly groupId: string,
  ) {}

  async getExpenses(datedAfter?: Date): Promise<SplitwiseExpense[]> {
    const query = qs.stringify({
      group_id: this.groupId,
      dated_after: datedAfter,
    });
    const response = await fetch(`${SPLITWISE_API_URL}/get_expenses?${query}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    }).then((res) => res.json());

    return getExpensesResponseSchema.parse(response).expenses;
  }
  async getExpenseById(id: string): Promise<SplitwiseExpense> {
    const response = await fetch(`${SPLITWISE_API_URL}/get_expense/${id}`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    }).then((res) => res.json());

    return getExpenseByIdResponseSchema.parse(response).expense;
  }
}

export default SplitwiseClient;

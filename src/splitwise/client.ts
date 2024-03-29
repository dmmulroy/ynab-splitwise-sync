import fetch from 'node-fetch';
import { z } from 'zod';
import * as qs from 'query-string';
import { dollarsToCents } from '../currency/conversions';

const stringNumber = z
  .string()
  .refine((str) => !isNaN(Number(str)), {
    message: 'String must parse to number',
  })
  .transform((str) => Number(str));

const stringDate = z
  .string()
  .refine((str) => !isNaN(Date.parse(str)), {
    message: 'String must parse to Date',
  })
  .transform((str) => new Date(str));

const repaymentSchema = z.object({
  from: z.number(),
  to: z.number(),
  amount: stringNumber,
});

const userSchema = z.object({
  user_id: z.number(),
  paid_share: stringNumber,
  owed_share: stringNumber,
});

const splitwiseExpenseSchema = z.object({
  id: z.number(),
  group_id: z.number(),
  description: z.string(),
  payment: z.boolean(),
  cost: z.string(),
  repayments: z.array(repaymentSchema),
  updated_by: z.object({ id: z.number() }).nullable(),
  date: stringDate,
  created_at: stringDate,
  updated_at: stringDate,
  deleted_at: z.union([stringDate, z.null()]),
  users: z.array(userSchema),
});

export type SplitwiseExpense = z.infer<typeof splitwiseExpenseSchema>;

const splitwiseApiErrorSchema = z
  .object({
    error: z.string().optional(),
    errors: z
      .object({
        base: z.array(z.string()),
      })
      .optional(),
  })
  .refine((input) => !input.error || !input.errors, {
    message: 'Unknown error response from Splitwise',
  })
  .transform((input) => {
    return input.error ? [input.error] : input.errors!.base;
  });

const getExpenseByIdResponseSchema = z.object({
  expense: splitwiseExpenseSchema,
});

const getExpensesResponseSchema = z.object({
  expenses: z.array(splitwiseExpenseSchema),
});

const createExpenseResponseSchema = z.object({
  expenses: z.array(splitwiseExpenseSchema).nonempty(),
});

export type GetExpenseByIdResponse = z.infer<
  typeof getExpenseByIdResponseSchema
>;

export interface CreateExpenseParams {
  cost: number;
  description: string;
  date?: Date;
}

export interface Splitwise {
  getExpenses(updatedAfter?: Date): Promise<SplitwiseExpense[]>;
  getExpenseById(id: number): Promise<SplitwiseExpense>;
  createExpense(expenseParams: CreateExpenseParams): Promise<SplitwiseExpense>;
  deleteExpense(id: number): Promise<{ success: boolean }>;
  getExpenseAmountForUser(expense: SplitwiseExpense): number;
}

export interface SplitwiseClientConfig {
  apiKey: string;
  groupId: number;
  userId: number;
}

const SPLITWISE_API_URL = `https://secure.splitwise.com/api/v3.0`;

class SplitwiseClient implements Splitwise {
  private readonly apiKey: string;
  private readonly groupId: number;
  private readonly userId: number;

  constructor({ apiKey, groupId, userId }: SplitwiseClientConfig) {
    this.apiKey = apiKey;
    this.groupId = groupId;
    this.userId = userId;
  }

  async getExpenses(updatedAfter?: Date): Promise<SplitwiseExpense[]> {
    try {
      const query = qs.stringify({
        group_id: this.groupId,
        updated_after: updatedAfter?.toISOString(),
      });

      const response = await fetch(
        `${SPLITWISE_API_URL}/get_expenses?${query}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();

        const errors = splitwiseApiErrorSchema.parse(data);

        throw new Error(errors.join(' | '));
      }

      const data = await response.json();

      return getExpensesResponseSchema.parse(data).expenses;
    } catch (error) {
      throw new Error(`Splitwise Error: ${(error as Error).message}`);
    }
  }

  async getExpenseById(id: number): Promise<SplitwiseExpense> {
    try {
      const response = await fetch(`${SPLITWISE_API_URL}/get_expense/${id}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();

        const errors = splitwiseApiErrorSchema.parse(data);

        throw new Error(errors.join(' | '));
      }
      const data = await response.json();

      return getExpenseByIdResponseSchema.parse(data).expense;
    } catch (error) {
      throw new Error(`Splitwise Error: ${(error as Error).message}`);
    }
  }

  async createExpense({
    cost,
    description,
    date,
  }: CreateExpenseParams): Promise<SplitwiseExpense> {
    try {
      const response = await fetch(`${SPLITWISE_API_URL}/create_expense`, {
        method: 'post',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_id: this.groupId,
          cost: cost.toString(),
          description,
          date,
          split_equally: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        const errors = splitwiseApiErrorSchema.parse(data);
        throw new Error(errors.join(' | '));
      }

      const data = await response.json();

      return createExpenseResponseSchema.parse(data).expenses[0];
    } catch (error) {
      throw new Error(`Splitwise Error: ${(error as Error).message}`);
    }
  }

  async deleteExpense(id: number): Promise<{ success: boolean }> {
    try {
      const response = await fetch(
        `${SPLITWISE_API_URL}/delete_expense/${id}`,
        {
          method: 'post',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();

        const errors = splitwiseApiErrorSchema.parse(data);

        throw new Error(errors.join(' | '));
      }
      const data = await response.json();

      return z.object({ success: z.boolean() }).parse(data);
    } catch (error) {
      throw new Error(`Splitwise Error: ${(error as Error).message}`);
    }
  }

  getExpenseAmountForUser(expense: SplitwiseExpense): number {
    const userExpense = expense.users.find(
      ({ user_id }) => user_id === this.userId,
    );

    if (!userExpense) {
      return 0;
    }

    const { paid_share, owed_share } = userExpense;
    return dollarsToCents(paid_share - owed_share);
  }
}

export default SplitwiseClient;

import * as ynab from 'ynab';
import type { TransactionDetail } from 'ynab';
import { z } from 'zod';

const ynabErrorSchema = z.object({
  error: z.object({
    id: z.string(),
    name: z.string(),
    detail: z.string(),
  }),
});

export type YnabTransaction = TransactionDetail;

export type UpdateYnabTransaction = Pick<
  YnabTransaction,
  'id' | 'amount' | 'memo'
>;

export type CreateYnabTransaction = Pick<YnabTransaction, 'amount' | 'memo'> & {
  date: Date;
};

export interface Ynab {
  getTransactionById(id: string): Promise<YnabTransaction | null>;
  updateTransactions(
    transactions: UpdateYnabTransaction[],
  ): Promise<YnabTransaction[]>;
  createTransactions(
    transactions: CreateYnabTransaction[],
  ): Promise<YnabTransaction[]>;
  getBudgetId(): string;
  deleteTransactionById(id: string): Promise<boolean>;
}

export interface YnabClientConfig {
  apiKey: string;
  budgetId: string;
  splitwiseAccountId: string;
  uncategorizedCategoryId: string;
  payeeName?: string;
}

class YnabClient implements Ynab {
  private readonly apiKey: string;
  private readonly budgetId: string;
  private readonly splitwiseAccountId: string;
  private readonly uncategorizedCategoryId: string;
  private readonly payeeName?: string;
  private readonly ynab: ynab.API;

  constructor({
    apiKey,
    budgetId,
    splitwiseAccountId,
    payeeName,
    uncategorizedCategoryId,
  }: YnabClientConfig) {
    this.apiKey = apiKey;
    this.budgetId = budgetId;
    this.splitwiseAccountId = splitwiseAccountId;
    this.uncategorizedCategoryId = uncategorizedCategoryId;
    this.payeeName = payeeName;
    this.ynab = new ynab.API(this.apiKey);
  }

  async getTransactionById(id: string) {
    try {
      const { data } = await this.ynab.transactions.getTransactionById(
        this.budgetId,
        id,
      );
      return data.transaction;
    } catch (error) {
      const { error: ynabError } = ynabErrorSchema.parse(error);
      throw new Error(`YNAB Error: ${ynabError.detail}`);
    }
  }

  async updateTransactions(transactions: UpdateYnabTransaction[]) {
    if (transactions.length === 0) {
      return [];
    }

    try {
      const { data } = await this.ynab.transactions.updateTransactions(
        this.budgetId,
        {
          transactions: transactions.map((transaction) => ({
            ...transaction,
            account_id: this.splitwiseAccountId,
            date: new Date().toISOString(),
          })),
        },
      );

      return data.transactions ?? [];
    } catch (error) {
      const { error: ynabError } = ynabErrorSchema.parse(error);
      throw new Error(`YNAB Error: ${ynabError.detail}`);
    }
  }

  async createTransactions(
    transactions: CreateYnabTransaction[],
  ): Promise<YnabTransaction[]> {
    if (transactions.length === 0) {
      return [];
    }

    try {
      const { data } = await this.ynab.transactions.createTransactions(
        this.budgetId,
        {
          transactions: transactions.map(({ memo, amount, date }) => ({
            memo,
            amount,
            date: date.toISOString(),
            account_id: this.splitwiseAccountId,
            category_id: this.uncategorizedCategoryId,
            payee_name: this.payeeName,
          })),
        },
      );

      return data.transactions ?? [];
    } catch (error) {
      const { error: ynabError } = ynabErrorSchema.parse(error);
      throw new Error(`YNAB Error: ${ynabError.detail}`);
    }
  }

  getBudgetId(): string {
    return this.budgetId;
  }

  async deleteTransactionById(id: string): Promise<boolean> {
    try {
      const [deletedTransaction] = await this.updateTransactions([
        { id, amount: 0, memo: 'DELETED' },
      ]);

      return Boolean(deletedTransaction);
    } catch (error) {
      // Since we call this.updateTransactions there is a chance to alread throw
      // a YNAB Error.
      if (error?.message?.includes('YNAB Error:')) {
        throw error;
      }

      const { error: ynabError } = ynabErrorSchema.parse(error);
      throw new Error(`YNAB Error: ${ynabError.detail}`);
    }
  }
}

export default YnabClient;

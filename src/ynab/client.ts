import ynab, { TransactionDetail } from 'ynab';
import { z } from 'zod';

const ynabErrorSchema = z.object({
  error: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
  }),
});

export type YnabTransaction = TransactionDetail;

export type YnabTransactionUpdate = Pick<
  YnabTransaction,
  'id' | 'amount' | 'memo'
>;

export interface Ynab {
  getTransactionById(id: string): Promise<YnabTransaction | null>;
  updateTransactions(
    transactions: YnabTransactionUpdate[],
  ): Promise<YnabTransaction[]>;
}

export interface YnabClientConfig {
  apiKey: string;
  budgetId: string;
  splitwiseAccountId: string;
  uncategorizedCategoryId: string;
}

class YnabClient implements Ynab {
  private readonly apiKey: string;
  private readonly budgetId: string;
  private readonly splitwiseAccountId: string;
  private readonly uncategorizedCategoryId: string;
  private readonly ynab: ynab.API;

  constructor({
    apiKey,
    budgetId,
    splitwiseAccountId,
    uncategorizedCategoryId,
  }: YnabClientConfig) {
    this.apiKey = apiKey;
    this.budgetId = budgetId;
    this.splitwiseAccountId = splitwiseAccountId;
    this.uncategorizedCategoryId = uncategorizedCategoryId;
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
      throw new Error(`YNAB Error: ${ynabError.description}`);
    }
  }

  async updateTransactions(transactions: YnabTransactionUpdate[]) {
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
      throw new Error(`YNAB Error: ${ynabError.description}`);
    }
  }
}

export default YnabClient;

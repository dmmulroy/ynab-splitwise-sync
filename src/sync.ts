import SplitwiseClient from './splitwise/client';
import ynab from 'ynab';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './services/syncedTransactionService';
import initializeDatabase from './db/initialize';

export interface SyncConfig {
  splitwiseApiKey: string;
  splitwiseGroupId: number;
  splitwiseUserId: number;
  ynabApiKey: string;
  ynabBudgetId: string;
  databaseUrl: string;
}

export interface Syncer {
  sync: () => Promise<void>;
}

class Sync implements Syncer {
  private readonly splitwise: SplitwiseClient;
  private readonly ynab: ynab.API;
  private readonly syncedTransactionService: ISyncedTransactionService;

  constructor({
    splitwiseApiKey,
    splitwiseGroupId,
    splitwiseUserId,
    ynabApiKey,
    ynabBudgetId,
    databaseUrl,
  }: SyncConfig) {
    this.splitwise = new SplitwiseClient({
      apiKey: splitwiseApiKey,
      groupId: splitwiseGroupId,
      userId: splitwiseUserId,
    });
    this.ynab = new ynab.API(ynabApiKey);
    this.syncedTransactionService = new SyncedTransactionService();

    initializeDatabase(databaseUrl);
  }

  async sync() {}

  private async reconcileUnpaidSyncedTransactions(): Promise<void> {
    const unpaidSyncedTransactions =
      await this.syncedTransactionService.getUnpaidSyncedTransactions();

    unpaidSyncedTransactions.map(async (syncedTransaction) => {
      const expense = await this.splitwise.getExpenseById(
        syncedTransaction.splitwiseExpenseId,
      );

      if (expense.deleted_at) {
        return syncedTransaction.destroy();
      }

      if (expense.updated_at) {
        syncedTransaction.amount =
          this.splitwise.getExpenseAmountForUser(expense);
      }

      syncedTransaction.syncDate = new Date();

      // Get YNAB transaction
      // Update amount and description

      // const ynabTransaction = await this.ynab.transactions.getTransactionById(
      //   syncedTransaction.ynabTransactionId,
      // );
    });
  }
}

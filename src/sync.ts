import SplitwiseClient from './splitwise/client';
import ynab from 'ynab';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './services/syncedTransactionService';
import initializeDatabase from './db/initialize';
import YnabClient from './ynab/client';

export interface SyncConfig {
  splitwiseApiKey: string;
  splitwiseGroupId: number;
  splitwiseUserId: number;
  ynabApiKey: string;
  ynabBudgetId: string;
  ynabSplitwiseAccountId: string;
  databaseUrl: string;
}

export interface Syncer {
  sync: () => Promise<void>;
}

class Sync implements Syncer {
  private readonly splitwise: SplitwiseClient;
  private readonly ynab: YnabClient;
  private readonly syncedTransactionService: ISyncedTransactionService;

  constructor({
    splitwiseApiKey,
    splitwiseGroupId,
    splitwiseUserId,
    ynabApiKey,
    ynabBudgetId,
    ynabSplitwiseAccountId,
    databaseUrl,
  }: SyncConfig) {
    this.splitwise = new SplitwiseClient({
      apiKey: splitwiseApiKey,
      groupId: splitwiseGroupId,
      userId: splitwiseUserId,
    });
    this.ynab = new YnabClient({
      apiKey: ynabApiKey,
      budgetId: ynabBudgetId,
      splitwiseAccountId: ynabSplitwiseAccountId,
      uncategorizedCategoryId: 'TODO',
    });
    this.syncedTransactionService = new SyncedTransactionService();

    initializeDatabase(databaseUrl);
  }

  async sync() {}

  private async reconcileUnpaidSyncedTransactions(): Promise<void> {
    let ynabTransactionUpdates: { id: string; amount: number; memo: string }[] =
      [];
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

      // ynabTransactionUpdates.push({
      //   id: syncedTransaction.ynabTransactionId,
      //   amount: ,
      //   memo:
      // });

      // Get YNAB transaction
      // Update amount and description

      // const ynabTransaction = await this.ynab.transactions.getTransactionById(
      //   syncedTransaction.ynabTransactionId,
      // );
    });
  }
}

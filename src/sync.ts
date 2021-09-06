import SplitwiseClient from './splitwise/client';
import ynab from 'ynab';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './services/syncedTransactionService';
import initializeDatabase from './db/initialize';
import YnabClient, { YnabTransactionUpdate } from './ynab/client';
import SyncedTransaction from './db/syncedTransaction';

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

  async sync() {
    await this.reconcileUnpaidSyncedTransactions();
  }

  private async reconcileUnpaidSyncedTransactions(): Promise<void> {
    const ynabTransactionUpdates: YnabTransactionUpdate[] = [];
    const syncedTransactionsByYnabId: Record<string, SyncedTransaction> = {};

    const unpaidSyncedTransactions =
      await this.syncedTransactionService.getUnpaidSyncedTransactions();

    await Promise.all(
      unpaidSyncedTransactions.map(async (syncedTransaction) => {
        syncedTransaction.syncDate = new Date();

        const expense = await this.splitwise.getExpenseById(
          syncedTransaction.splitwiseExpenseId,
        );

        if (!expense.updated_by || !expense.deleted_at) {
          await syncedTransaction.save();
          return;
        }

        if (expense.deleted_at) {
          ynabTransactionUpdates.push({
            id: syncedTransaction.ynabTransactionId,
            amount: 0,
            memo: 'DELETED',
          });
        }

        if (expense.updated_by && !expense.deleted_at) {
          syncedTransaction.amount =
            this.splitwise.getExpenseAmountForUser(expense);

          syncedTransaction.description = expense.description;

          ynabTransactionUpdates.push({
            id: syncedTransaction.ynabTransactionId,
            amount: syncedTransaction.getAmountInMiliunits(),
            memo: syncedTransaction.description,
          });
        }

        syncedTransactionsByYnabId[syncedTransaction.ynabTransactionId] =
          syncedTransaction;
      }),
    );

    const updatedYnabTransactions = await this.ynab.updateTransactions(
      ynabTransactionUpdates,
    );

    await Promise.all(
      updatedYnabTransactions.map(async (transaction) => {
        const syncedTransaction = syncedTransactionsByYnabId[transaction.id];

        await syncedTransaction.save();
      }),
    );
  }
}

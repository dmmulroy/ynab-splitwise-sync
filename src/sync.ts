import SplitwiseClient, { SplitwiseExpense } from './splitwise/client';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './services/syncedTransactionService';
import initializeDatabase from './db/initialize';
import YnabClient, {
  CreateYnabTransaction,
  UpdateYnabTransaction,
} from './ynab/client';
import { centsToMiliunits } from './currency/conversions';
import extractSWIDfromMemo from './services/extractSWIDfromMemo';

export interface SyncConfig {
  splitwiseApiKey: string;
  splitwiseGroupId: number;
  splitwiseUserId: number;
  ynabApiKey: string;
  ynabBudgetId: string;
  ynabSplitwiseAccountId: string;
  ynabUncategorizedCategoryId: string;
  ynabPayeeName?: string;
  databaseUrl: string;
}

export class SyncClient {
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
    ynabUncategorizedCategoryId,
    ynabPayeeName,
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
      uncategorizedCategoryId: ynabUncategorizedCategoryId,
      payeeName: ynabPayeeName,
    });
    this.syncedTransactionService = new SyncedTransactionService(
      splitwiseGroupId,
      ynabBudgetId,
    );

    initializeDatabase(databaseUrl);
  }

  async sync() {
    const mostRecentSyncDate =
      await this.syncedTransactionService.getMostRecentSyncDate();

    const isInitialSync = !Boolean(mostRecentSyncDate);

    const splitwiseExpenses = await this.splitwise.getExpenses(
      mostRecentSyncDate ?? undefined,
    );

    const newExpenses: SplitwiseExpense[] = [];
    const updatedExpenses: SplitwiseExpense[] = [];
    const deletedExpenses: SplitwiseExpense[] = [];
    const expensesById: { [key: string]: SplitwiseExpense } = {};

    for (let expense of splitwiseExpenses) {
      if (isInitialSync && expense.payment) {
        break;
      }

      expensesById[expense.id] = expense;

      // For some reason when a payment is made with venmo, the initial createdAt & updateAt
      // timestamps are not the same. This is how I was previously testing to see
      // if a transaction was new or updated.
      if (expense.payment) {
        const existingPayment =
          await this.syncedTransactionService.findBySplitwiseExpenseId(
            expense.id,
          );

        if (existingPayment) {
          updatedExpenses.push(expense);
        } else {
          newExpenses.push(expense);
        }

        continue;
      }

      if (
        expense.created_at.getTime() === expense.updated_at.getTime() ||
        (isInitialSync && !expense.deleted_at)
      ) {
        newExpenses.push(expense);
        continue;
      }

      if (expense.deleted_at && !isInitialSync) {
        deletedExpenses.push(expense);
        continue;
      }

      updatedExpenses.push(expense);
    }

    // New Expenses
    const newYnabTransactions = newExpenses.map<CreateYnabTransaction>(
      (expense) => ({
        amount: centsToMiliunits(
          this.splitwise.getExpenseAmountForUser(expense),
        ),
        date: expense.updated_at,
        memo: `${expense.description} | SWID:${expense.id}`,
      }),
    );

    const createdYnabTransactions = await this.ynab.createTransactions(
      newYnabTransactions,
    );

    await Promise.all(
      createdYnabTransactions.map(async (transaction) => {
        const splitwiseId = extractSWIDfromMemo(transaction.memo ?? '');
        const expense = expensesById[splitwiseId];

        await this.syncedTransactionService.createSyncedTransaction({
          amount: this.splitwise.getExpenseAmountForUser(expense),
          description: expense.description,
          isPayment: expense.payment,
          splitwiseExpenseDate: expense.updated_at,
          splitwiseExpenseId: expense.id,
          splitwiseGroupId: expense.group_id,
          syncDate: new Date(),
          ynabBudgetId: this.ynab.getBudgetId(),
          ynabTransactionDate: new Date(transaction.date),
          ynabTransactionId: transaction.id,
        });
      }),
    );

    // Updated Expenses
    const updatedYnabExpenses: UpdateYnabTransaction[] = [];

    for (let expense of updatedExpenses) {
      const syncedTransaction =
        await this.syncedTransactionService.findBySplitwiseExpenseId(
          expense.id,
        );

      if (syncedTransaction) {
        const updatedAmount = centsToMiliunits(
          this.splitwise.getExpenseAmountForUser(expense),
        );

        updatedYnabExpenses.push({
          id: syncedTransaction.ynabTransactionId,
          amount: updatedAmount,
        });

        await this.syncedTransactionService.updateSyncedTransaction({
          splitwiseExpenseId: expense.id,
          ynabTransactionId: syncedTransaction.ynabTransactionId,
          amount: updatedAmount,
        });
      }
    }

    await this.ynab.updateTransactions(updatedYnabExpenses);

    // Deleted Expenses
    await Promise.all(
      deletedExpenses.map(async (expense) => {
        const syncedTransaction =
          await this.syncedTransactionService.findBySplitwiseExpenseId(
            expense.id,
          );

        if (syncedTransaction) {
          await this.ynab.deleteTransactionById(
            syncedTransaction.ynabTransactionId,
          );

          await this.syncedTransactionService.deleteSyncedTransaction(
            syncedTransaction,
          );
        }
      }),
    );
  }
}

import SplitwiseClient, { SplitwiseExpense } from './splitwise/client';
import ynab from 'ynab';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './services/syncedTransactionService';
import initializeDatabase from './db/initialize';
import YnabClient, {
  CreateYnabTransaction,
  UpdateYnabTransaction,
} from './ynab/client';
import SyncedTransaction from './db/syncedTransaction';
import {
  centsToMiliunits,
  dollarsToCents,
  dollarsToMiliunits,
} from './currency/conversions';
import extractSWIDfromMemo from './services/extractSWIDfromMemo';

export interface SyncConfig {
  splitwiseApiKey: string;
  splitwiseGroupId: number;
  splitwiseUserId: number;
  ynabApiKey: string;
  ynabBudgetId: string;
  ynabSplitwiseAccountId: string;
  ynabPayeeName: string;
  ynabUncategorizedCategoryId: string;
  databaseUrl: string;
}

class Sync {
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
    ynabPayeeName,
    ynabUncategorizedCategoryId,
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
    );

    initializeDatabase(databaseUrl);
  }

  async sync() {
    const mostRecentSyncDate =
      await this.syncedTransactionService.getMostRecentSyncDate();

    const splitwiseExpenses = await this.splitwise.getExpenses(
      mostRecentSyncDate ?? undefined,
    );

    const newExpenses: SplitwiseExpense[] = [];
    const updatedExpenses: SplitwiseExpense[] = [];
    const deleteExpenses: SplitwiseExpense[] = [];
    const expensesById: { [key: string]: SplitwiseExpense } = {};

    splitwiseExpenses.forEach((expense) => {
      expensesById[expense.id] = expense;

      if (expense.created_at === expense.updated_at) {
        newExpenses.push(expense);
        return;
      }

      if (expense.deleted_at) {
        deleteExpenses.push(expense);
        return;
      }

      updatedExpenses.push(expense);
    });

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

    updatedExpenses.map(async (expense) => {
      // await this.syncedTransactionService.updateSyncedTransaction()
    });
  }
}

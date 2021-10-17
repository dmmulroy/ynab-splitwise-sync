import SyncedTransaction, {
  SyncedTransactionAttributes,
} from '../db/syncedTransaction';

export interface ISyncedTransactionService {
  getMostRecentSyncedTransaction(): Promise<SyncedTransaction | null>;
  getMostRecentSyncDate(): Promise<Date | null>;
  createSyncedTransaction(
    params: SyncedTransactionAttributes,
  ): Promise<SyncedTransaction>;
  updateSyncedTransaction(
    params: UpdateParams,
  ): Promise<SyncedTransaction | null>;
  findBySplitwiseExpenseId(id: number): Promise<SyncedTransaction | null>;
  deleteSyncedTransaction(
    syncedTransaction: SyncedTransaction,
  ): Promise<boolean>;
}

type UpdateParams = Partial<
  Pick<SyncedTransactionAttributes, 'amount' | 'description'>
> &
  Pick<SyncedTransactionAttributes, 'splitwiseExpenseId' | 'ynabTransactionId'>;

class SyncedTransactionService implements ISyncedTransactionService {
  constructor(
    private readonly splitwiseGroupId: number,
    private readonly ynabBudgetId: string,
  ) {}

  async getMostRecentSyncedTransaction() {
    return SyncedTransaction.findOne({
      where: {
        splitwiseGroupId: this.splitwiseGroupId,
        ynabBudgetId: this.ynabBudgetId,
      },
      order: [['sync_date', 'DESC']],
    });
  }

  async getMostRecentSyncDate() {
    const syncedTransaction = await SyncedTransaction.findOne({
      where: {
        splitwiseGroupId: this.splitwiseGroupId,
        ynabBudgetId: this.ynabBudgetId,
      },
      order: [['sync_date', 'DESC']],
    });

    return syncedTransaction?.syncDate ?? null;
  }

  async createSyncedTransaction(
    params: SyncedTransactionAttributes,
  ): Promise<SyncedTransaction> {
    const syncedTransaction = await SyncedTransaction.create(params);

    return syncedTransaction;
  }

  async updateSyncedTransaction(
    params: UpdateParams,
  ): Promise<SyncedTransaction | null> {
    const syncedTransaction = await SyncedTransaction.findOne({
      where: {
        splitwiseGroupId: this.splitwiseGroupId,
        ynabBudgetId: this.ynabBudgetId,
        ynabTransactionId: params.ynabTransactionId,
        splitwiseExpenseId: params.splitwiseExpenseId,
      },
    });

    if (!syncedTransaction) {
      return null;
    }

    if (params.amount) {
      syncedTransaction.amount = params.amount;
    }

    if (params.description) {
      syncedTransaction.description = params.description;
    }

    await syncedTransaction.save();

    return syncedTransaction;
  }

  async findBySplitwiseExpenseId(
    id: number,
  ): Promise<SyncedTransaction | null> {
    return SyncedTransaction.findOne({
      where: {
        splitwiseGroupId: this.splitwiseGroupId,
        ynabBudgetId: this.ynabBudgetId,
        splitwiseExpenseId: id,
      },
    });
  }

  async deleteSyncedTransaction(
    syncedTransaction: SyncedTransaction,
  ): Promise<boolean> {
    await syncedTransaction.destroy();
    return true;
  }
}

export default SyncedTransactionService;

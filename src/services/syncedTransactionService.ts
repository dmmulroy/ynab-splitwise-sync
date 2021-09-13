import { realpathSync } from 'fs';
import { Op } from 'sequelize';
import SyncedTransaction, {
  SyncedTransactionAttributes,
} from '../db/syncedTransaction';

export interface ISyncedTransactionService {
  getMostRecentSyncedTransaction(): Promise<SyncedTransaction | null>;
  getUnpaidSyncedTransactions(): Promise<SyncedTransaction[]>;
  getMostRecentSyncedPayment(): Promise<SyncedTransaction | null>;
  getMostRecentSyncDate(): Promise<Date | null>;
  createSyncedTransaction(
    params: SyncedTransactionAttributes,
  ): Promise<SyncedTransaction>;
  updateSyncedTransaction(
    params: UpdateParams,
  ): Promise<SyncedTransaction | null>;
}

type UpdateParams = Partial<
  Pick<SyncedTransactionAttributes, 'amount' | 'description'>
> &
  Pick<SyncedTransactionAttributes, 'splitwiseExpenseId' | 'ynabTransactionId'>;

class SyncedTransactionService implements ISyncedTransactionService {
  constructor(private readonly splitwiseGroupId: number) {}
  async getMostRecentSyncedPayment() {
    return SyncedTransaction.findOne({
      where: {
        isPayment: true,
        splitwiseGroupId: this.splitwiseGroupId,
      },
      order: [['sync_date', 'DESC']],
    });
  }

  async getUnpaidSyncedTransactions() {
    const mostRecentPayment = await this.getMostRecentSyncedPayment();

    if (mostRecentPayment) {
      return await SyncedTransaction.findAll({
        where: {
          splitwiseExpenseDate: {
            [Op.gt]: mostRecentPayment.splitwiseExpenseDate,
          },
          splitwiseGroupId: this.splitwiseGroupId,
        },
      });
    }

    return SyncedTransaction.findAll();
  }

  async getMostRecentSyncedTransaction() {
    return SyncedTransaction.findOne({
      where: { splitwiseGroupId: this.splitwiseGroupId },
      order: [['sync_date', 'DESC']],
    });
  }

  async getMostRecentSyncDate() {
    const syncedTransaction = await SyncedTransaction.findOne({
      where: { splitwiseGroupId: this.splitwiseGroupId },
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

    return syncedTransaction;
  }
}

export default SyncedTransactionService;

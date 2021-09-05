import { Op } from 'sequelize';
import SyncedTransaction from '../db/syncedTransaction';

export interface ISyncedTransactionService {
  getMostRecentSyncedTransaction(): Promise<SyncedTransaction | null>;
  getUnpaidSyncedTransactions(): Promise<SyncedTransaction[]>;
  getMostRecenySyncedPayment(): Promise<SyncedTransaction | null>;
}

class SyncedTransactionService implements ISyncedTransactionService {
  async getMostRecenySyncedPayment() {
    return SyncedTransaction.findOne({
      where: {
        isPayment: true,
      },
    });
  }

  async getUnpaidSyncedTransactions() {
    const mostRecentPayment = await this.getMostRecenySyncedPayment();

    if (mostRecentPayment) {
      return await SyncedTransaction.findAll({
        where: {
          splitwiseExpenseDate: {
            [Op.gt]: mostRecentPayment.splitwiseExpenseDate,
          },
        },
      });
    }

    return SyncedTransaction.findAll();
  }

  async getMostRecentSyncedTransaction() {
    return SyncedTransaction.findOne();
  }
}

export default SyncedTransactionService;

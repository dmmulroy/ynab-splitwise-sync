import SplitwiseClient from './splitwise/client';
import ynab from 'ynab';
import SyncedTransactionService, {
  ISyncedTransactionService,
} from './service/syncedTransaction';
import initializeDatabase from './db/initialize';

export interface SyncConfig {
  splitwiseApiKey: string;
  splitwiseGroupId: string;
  ynabApiKey: string;
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
    ynabApiKey,
    databaseUrl,
  }: SyncConfig) {
    this.splitwise = new SplitwiseClient(splitwiseApiKey, splitwiseGroupId);
    this.ynab = new ynab.API(ynabApiKey);
    this.syncedTransactionService = new SyncedTransactionService();

    initializeDatabase(databaseUrl);
  }

  async sync() {}

  private async reconcileUnpaidSyncedTransactions(): Promise<void> {
    const unpaidSyncedTransactions =
      await this.syncedTransactionService.getUnpaidSyncedTransactions();
  }
}

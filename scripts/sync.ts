import { appendFileSync } from 'fs';
import { join } from 'path';
import { SyncClient } from '../src/sync';

(async () => {
  try {
    const client = new SyncClient({
      databaseUrl: process.env.DATABASE_URL,
      splitwiseApiKey: process.env.SPLITWISE_API_TOKEN,
      splitwiseGroupId: Number(process.env.SPLITWISE_GROUP_ID),
      splitwiseUserId: Number(process.env.SPLITWISE_USER_ID),
      ynabApiKey: process.env.YNAB_API_TOKEN,
      ynabBudgetId: process.env.YNAB_BUDGET_ID,
      ynabSplitwiseAccountId: process.env.YNAB_SPLITWISE_ACCOUNT_ID,
      ynabUncategorizedCategoryId: process.env.YNAB_UNCATEGORIZED_ID,
      ynabPayeeName: process.env.YNAB_PAYEE_NAME,
    });

    await client.sync();

    appendFileSync(
      join(__dirname, '..', '..', 'ynab-sync.log'),
      `${new Date().toISOString()} | Sync Successful\n`,
    );
  } catch (error) {
    appendFileSync(
      join(__dirname, '..', '..', 'ynab-sync.log'),
      `${new Date().toISOString()} | Sync Unsuccessful - ${JSON.stringify(
        error,
      )}\n`,
    );
  }
})();

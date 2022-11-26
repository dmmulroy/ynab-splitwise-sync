import { SyncClient } from '../../src/sync';

exports.handler = async function () {
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

    return {
      statusCode: 200,
      body: 'Sync Successful',
    };
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: 'Sync Unsuccessful',
    };
  }
};

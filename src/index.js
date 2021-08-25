require('dotenv').config();
const splitwise = require('./splitwise');
const getClient = require('./postgres');
const ynab = require('./ynab');

(async () => {
  const pg = await getClient();
  const expenses = await splitwise.getExpenses();
  const transactions = await pg.getTransactions();
  const transaction = await pg.getMostRecentTransaction();
  const budgets = await ynab.budgets.getBudgets();

  console.log(
    JSON.stringify(
      { expenses, rows: transactions, budgets, transaction },
      null,
      2
    )
  );
  await pg.disconnect();
})();

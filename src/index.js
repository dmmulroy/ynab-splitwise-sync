require('dotenv').config();
const splitwise = require('./splitwise');
const getClient = require('./postgres');
const ynab = require('./ynab');

(async () => {
  const pg = await getClient();
  const expenses = await splitwise.getExpenses();
  const rows = await pg.getTransactions();
  const budgets = await ynab.budgets.getBudgets();

  console.log(JSON.stringify({ expenses, rows, budgets }, null, 2));
  await pg.disconnect();
})();

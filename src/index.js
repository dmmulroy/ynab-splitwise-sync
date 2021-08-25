require('dotenv').config();
const splitwise = require('./splitwise');
const getClient = require('./postgres');

(async () => {
  const pg = await getClient();
  const expenses = await splitwise.getExpenses();
  const rows = await pg.getTransactions();

  console.log({ expenses, rows });
  await pg.disconnect();
})();

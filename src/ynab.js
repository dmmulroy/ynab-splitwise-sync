const ynab = require('ynab');

const client = new ynab.API(process.env.YNAB_API_TOKEN);

async function createTransactions(transactions) {
  if (transactions.length === 0) {
    return [];
  }

  const { data } = await client.transactions.createTransactions(
    process.env.YNAB_BUDGET_ID,
    {
      transactions,
    }
  );

  return data.transactions;
}

module.exports = {
  createTransactions,
};

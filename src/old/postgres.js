const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

let connected = false;

async function getClient() {
  if (!connected) {
    await client.connect();
    connected = true;
  }

  async function getSyncedTransactions() {
    return client
      .query('select * from synced_transactions;')
      .then((res) => res.rows);
  }

  async function getMostRecentSyncedTransaction() {
    return client
      .query('select * from synced_transactions order by date desc limit 1;')
      .then((res) => res.rows[0]);
  }

  async function saveSyncedTransactions(transactions) {
    const stmt = `insert into synced_transactions(splitwise_id, ynab_id, amount, date) values($1, $2, $3, $4) returning *;`;
    const synced_transactions = await Promise.all(
      transactions.map(({ splitwise_id, ynab_id, amount, date }) =>
        client
          .query(stmt, [splitwise_id, ynab_id, amount, date])
          .then((res) => res.rows[0])
      )
    );

    return synced_transactions;
  }

  return {
    getSyncedTransactions,
    getMostRecentSyncedTransaction,
    saveSyncedTransactions,
  };
}

module.exports = getClient;

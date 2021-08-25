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

  async function getTransactions() {
    return client.query('select * from transactions;').then((res) => res.rows);
  }

  async function getMostRecentTransaction() {
    return client
      .query('select * from transactions order by date desc limit 1;')
      .then((res) => res.rows[0]);
  }

  return {
    getTransactions,
    getMostRecentTransaction,
    disconnect: client.end.bind(client),
  };
}

module.exports = getClient;

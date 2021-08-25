const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getClient() {
  await client.connect();

  async function getTransactions() {
    return client.query('select * from transactions;').then((res) => res.rows);
  }

  return {
    getTransactions,
    disconnect: client.end.bind(client),
  };
}

module.exports = getClient;

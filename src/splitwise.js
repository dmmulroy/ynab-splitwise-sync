const fetch = require('node-fetch');
const qs = require('query-string');

async function getExpenses({ dated_after } = {}) {
  const query = qs.stringify({
    group_id: process.env.SPLITWISE_GROUP_ID,
    dated_after,
  });
  return fetch(`https://secure.splitwise.com/api/v3.0/get_expenses?${query}`, {
    headers: {
      Authorization: `Bearer ${process.env.SPLITWISE_API_TOKEN}`,
    },
  }).then((res) => res.json()?.expenses);
}

async function getExpense(id) {
  return fetch(`https://secure.splitwise.com/api/v3.0/get_expense/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.SPLITWISE_API_TOKEN}`,
    },
  }).then((res) => res.json()?.expense);
}

module.exports = {
  getExpenses,
  getExpense,
};

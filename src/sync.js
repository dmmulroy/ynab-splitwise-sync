const splitwise = require('./splitwise');
const getClient = require('./postgres');
const ynab = require('./ynab');

async function sync() {
  const pg = await getClient();
  // Retrieve most recent transaction from database
  const mostRecentTransaction = pg.getMostRecentTransaction();
  // If no transactions are found
  if (!mostRecentTransaction) {
    // Retrieve any expenses from splitwise
    const expenses = splitwise.getExpenses();
    // If no expenses are found return early
    if (expenses.length === 0) {
      return;
    }
    // Filter out any deleted expenses
    const filteredExpenses = expenses.filter(
      ({ deleted_at }) => !Boolean(deleted_at)
    );

    // Filter out any payment expenses and any expenses that occured before them
    // Create transactions in ynab
    // If successful
    // Persist transactions to database
    // Else
    // Log Error
  } else {
    // Retrieve expenses from splitwise that occured after 'createdAt'
    const expenses = splitwise.getExpenses({
      dated_after: mostRecentTransaction.date,
    });

    // Filter out Payment and deleted expenses
    const filteredExpenses = expenses.filter(
      ({ deleted_at, payment }) => !Boolean(deleted_at) && !payment
    );

    // Create transactions in ynab
    const _result = await ynab.transactions.createTransactions(
      process.env.YNAB_BUDGET_ID,
      {
        transactions: filteredExpenses.map((expense) => ({
          account_id: process.env.YNAB_ACCOUNT_ID,
          amount: Number(expense.repayments[0].amount) * 1000,
          date: expense.created_at,
          category_id: process.env.YNAB_UNCATEGORIZED_ID,
          memo: expense.description,
          payee_name: process.env.YNAB_PAYEE_NAME,
        })),
      }
    );
    // - - If successful
    // - - - Persist transactions to database
    // - - Else
    // - - - Log Error
  }
}

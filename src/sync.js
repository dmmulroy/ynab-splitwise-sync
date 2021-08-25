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
  }
  // - Else
  // - - Retrieve most recent expenses 'createdAt' from splitwise
  // - - Retrieve expenses from splitwise that occured after 'createdAt'
  // - - Create transactions in ynab
  // - - If successful
  // - - - Persist transactions to database
  // - - Else
  // - - - Log Error
}

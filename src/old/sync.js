const splitwise = require('./splitwise');
const getClient = require('./postgres');
const ynab = require('./ynab');

async function sync() {
  const pg = await getClient();
  // Retrieve most recent transaction from database
  console.log('Retrieving most recent synced transaction from database');
  const mostRecentSyncedTransaction = await pg.getMostRecentSyncedTransaction();
  // If no transactions are found (this handles a first run scenario)
  if (!mostRecentSyncedTransaction) {
    console.log('No recent synced transactions found');
    // Retrieve any expenses from splitwise
    console.log('Retrieiving splitwise expenses');
    const expenses = await splitwise.getExpenses();
    const expenseById = getExpensesById(expenses);
    console.log(`Found ${expenses.length} splitwise expenses`);
    // Filter out any deleted expenses
    console.log('Filtering out deleted expenses, payments, and old expenses');
    const filteredExpenses = filterInitialExpenses(expenses);
    console.log(
      `Number of expenses after filtering: ${filteredExpenses.length}`
    );

    // Create transactions in ynab
    console.log('Creating transactions in YNAB');
    const ynabTransactions = await ynab.createTransactions(
      filteredExpenses.map((expense) => splitwiseToYnab(expense))
    );
    console.log(`Created ${ynabTransactions.length} YNAB transactions`);

    console.log('Persisting transactions to the database');
    const syncedTransactions = await pg.saveSyncedTransactions(
      ynabTransactions.map(({ id, amount, date, memo }) => {
        const splitwise_id = extractSWIDfromMemo(memo);
        return {
          splitwise_id,
          ynab_id: id,
          amount: amount,
          date: expenseById[splitwise_id].created_at,
        };
      })
    );
    console.log(`Persisted ${syncedTransactions.length} transactions`);

    return syncedTransactions;
  } else {
    console.log(
      `Synced Transaction found: ${JSON.stringify(mostRecentSyncedTransaction)}`
    );
    // Retrieve expenses from splitwise that occured after 'createdAt'
    console.log(
      `Retrieiving splitwise expenses dated after: ${mostRecentSyncedTransaction.date}`
    );
    const expenses = await splitwise.getExpenses({
      dated_after: mostRecentSyncedTransaction.date.toISOString(),
    });
    const expenseById = getExpensesById(expenses);
    console.log(`Found ${expenses.length} splitwise expenses`);

    // Filter out Payment and deleted expenses
    console.log('Filtering out deleted expenses and payments');
    const filteredExpenses = expenses.filter(
      ({ deleted_at, payment }) => !Boolean(deleted_at) && !payment
    );
    console.log(
      `Number of expenses after filtering: ${filteredExpenses.length}`
    );

    // Create transactions in ynab
    console.log('Creating transactions in YNAB');
    const ynabTransactions = await ynab.createTransactions(
      filteredExpenses.map((expense) => splitwiseToYnab(expense))
    );
    console.log(`Created ${ynabTransactions.length} YNAB transactions`);

    console.log('Persisting transactions to the database');
    const syncedTransactions = await pg.saveSyncedTransactions(
      ynabTransactions.map(({ id, amount, date, memo }) => {
        const splitwise_id = extractSWIDfromMemo(memo);
        return {
          splitwise_id,
          ynab_id: id,
          amount: amount,
          date: expenseById[splitwise_id].created_at,
        };
      })
    );
    console.log(`Persisted ${syncedTransactions.length} transactions`);

    return syncedTransactions;
  }
}

function filterInitialExpenses(expenses) {
  const filteredExpenses = [];

  for (expense of expenses) {
    // We only need to sync expenses that have occured after the most recent payment (if any)
    if (expense.payment) {
      break;
    }

    // Exclude any expenses that have been deleted
    if (expense.deleted_at) {
      continue;
    }

    filteredExpenses.push(expense);
  }

  return filteredExpenses;
}

function splitwiseToYnab(expense) {
  return {
    account_id: process.env.YNAB_SPLITWISE_ACCOUNT_ID,
    amount:
      process.env.SPLITWISE_USER_ID == expense.repayments[0].to
        ? Number(expense.repayments[0].amount) * 1000
        : Number(expense.repayments[0].amount) * 1000 * -1,
    date: expense.created_at,
    category_id: process.env.YNAB_UNCATEGORIZED_ID,
    memo: `${expense.description} | SWID:${expense.id}`,
    payee_name: process.env.YNAB_PAYEE_NAME,
  };
}

function extractSWIDfromMemo(memo) {
  const [, swid] = /SWID:(.+)/g.exec(memo) ?? [];

  if (!swid) {
    throw new Error(`SWID not found in YNAB transaction memo: ${memo}`);
  }

  return swid;
}

function getExpensesById(expenses) {
  return expenses.reduce((memo, expense) => {
    memo[expense.id] = expense;

    return memo;
  }, {});
}

module.exports = sync;

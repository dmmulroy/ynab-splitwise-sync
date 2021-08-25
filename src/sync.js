async function sync() {
  // Retrieve most recent transaction from database
  // - If no transactions are found
  // - - Retrieve any expenses that have occured after the most recent payment (if any) and that aren't deleted
  // - - Create transactions in ynab
  // - - If successful
  // - - - Persist transactions to database
  // - - Else
  // - - - Log Error
  // - Else
  // - - Retrieve most recent expenses 'createdAt' from splitwise
  // - - Retrieve expenses from splitwise that occured after 'createdAt'
  // - - Create transactions in ynab
  // - - If successful
  // - - - Persist transactions to database
  // - - Else
  // - - - Log Error
}

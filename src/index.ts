import SyncedTransaction from './db/syncedTransaction';
import SplitwiseClient from './splitwise/client';

(async () => {
  // try {
  //   await SyncedTransaction.sync({ alter: true, force: true });
  //   console.log('success!');
  // } catch (error) {
  //   console.log(error);
  // }

  const splitwise = new SplitwiseClient(
    process.env.SPLITWISE_API_TOKEN,
    process.env.SPLITWISE_GROUP_ID,
  );

  const expenses = await splitwise.getExpenses();
  console.log({ expenses });
})();

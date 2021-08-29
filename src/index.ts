import SyncedTransaction from './db/syncedTransaction';

(async () => {
  try {
    await SyncedTransaction.sync({ alter: true, force: true });
    console.log('success!');
  } catch (error) {
    console.log(error);
  }
})();

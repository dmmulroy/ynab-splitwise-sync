import db from './db/client';

(async () => {
  try {
    await db.authenticate();
    console.log('connected!');
  } catch (error) {
    console.log(error);
  }
})();

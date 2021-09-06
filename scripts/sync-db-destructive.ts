import initializeDatabase from '../src/db/initialize';

(async () => {
  const db = initializeDatabase(process.env.DATABASE_URL);

  await db.sync({ force: true, alter: true });
})();

import createNewPostgresClient from './client';
import models from './models';

function initializeDatabase(databaseUrl: string) {
  const client = createNewPostgresClient(databaseUrl);

  models.forEach((model) => model.initialize(client));
}

export default initializeDatabase;

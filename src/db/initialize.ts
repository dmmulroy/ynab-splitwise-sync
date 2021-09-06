import { Sequelize } from 'sequelize/types';
import createNewPostgresClient from './client';
import models from './models';

function initializeDatabase(databaseUrl: string): Sequelize {
  const client = createNewPostgresClient(databaseUrl);

  models.forEach((model) => model.initialize(client));

  return client;
}

export default initializeDatabase;

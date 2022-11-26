import { Sequelize } from 'sequelize';
import pg from 'pg';

let client: Sequelize;

function createNewPostgresClient(databaseUrl: string): Sequelize {
  if (client) return client;

  client = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });

  return client;
}

export default createNewPostgresClient;

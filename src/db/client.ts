import { Sequelize } from 'sequelize';

let client: Sequelize;

function createNewPostgresClient(databaseUrl: string): Sequelize {
  if (client) return client;

  return new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });
}

export default createNewPostgresClient;

import { Sequelize } from 'sequelize';

let client: Sequelize;

function createNewPostgresClient(databaseUrl: string): Sequelize {
  if (client) return client;

  client = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  });

  return client;
}

export default createNewPostgresClient;

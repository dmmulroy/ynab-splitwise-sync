import { Sequelize } from 'sequelize';

function createNewPostgresClient(databaseUrl: string): Sequelize {
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

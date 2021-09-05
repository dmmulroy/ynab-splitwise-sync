import { Sequelize } from 'sequelize/types';
import SyncedTransaction from './syncedTransaction';

export interface Initializer {
  initialize(db: Sequelize): void;
}

const models: Initializer[] = [SyncedTransaction];

export default models;

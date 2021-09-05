import { Sequelize } from 'sequelize/types';
import SyncedTransaction from './syncedTransaction';

export interface Initializable {
  initialize(db: Sequelize): void;
}

const models: Initializable[] = [SyncedTransaction];

export default models;

import { DataTypes, Model, Sequelize } from 'sequelize';

import sequelize from './client';

interface SyncedTransactionAttributes {
  splitwiseId: string;
  ynabId: string;
  amount: number;
  isPayment: Boolean;
  syncDate: Date;
  splitwiseExpenseDate: Date;
  ynabTransactionDate: Date;
}

interface SyncedTransactionMethods {
  getAmountInDollars(): number;
}

export type SyncedTransactionModel = SyncedTransactionAttributes &
  SyncedTransactionMethods;

class SyncedTransaction
  extends Model<SyncedTransactionAttributes>
  implements SyncedTransactionModel
{
  public splitwiseId!: string;
  public ynabId!: string;
  public amount!: number;
  public isPayment!: Boolean;
  public syncDate!: Date;
  public splitwiseExpenseDate!: Date;
  public ynabTransactionDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  getAmountInDollars(): number {
    return this.amount / 1000;
  }
}

SyncedTransaction.init(
  {
    splitwiseId: {
      type: DataTypes.TEXT,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ynabId: {
      type: DataTypes.TEXT,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isPayment: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    syncDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    splitwiseExpenseDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ynabTransactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, timestamps: true, underscored: true },
);

export default SyncedTransaction;

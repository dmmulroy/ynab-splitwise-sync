import { DataTypes, Model, Sequelize } from 'sequelize';

import sequelize from './client';

interface SyncedTransactionAttributes {
  amount: number;
  isPayment: Boolean;
  syncDate: Date;
  splitwiseExpenseId: string;
  ynabTransactionId: string;
  splitwiseGroupId: string;
  ynabBudgetId: string;
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
  public splitwiseExpenseId!: string;
  public ynabTransactionId!: string;
  public amount!: number;
  public isPayment!: Boolean;
  public syncDate!: Date;
  public splitwiseGroupId!: string;
  public ynabBudgetId!: string;
  public splitwiseExpenseDate!: Date;
  public ynabTransactionDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    SyncedTransaction.init(
      {
        splitwiseExpenseId: {
          type: DataTypes.TEXT,
          primaryKey: true,
          allowNull: false,
          unique: true,
        },
        ynabTransactionId: {
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
        splitwiseGroupId: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        ynabBudgetId: {
          type: DataTypes.TEXT,
          allowNull: false,
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
  }

  getAmountInDollars(): number {
    return this.amount / 1000;
  }
}

export default SyncedTransaction;

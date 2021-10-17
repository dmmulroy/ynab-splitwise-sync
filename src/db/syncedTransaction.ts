import { DataTypes, Model, Sequelize } from 'sequelize';
import { centsToDollars, centsToMiliunits } from '../currency/conversions';

export interface SyncedTransactionAttributes {
  amount: number;
  isPayment: Boolean;
  description: string;
  syncDate: Date;
  splitwiseExpenseId: number;
  ynabTransactionId: string;
  splitwiseGroupId: number;
  ynabBudgetId: string;
  splitwiseExpenseDate: Date;
  ynabTransactionDate: Date;
}

interface SyncedTransactionMethods {
  getAmountInDollars(): number;
  getAmountInMiliunits(): number;
}

export type SyncedTransactionModel = SyncedTransactionAttributes &
  SyncedTransactionMethods;

class SyncedTransaction
  extends Model<SyncedTransactionAttributes>
  implements SyncedTransactionModel
{
  public splitwiseExpenseId!: number;
  public ynabTransactionId!: string;
  public amount!: number; // Stored as cents
  public isPayment!: Boolean;
  public description!: string;
  public syncDate!: Date;
  public splitwiseGroupId!: number;
  public ynabBudgetId!: string;
  public splitwiseExpenseDate!: Date;
  public ynabTransactionDate!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static initialize(sequelize: Sequelize) {
    SyncedTransaction.init(
      {
        splitwiseExpenseId: {
          type: DataTypes.INTEGER,
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
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        syncDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        splitwiseGroupId: {
          type: DataTypes.INTEGER,
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
      {
        sequelize,
        timestamps: true,
        underscored: true,
        indexes: [
          {
            name: 'group_budget_id_index',
            fields: ['splitwise_group_id', 'ynab_budget_id'],
          },
        ],
      },
    );
  }

  getAmountInDollars(): number {
    return centsToDollars(this.amount);
  }

  // See https://api.youneedabudget.com/#formats
  getAmountInMiliunits(): number {
    return centsToMiliunits(this.amount);
  }
}

export default SyncedTransaction;

export interface SplitwiseExpense {
  id: number;
  group_id: number;
  description: string;
  payment: boolean;
  cost: string;
  repayments: Repayment[];
  date: Date;
  created_at: Date;
  updated_at: Date | null;
  deleted_at: Date | null;
}

interface Repayment {
  from: number;
  to: number;
  amount: string;
}

export interface SplitwiseClient {
  getExpenses(datedAfter?: Date): Promise<unknown>;
}

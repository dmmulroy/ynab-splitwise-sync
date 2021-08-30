import SplitwiseClient, { SplitwiseExpense } from './client';

describe('Splitwise Integration', () => {
  const splitwise = new SplitwiseClient(
    process.env.SPLITWISE_API_TOKEN,
    process.env.SPLITWISE_GROUP_ID,
  );
  let createdExpense: SplitwiseExpense;

  beforeEach(async () => {
    createdExpense = await splitwise.createExpense({
      cost: Number((Math.random() * 100).toFixed(2)),
      description: 'Test',
    });
  });

  afterEach(async () => {
    await splitwise.deleteExpense(createdExpense.id);
  });

  it('should create an expense', async () => {
    expect(createdExpense.id).toBeTruthy();
  });

  it('should retrieve an expense by id', async () => {
    const expense = await splitwise.getExpenseById(createdExpense.id);

    expect(expense.id).toEqual(createdExpense.id);
  });

  it('should retrieve expenses', async () => {
    const expenses = await splitwise.getExpenses();

    expect(expenses.length).toBeGreaterThanOrEqual(1);
  });

  it('should delete an expense', async () => {
    const expense = await splitwise.createExpense({
      cost: 1,
      description: 'test',
    });

    const { success } = await splitwise.deleteExpense(expense.id);

    expect(success).toBe(true);
  });
});

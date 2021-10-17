import SplitwiseClient from '../src/splitwise/client';

(async () => {
  // const splitwise = new SplitwiseClient({
  //   apiKey: process.env.SPLITWISE_API_TOKEN,
  //   groupId: process.env.SPLITWISE_GROUP_ID,
  //   userId: process.env.SPLITWISE_USER_ID,
  // });

  // const expenses = await splitwise.getExpenses();

  // console.log({ expenses });
  console.log(typeof process.env.SPLITWISE_GROUP_ID);
})();

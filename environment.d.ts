declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SPLITWISE_API_TOKEN: string;
      SPLITWISE_GROUP_ID: string;
      SPLITWISE_USER_ID: string;
      YNAB_API_TOKEN: string;
      YNAB_UNCATEGORIZED_ID: string;
      YNAB_SPLITWISE_ACCOUNT_ID: string;
      YNAB_BUDGET_ID: string;
    }
  }
}

export {};

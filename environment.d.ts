declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SPLITWISE_API_TOKEN: string;
      SPLITWISE_GROUP_ID: number;
      SPLITWISE_USER_ID: number;
    }
  }
}

export {};

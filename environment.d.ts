declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      SPLITWISE_API_TOKEN: string;
      SPLITWISE_GROUP_ID: string;
    }
  }
}

export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEST: string;
    }
  }
}

export {};

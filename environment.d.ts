declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TGWATCHDOG: string;
    }
  }
}
export {}
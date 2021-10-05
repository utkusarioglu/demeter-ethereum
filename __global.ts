declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY: string;
      GOERLI_DEVELOPER_PK: string;
    }
  }
}

export default {};

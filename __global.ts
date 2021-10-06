declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY: string;
      GOERLI_DEPLOYER_PK: string;
      GETH_DEPLOYER_PK: string;
    }
  }
}

export default {};

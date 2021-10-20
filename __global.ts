declare global {
  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY?: string;
      COINMARKETCAP_API_KEY?: string;
      LOCAL_DEPLOYER?: string;
      GOERLI_DEPLOYER?: string;
      LOCAL_USER1?: string;
      LOCAL_USER2?: string;
      LOCAL_USER3?: string;
    }
  }
}

export default {};

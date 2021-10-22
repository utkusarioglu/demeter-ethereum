require("dotenv").config();
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@typechain/ethers-v5";
import "@typechain/hardhat";
import "hardhat-deploy";
import "hardhat-spdx-license-identifier";
import "solidity-coverage";
import "@openzeppelin/hardhat-upgrades";
import "./tasks/account-balances";
import "./tasks/named-accounts";
import "hardhat-storage-layout";
import { EnvAccounts } from "./scripts/env-accounts";
const {
  INFURA_API_KEY
} = process.env;

const envAccounts = new EnvAccounts()
  .setEnvPrefix("ACCOUNT_")
  .setRequiredAccounts("local_deployer", "local_user1")
  .setNetworkAlias("local", ["hardhat", "geth"])
  .parse();

const config = {
  solidity: "0.8.4",
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 1000,
    },
  },

  networks: {
    hardhat: {
      accounts: envAccounts
        .groupArray("local")
        .map(({ privateKey, balance }) => ({ privateKey, balance })),
    },
    geth: {
      url: "http://192.168.1.151:8545",
      chainId: 1131745,
      accounts: envAccounts
        .groupArray("local")
        .map(({ privateKey }) => privateKey),
    },
    ...(envAccounts.hasGroup("goerli") && {
      goerli: {
        url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
        accounts: envAccounts
          .groupArray("goerli")
          .map(({ privateKey }) => `0x${privateKey}`),
      },
    }),
  },

  namedAccounts: envAccounts.getUserNetworkProps(({ address }) => address),

  typechain: {
    outDir: "artifacts/types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
  },
};

export default config;

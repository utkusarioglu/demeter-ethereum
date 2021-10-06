require('dotenv').config();
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import '@typechain/ethers-v5';
import { task } from 'hardhat/config';

module.exports = {
  solidity: '0.8.9',
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },

  networks: {
    geth: {
      url: 'http://192.168.1.151:8545',
      chainId: 1131745,
      accounts: [
        'd772f5a4f5c9a41aad02abcc3b3245bb30d566301311a218f91b28dd9b57bb96',
        '7b3bd76befc7da423df68ca6e65030e631bb2ea99fb958f8b9d772abc909a2a5',
        'ffe362b740d2c187894fcfb1bbe684b1c1ee4caee6b3478f2e69d78d02f22b34',
        '59ce4a71b0785c64992b7317da7185ae32be960c7af0f988ca8b39026779fd85',
      ],
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [`0x${process.env.GOERLI_DEPLOYER_PK}`],
    },
  },

  namedAccounts: {
    deployer: {
      goerli: '0xaAA2b2b9bbB594409842Ddf15b9bD0bb6BE262d9', //it can also specify a specific network name (specified in hardhat.config.js)
      geth: '0x7a21917792d1be1986a5e1998bd248A259987f89',
    },
    user1: {
      geth: '0x87453d4882f3f84912cf4FfF851674C517135fD1',
    },
    user2: {
      geth: '0xd9FF26d1b97d3f2e942D026645332336cBb27bda',
    },
    user3: {
      geth: '0xcE9a2A71dC12F79DF3B30EA1e6355C576E4f632f',
    },
  },

  typechain: {
    outDir: 'artifacts/types',
    target: 'ethers-v5',
    alwaysGenerateOverloads: false,
  },
};

task('accounts', 'Display the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

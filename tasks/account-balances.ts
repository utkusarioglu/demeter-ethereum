import { task } from 'hardhat/config';

task(
  'account-balances',
  'Display the list of accounts',
  async (_, { ethers }) => {
    const accounts = await ethers.getSigners();
    for (const account of accounts) {
      console.log(
        `${account.address}: ${ethers.utils.formatUnits(
          await account.getBalance()
        )} ETH`
      );
    }
  }
);

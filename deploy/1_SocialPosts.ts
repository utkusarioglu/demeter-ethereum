import errors from "../errors";
import type { DeployFunction } from "hardhat-deploy/types";
import type { SocialPosts } from "artifacts/types";

const deployment: DeployFunction = async ({
  ethers,
  upgrades: { deployProxy },
  storageLayout,
  getNamedAccounts,
}) => {
  const { deployer } = await getNamedAccounts();
  if (!deployer) {
    throw new Error(errors.DEPLOYER_NOT_AVAILABLE);
  }
  const SocialPosts = await ethers.getContractFactory("SocialPosts");
  const socialPosts = (await deployProxy(SocialPosts, [])) as SocialPosts;
  await storageLayout.export();
  await socialPosts.deployed();
  console.log(`Deployed to ${socialPosts.address}`);
};

export default deployment;

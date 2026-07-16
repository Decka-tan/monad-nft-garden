import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Set PRIVATE_KEY in .env before deploying.");
  }

  console.log(`Deploying NFTGardenPassport from ${deployer.address}`);
  const Garden = await ethers.getContractFactory("NFTGardenPassport");
  const garden = await Garden.deploy();
  await garden.waitForDeployment();

  console.log(`NFTGardenPassport deployed to ${await garden.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

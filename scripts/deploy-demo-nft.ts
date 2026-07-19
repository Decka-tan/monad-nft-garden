import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer signer found. Set PRIVATE_KEY before deploying.");
  }

  const before = await ethers.provider.getBalance(deployer.address);
  console.log(`Deploying GardenSeed from ${deployer.address}`);
  console.log(`Balance before: ${ethers.formatEther(before)} MON`);

  const Seed = await ethers.getContractFactory("GardenSeed");
  const seed = await Seed.deploy();
  await seed.waitForDeployment();

  const address = await seed.getAddress();
  const receipt = await seed.deploymentTransaction()?.wait();
  console.log(`GardenSeed deployed to ${address}`);
  console.log(`Token #1 owner: ${await seed.ownerOf(1)}`);
  console.log(`Deployment tx: ${receipt?.hash ?? "unknown"}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

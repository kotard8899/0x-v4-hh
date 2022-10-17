const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const ConduitController = await ethers.getContractFactory(
    "ConduitController"
  );
  const conduitController = await ConduitController.deploy();
  await conduitController.deployed();

  const Seaport = await ethers.getContractFactory("Seaport");
  const seaport = await Seaport.deploy(conduitController.address);
  await seaport.deployed();
  console.log(conduitController.address);
  console.log(seaport.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

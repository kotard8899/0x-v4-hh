/* eslint-disable prettier/prettier */
const hre = require("hardhat");
const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const [
    InitialMigration,
    ZeroEx,
    OwnableFeature,
    SimpleFunctionRegistryFeature,
    ERC165Feature,
    ERC721OrdersFeature,
    ERC1155OrdersFeature,
  ] = await Promise.all([
    ethers.getContractFactory("InitialMigration"),
    ethers.getContractFactory("contracts/ZeroEx.sol:ZeroEx"),
    ethers.getContractFactory("contracts/OwnableFeature.sol:OwnableFeature"),
    ethers.getContractFactory("contracts/SimpleFunctionRegistryFeature.sol:SimpleFunctionRegistryFeature"),
    ethers.getContractFactory("ERC165Feature"),
    ethers.getContractFactory("ERC721OrdersFeature"),
    ethers.getContractFactory("ERC1155OrdersFeature"),
  ]);

  // 1. deploy InitialMigration
  const initialMigration = await InitialMigration.deploy(deployer.address);
  await initialMigration.deployed();
  console.log("initialMigration deployed to:", initialMigration.address);

  // 2. deploy ZeroEx
  const zeroEx = await ZeroEx.deploy(initialMigration.address);
  await zeroEx.deployed();
  console.log("zeroEx deployed to:", zeroEx.address);

  // 3. deploy features
  const ownableFeature = await OwnableFeature.deploy();
  await ownableFeature.deployed();
  console.log("ownableFeature deployed to:", ownableFeature.address);

  const simpleFunctionRegistryFeature = await SimpleFunctionRegistryFeature.deploy();
  await simpleFunctionRegistryFeature.deployed();
  console.log("simpleFunctionRegistryFeature deployed to:", simpleFunctionRegistryFeature.address);

  const eRC165Feature = await ERC165Feature.deploy();
  await eRC165Feature.deployed();
  console.log("eRC165Feature deployed to:", eRC165Feature.address);

  // 0xc7784... = rinkeby WETH.address
  const eRC721OrdersFeature = await ERC721OrdersFeature.deploy(zeroEx.address,"0xc778417E063141139Fce010982780140Aa0cD5Ab");
  await eRC721OrdersFeature.deployed();
  console.log("eRC721OrdersFeature deployed to:", eRC721OrdersFeature.address);

  const eRC1155OrdersFeature = await ERC1155OrdersFeature.deploy(zeroEx.address,"0xc778417E063141139Fce010982780140Aa0cD5Ab");
  await eRC1155OrdersFeature.deployed();
  console.log("eRC1155OrdersFeature deployed to:",eRC1155OrdersFeature.address);

  // 4. initialize zeroEx
  await initialMigration.initializeZeroEx(
    deployer.address,
    zeroEx.address,
    {
      registry: simpleFunctionRegistryFeature.address,
      ownable: ownableFeature.address,
    }
  );
  console.log("initializeZeroEx done")

  // 5. migrate features to zeroEx
  await zeroEx.migrate(
    eRC721OrdersFeature.address,
    "0x8fd3ab80",
    deployer.address
  );
  // await zeroEx.migrate(
  //   eRC1155OrdersFeature.address,
  //   "0x8fd3ab80",
  //   deployer.address
  // );
  // await zeroEx.extend("0x01ffc9a7", eRC165Feature.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

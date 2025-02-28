const hre = require("hardhat");

async function main() {
  const MyContract = await hre.ethers.getContractFactory("TokenLaunchpad");
  const myContract = await MyContract.deploy();

  console.log(`Contract deployed to: ${myContract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
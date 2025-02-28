require('@nomicfoundation/hardhat-ethers');
require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545", // Địa chỉ của Ganache
      accounts: [
        '0x0cc4647f0cd6065ac851e893dc2b3649f333f289d31b6c33a993f04824c46bb5'
      ]
    }
  }
};
require('@nomicfoundation/hardhat-ethers');
require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "HTTP://ganache:7545", // Địa chỉ của Ganache
      accounts: [
        '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d'
      ]
    }
  }
};
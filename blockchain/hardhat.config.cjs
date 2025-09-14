require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  paths: {
    sources: "./contracts",
<<<<<<< HEAD:blockchain/hardhat.config.cjs
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
=======
    tests: "./tests",
    cache: "./build/cache",
    artifacts: "./build/artifacts"
>>>>>>> refs/remotes/origin/main:hardhat.config.cjs
  },
  solidity: {
    version: "0.8.27",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  networks: {
    morphHolesky: {
      url: "https://rpc-quicknode-holesky.morphl2.io",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY.replace('0x', '')}`] : [],
      chainId: 2810,
      gasPrice: 20000000000, // 20 gwei
    },
    hardhat: {
      chainId: 1337
    }
  },
  etherscan: {
    apiKey: {
      morphHolesky: "morphHolesky" // placeholder
    },
    customChains: [
      {
        network: "morphHolesky",
        chainId: 2810,
        urls: {
          apiURL: "https://explorer-api-holesky.morphl2.io/api",
          browserURL: "https://explorer-holesky.morphl2.io"
        }
      }
    ]
  }
};
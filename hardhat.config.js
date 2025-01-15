require("hardhat-gas-reporter");
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");

require("dotenv").config();
require("solidity-coverage");

require("./tasks/accounts");
require("./tasks/block-number");

// RPC URLS
const LOCALHOST_RPC_URL = process.env.LOCALHOST_RPC_URL;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;

// PRIVATE KEYS
const MM_PRIVATE_KEY = process.env.MM_PRIVATE_KEY;

// API KEYS
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [{ version: "0.8.0" }, { version: "0.8.8" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {},
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [MM_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
        localhost: {
            url: LOCALHOST_RPC_URL,
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
        users: {
            default: 1,
        },
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        currency: "USD",
        noColors: true,
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
        // showTimeSpent: true, // Adds time spent on each method
        // gasPrice: 20, // Set a fallback gas price
    },
};

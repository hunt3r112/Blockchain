// backend/indexer.js
const { ethers } = require('ethers');
const mysql = require('mysql2');
const cron = require('node-cron');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL user
  password: 'password', // Replace with your MySQL password
  database: 'token_db',
});

// Ethereum provider and contract setup
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545'); // Ganache local node
const contractAddress = '0xYourTokenAddress'; // Replace with your ERC-20 contract address
const contractABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]; // ERC-20 Transfer event ABI

const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Function to fetch transfer events
const fetchTransferEvents = async () => {
  try {
    const latestBlock = await provider.getBlockNumber();
    console.log(`Fetching transfer events up to block: ${latestBlock}`);

    const events = await contract.queryFilter('Transfer', 0, latestBlock); // Get events from block 0 to latest block

    if (events.length === 0) {
      console.log('No new events found.');
      return;
    }

    // Process each event
    events.forEach(async (event) => {
      const { from, to, value, transactionHash } = event.args;
      const tokenName = await contract.name();
      const tokenSymbol = await contract.symbol();

      // Insert event data into MySQL
      db.query(
        'INSERT INTO tokens (name, symbol, transactionHash, fromAddress, toAddress, amount) VALUES (?, ?, ?, ?, ?, ?)',
        [tokenName, tokenSymbol, transactionHash, from, to, ethers.utils.formatUnits(value, 18)],
        (err) => {
          if (err) {
            console.error('Error inserting event data:', err);
          } else {
            console.log('Event data saved to database');
          }
        }
      );
    });
  } catch (error) {
    console.error('Error fetching transfer events:', error);
  }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
  console.log('Running cron job to fetch transfer events...');
  fetchTransferEvents();
});

console.log('Indexer is running...');

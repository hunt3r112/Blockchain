import Web3 from 'web3';
import mysql from 'mysql2';
import cron from 'cron';
import express from 'express';
import cors from 'cors';
import launchpadABI from './abis/token-launchpad.js'
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const app = express();
const LAST_BLOCK_FILE = './last_block.txt';

// Middleware
app.use(cors());
app.use(express.json());

// Web3 setup
const web3 = new Web3(process.env.GANACHE_URL); // Connect to Ganache or your Ethereum node

// Smart contract details 
const contractABI = launchpadABI.abi;
const contractAddress = process.env.CONTRACT_ADDRESS;
const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

// MySQL database setup
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
});

db.connect();

// Function to get the last processed block from file
function getLastProcessedBlock() {
  if (fs.existsSync(LAST_BLOCK_FILE)) {
    return parseInt(fs.readFileSync(LAST_BLOCK_FILE, 'utf-8')) || 0;
  }
  return 0;
}

// Function to update the last processed block in file
function updateLastProcessedBlock(blockNumber) {
  fs.writeFileSync(LAST_BLOCK_FILE, blockNumber.toString());
}

// Fetch TokenCreated events from new blocks only
async function fetchEvents() {
  const latestBlock = parseInt(await web3.eth.getBlockNumber()); // Get the latest block
  const lastProcessedBlock = getLastProcessedBlock();
  const fromBlock = lastProcessedBlock > 0 ? lastProcessedBlock + 1 : 0; // Start from last processed block or block 0

  console.log(`🔹 Fetching events from block ${fromBlock} to ${latestBlock}`);

  if (fromBlock > latestBlock) {
    console.log("⚠️ No new blocks to process.");
    return;
  }

  const pastLogs = await tokenContract.getPastEvents('TokenCreated', {
    fromBlock: fromBlock,
    toBlock: 'latest',
  });

  pastLogs.forEach((event) => {
    const { creator, tokenAddress, name, symbol, totalSupply, description, image } = event.returnValues;

    console.log(`🔹 Checking token: ${tokenAddress}`);

    // Check if token already exists in the database
    db.query('SELECT * FROM tokens WHERE token_address = ?', [tokenAddress], (err, results) => {
      if (err) {
        console.error('❌ Error querying database:', err);
        return;
      }

      if (results.length === 0) { // ✅ If no existing record, insert new token
        console.log(`✅ New Token Detected! Inserting: ${name} (${symbol})`);

        db.query(
          'INSERT INTO tokens (token_address, name, symbol, total_supply, description, image, creator) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [tokenAddress, name, symbol, totalSupply, description, image, creator],
          (insertErr, _result) => {
            if (insertErr) {
              console.error('❌ Error inserting token:', insertErr);
            } else {
              console.log('✅ Token successfully inserted:', name);
            }
          }
        );
      } else {
        console.log(`⚠️ Token ${tokenAddress} already exists. Skipping.`);
      }
    });
  });

  // ✅ Update the last processed block number
  if (pastLogs.length > 0) {
    updateLastProcessedBlock(latestBlock);
  }
}

// Set up a cron job to periodically fetch data
const job = new cron.CronJob('*/1 * * * *', fetchEvents); // Runs every 1 minutes
job.start();

// API to get token list
app.get('/tokens', (req, res) => {
  db.query('SELECT * FROM tokens', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// // API to create a new token
// app.post('/create-token', express.json(), async (req, res) => {
//   const { name, symbol, description, image } = req.body;
//   try {
//     console.log(await tokenContract.methods.owner().call());
//     const accounts = await web3.eth.getAccounts();
//     const receipt = await tokenContract.methods.createToken(name, symbol, description, image).send({ from: accounts[0], value: web3.utils.toWei("0.01", "ether"), gas: 3000000 });
//     res.json({ success: true, receipt });
//   } catch (error) {
//     console.error('Error creating token:', error);
//     res.status(500).json({ error: error.message });
//   }
// });

// Start the server
const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
const Web3 = require('web3');
const mysql = require('mysql2');

// Connect to Ethereum node (Infura in this case, or your own node)
const web3 = new Web3('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID');

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'yourpassword',  // Use your MySQL password
  database: 'blockchainDB'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Define the ERC-20 contract ABI and address (replace with actual values)
const contractAddress = '0xYourERC20ContractAddress';
const abi = [
  // ERC-20 ABI fragment for Transfer event
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

// Create a contract instance
const contract = new web3.eth.Contract(abi, contractAddress);

// Listen for Transfer events
contract.events.Transfer({
  fromBlock: 'latest' // Listen for events from the latest block
})
.on('data', async (event) => {
  console.log('New Transfer Event:', event);

  // Extract event data
  const transactionHash = event.transactionHash;
  const fromAddress = event.returnValues.from;
  const toAddress = event.returnValues.to;
  const value = web3.utils.fromWei(event.returnValues.value, 'ether'); // Convert from Wei to Ether

  // Insert the data into MySQL database
  const query = 'INSERT INTO transactions (transactionHash, fromAddress, toAddress, value) VALUES (?, ?, ?, ?)';
  db.execute(query, [transactionHash, fromAddress, toAddress, value], (err, results) => {
    if (err) {
      console.error('Error saving transaction to database:', err);
    } else {
      console.log('Transaction saved to MySQL database:', results);
    }
  });
})
.on('error', console.error);
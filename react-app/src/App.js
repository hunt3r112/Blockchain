// frontend/src/App.js
import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokens, setTokens] = useState([]);

  const contractAddress = 'YOUR_CONTRACT_ADDRESS';
  const contractABI = [
    "function mint(address to, uint256 amount) external",
  ];

  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:7545');
  const signer = provider.getSigner();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const tokenContract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const tx = await tokenContract.mint(signer.getAddress(), 1000); // Mint 1000 tokens
      await tx.wait();
      console.log('Transaction successful:', tx);
      fetchTokens();
    } catch (error) {
      console.error('Error creating token:', error);
    }
  };

  const fetchTokens = async () => {
    // Fetch tokens from MySQL database
    try {
      const response = await fetch('http://localhost:5000/tokens');
      const data = await response.json();
      setTokens(data);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  return (
    <div className="App">
      <h1>Create ERC-20 Token</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Token Name"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Token Symbol"
          value={tokenSymbol}
          onChange={(e) => setTokenSymbol(e.target.value)}
        />
        <button type="submit">Create Token</button>
      </form>

      <h2>Tokens List</h2>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>{token.name} - {token.symbol}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

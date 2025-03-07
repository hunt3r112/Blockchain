import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Web3 from 'web3';
import { connectWallet } from '../services/web3';
import launchpadABI from '../abis/token-launchpad.js';

const TokenList = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false); // Loading state
  const [amounts, setAmounts] = useState({}); // Amounts for ETH and Token input for each token
  const [activeTabs, setActiveTabs] = useState({}); // State for active tab for each token

  // Function to fetch tokens
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.REACT_APP_TOKEN_LIST_ENDPOINT);
      setTokens(response.data);
      // Initialize amounts for each token
      const initialAmounts = response.data.reduce((acc, token) => {
        acc[token.token_address] = { ethAmount: '', tokenAmount: '', tokenPriceInWei: null, calculatedPrice: '' };
        return acc;
      }, {});
      setAmounts(initialAmounts);

      const initialTabs = response.data.reduce((acc, token) => {
        acc[token.token_address] = 'Buy'; // Set default tab to 'Buy' for each token
        return acc;
      }, {});
      setActiveTabs(initialTabs);
    } catch (error) {
      console.error('❌ Error fetching token list:', error);
    }
    setLoading(false);
  };

  // Function to get the cost of one token in ETH (in Wei) from the contract
  const getTokenUnitPrice = async (tokenAddress) => {
    const web3 = new Web3(process.env.REACT_APP_GANACHE_URL);

    const contractABI = launchpadABI.abi;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      const priceInWei = await tokenContract.methods.getUnitPrice(tokenAddress).call(); // Call getCost() from contract
      const priceInETH = web3.utils.fromWei(priceInWei, 'ether'); // Convert Wei to ETH
      return parseFloat(priceInETH); // Return the price in ETH
    } catch (error) {
      console.error('❌ Error fetching token price:', error);
      return null;
    }
  };

  // Function to handle ETH swap for tokens
  const handleSwapETHForToken = async (tokenAddress, ethAmount, tokenAmount) => {
    if (!ethAmount) return alert('Please enter an ETH amount.');

    const web3 = await connectWallet();
    if (!web3) return;

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert('❌ No accounts found. Please connect MetaMask.');
      return;
    }

    const senderAddress = accounts[0];

    // Smart contract details
    const contractABI = launchpadABI.abi;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      const swapAmount = web3.utils.toWei(ethAmount, 'ether'); // Convert ETH to Wei
      const receipt = await tokenContract.methods
        .swap(tokenAddress, parseInt(tokenAmount), true)
        .send({
          from: senderAddress,
          value: swapAmount,
          gas: 3000000,
        });

      console.log('✅ Swap successful! Receipt:', receipt);
      alert('✅ Swap ETH for Token successful!');
      setAmounts((prevAmounts) => ({
        ...prevAmounts,
        [tokenAddress]: { ...prevAmounts[tokenAddress], ethAmount: '', calculatedPrice: '' },
      })); // Clear ETH amount after successful swap
    } catch (error) {
      console.error('❌ Error swapping ETH for token:', error);
      alert('❌ Error swapping ETH for token');
    }
  };

  // Function to handle token swap for ETH
  const handleSwapTokenForETH = async (tokenAddress, tokenAmount) => {
    if (!tokenAmount) return alert('Please enter a token amount.');

    const web3 = await connectWallet();
    if (!web3) return;

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert('❌ No accounts found. Please connect MetaMask.');
      return;
    }

    const senderAddress = accounts[0];

    // Smart contract details
    const contractABI = launchpadABI.abi;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const tokenContract = new web3.eth.Contract(contractABI, contractAddress);

    try {
      const sellAmount = web3.utils.toWei(tokenAmount, 'ether'); // Convert token amount to Wei
      const receipt = await tokenContract.methods
        .swap(tokenAddress, sellAmount, false)
        .send({
          from: senderAddress,
          gas: 3000000,
        });

      console.log('✅ Swap successful! Receipt:', receipt);
      alert('✅ Swap Token for ETH successful!');
      setAmounts((prevAmounts) => ({
        ...prevAmounts,
        [tokenAddress]: { ...prevAmounts[tokenAddress], tokenAmount: '', calculatedPrice: '' },
      })); // Clear Token amount after successful swap
    } catch (error) {
      console.error('❌ Error swapping token for ETH:', error);
      alert('❌ Error swapping token for ETH');
    }
  };

  // Handle changes in ETH and Token amount inputs for each token
  const handleAmountChange = async (tokenAddress, field, value) => {
    const updatedAmounts = { ...amounts };
    updatedAmounts[tokenAddress][field] = value;

    if (value) {
      // When ETH is entered, calculate the corresponding token amount
      if (field === 'ethAmount') {
        const tokenUnitPrice = await getTokenUnitPrice(tokenAddress);
        if (tokenUnitPrice) {
          const tokenAmount = (parseFloat(value) / tokenUnitPrice).toFixed(6);
          updatedAmounts[tokenAddress].tokenAmount = tokenAmount;
          updatedAmounts[tokenAddress].calculatedPrice = `= ${tokenAmount} ${tokens.find(token => token.token_address === tokenAddress)?.symbol}`;
        }
      }
  
      // When token amount is entered, calculate the corresponding ETH amount
      if (field === 'tokenAmount') {
        const tokenUnitPrice = await getTokenUnitPrice(tokenAddress);
        if (tokenUnitPrice) {
          const ethAmount = (parseFloat(value) * tokenUnitPrice).toFixed(6);
          updatedAmounts[tokenAddress].ethAmount = ethAmount;
          updatedAmounts[tokenAddress].calculatedPrice = `= ${ethAmount} ETH`;
        }
      }
    } else {
      updatedAmounts[tokenAddress].calculatedPrice = '';
    }

    setAmounts(updatedAmounts);
  };

  const toggleTab = (tokenAddress, tab) => {
    setActiveTabs((prevTabs) => ({
      ...prevTabs,
      [tokenAddress]: tab,
    }));
  };

  // Fetch tokens on component mount
  useEffect(() => {
    fetchTokens();
  }, []); // Empty dependency array ensures it runs only once when the component is mounted

  return (
    <div className="token-list-container">
      <h1 className="token-list-title">Token List</h1>

      {/* Refresh Button Container */}
      <div className="refresh-button-container">
        <button
          onClick={fetchTokens}
          disabled={loading}
          className={`refresh-button ${loading ? 'loading' : ''}`}
        >
          {loading ? 'Refreshing...' : 'Refresh Token List'}
        </button>
      </div>

      {tokens.length === 0 ? (
        <p className="no-tokens">No tokens found.</p>
      ) : (
        <ul className="token-list">
          {tokens.map((token) => (
            <li key={token.token_address} className="token-item">
              <div className="token-header">
                <strong>{token.name}</strong> ({token.symbol})
              </div>
              <p className="token-supply">Supply: {token.total_supply}</p>
              <p className="token-description">{token.description}</p>
              <img src={token.image} alt={token.name} className="token-image" />

              {/* Tabs for each token */}
              <div className="tabs">
                <button
                  className={`tab ${activeTabs[token.token_address] === 'Buy' ? 'active' : ''}`}
                  onClick={() => {
                    toggleTab(token.token_address, 'Buy'); 
                    handleAmountChange(token.token_address, 'ethAmount', 0); 
                    handleAmountChange(token.token_address, 'tokenAmount', 0);
                  }}
                >
                  Buy
                </button>
                <button
                  className={`tab ${activeTabs[token.token_address] === 'Sell' ? 'active' : ''}`}
                  onClick={() => {
                    toggleTab(token.token_address, 'Sell');
                    handleAmountChange(token.token_address, 'ethAmount', 0); 
                    handleAmountChange(token.token_address, 'tokenAmount', 0);
                  }}
                >
                  Sell
                </button>
              </div>

              {/* Add fields for both buying and selling */}
              <div className="swap-section">
                {/* ETH for Token */}
                {activeTabs[token.token_address] === 'Buy' && (
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Enter ETH"
                      value={amounts[token.token_address]?.ethAmount || ''}
                      onChange={(e) => handleAmountChange(token.token_address, 'ethAmount', e.target.value)}
                      className="eth-input"
                    />
                    <div className="calculated-price">
                      {amounts[token.token_address]?.calculatedPrice}
                    </div>
                    <button
                      onClick={() => handleSwapETHForToken(token.token_address, amounts[token.token_address]?.ethAmount, amounts[token.token_address]?.tokenAmount)}
                      className="swap-button"
                    >
                      Place Transaction
                    </button>
                  </div>
                )}

                {/* Token for ETH */}
                {activeTabs[token.token_address] === 'Sell' && (
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder={`Enter ${token.symbol}`}
                      value={amounts[token.token_address]?.tokenAmount || ''}
                      onChange={(e) => handleAmountChange(token.token_address, 'tokenAmount', e.target.value)}
                      className="token-input"
                    />
                    <div className="calculated-price">
                      {amounts[token.token_address]?.calculatedPrice}
                    </div>
                    <button
                      onClick={() => handleSwapTokenForETH(token.token_address, amounts[token.token_address]?.tokenAmount)}
                      className="swap-button"
                    >
                      Place Transaction
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TokenList;

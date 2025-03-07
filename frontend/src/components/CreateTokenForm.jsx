import React, { useState } from 'react';
import { connectWallet } from '../services/web3';
import launchpadABI from '../abis/token-launchpad.js';

const CreateTokenForm = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const web3 = await connectWallet();
    if (!web3) return;

    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) {
      alert("❌ No accounts found. Please connect MetaMask.");
      return;
    }
    const senderAddress = accounts[0];
  
    // Smart contract details 
    const contractABI = launchpadABI.abi;
    const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
    const tokenContract = new web3.eth.Contract(contractABI, contractAddress);
  
    try {
      const fee = await tokenContract.methods.getCreationFee().call();
      console.log(fee);
      const receipt = await tokenContract.methods.createToken(name, symbol, description, image)
        .send({ from: senderAddress, value: fee, gas: 3000000 });
  
      console.log("✅ Token created successfully! Receipt:", receipt);
      alert('✅ Token created successfully!');
  
      // Clear form fields
      setName('');
      setSymbol('');
      setDescription('');
      setImage('');
    } catch (error) {
      console.error('❌ Error creating token:', error);
      alert('❌ Error creating token');
    }
  };  

  return (
    <div className="create-token-container">
      <h1 className="form-title">Create New Token</h1>
      <form className="create-token-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Token Name:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Token Symbol:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Token Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            className="form-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Image URL:</label>
          <input
            type="text"
            className="form-input"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">Create Token</button>
      </form>
    </div>
  );
};

export default CreateTokenForm;

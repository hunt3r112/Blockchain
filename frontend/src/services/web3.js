import Web3 from 'web3';

export const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" }); // Request access to MetaMask
        return new Web3(window.ethereum); // Use MetaMask provider
      } catch (error) {
        console.error("❌ User denied account access", error);
        return null;
      }
    } else {
      alert("Please install MetaMask!");
      return null;
    }
  };
  
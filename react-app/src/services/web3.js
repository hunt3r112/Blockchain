import { ethers } from "ethers";

let provider;

export const connectWallet = async () => {
    if(!window.ethereum) {
        alert("MetaMask chưa được cài đặt");
        return null;
    }
    await window.ethereum.request({method: 'eth_requestAccounts'});
    provider = new ethers.BrowserProvider(window.ethereum);
    return provider;
};

export const getProvider = () => provider;
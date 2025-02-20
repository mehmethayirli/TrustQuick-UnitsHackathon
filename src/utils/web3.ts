import Web3 from 'web3';
import { ethers } from 'ethers';

// Contract ABI - this should match your deployed contract
const TrustNetABI = {
  "abi": [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "ProfileUpdated",
      "type": "event"
    },
    // ... rest of your ABI
  ]
};

export const TRUSTNET_ADDRESS = '0x...'; // Contract address after deployment

let web3Instance: Web3 | null = null;

export const getWeb3 = async () => {
  if (web3Instance) return web3Instance;

  if (window.ethereum) {
    web3Instance = new Web3(window.ethereum);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return web3Instance;
    } catch (error) {
      throw new Error('User denied account access');
    }
  } else if (window.web3) {
    web3Instance = new Web3(window.web3.currentProvider);
    return web3Instance;
  } else {
    throw new Error('No Web3 provider detected');
  }
};

export async function getContract(library: any, account: string) {
  const signer = library.getSigner(account);
  return new ethers.Contract(TRUSTNET_ADDRESS, TrustNetABI, signer);
}

export async function updateProfile(contract: ethers.Contract, name: string, ipfsHash: string) {
  try {
    const tx = await contract.updateProfile(name, ipfsHash);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error updating profile:', error);
    return false;
  }
}

export async function addReference(
  contract: ethers.Contract,
  name: string,
  relationshipType: string
) {
  try {
    const tx = await contract.addReference(name, relationshipType);
    await tx.wait();
    return true;
  } catch (error) {
    console.error('Error adding reference:', error);
    return false;
  }
}

export async function getProfile(contract: ethers.Contract, address: string) {
  try {
    return await contract.getProfile(address);
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function getReferences(contract: ethers.Contract, address: string) {
  try {
    return await contract.getReferences(address);
  } catch (error) {
    console.error('Error getting references:', error);
    return [];
  }
}

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}
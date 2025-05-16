import { ethers } from 'ethers';
import FinTokenAssetABI from '../contracts/FinTokenAsset.json';
import FinTokenMarketplaceABI from '../contracts/FinTokenMarketplace.json';

// Contract addresses from deployment
let addresses = {
  FinTokenAsset: process.env.REACT_APP_FINTOKEN_ASSET_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  FinTokenMarketplace: process.env.REACT_APP_FINTOKEN_MARKETPLACE_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
};

// Network configuration for Hardhat
const hardhatNetwork = {
  chainId: '0x539', // 1337 in hex
  chainName: 'FinTernet Local Network',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: ['http://localhost:8545'],
  blockExplorerUrls: []
};

// Cache for provider and signer
let providerCache = null;
let signerCache = null;
let addressCache = null;

// Flag to track if we're in mock mode
let useMockMode = false;

/**
 * Connect to MetaMask and return the signer and address
 */
export const connectToMetaMask = async () => {
  try {
    // Return cached values if available
    if (providerCache && signerCache && addressCache) {
      return {
        provider: providerCache,
        signer: signerCache,
        address: addressCache
      };
    }
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      console.warn('MetaMask not detected, using mock mode');
      useMockMode = true;
      const mockAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
      addressCache = mockAddress;
      return { 
        provider: null, 
        signer: createMockSigner(), 
        address: mockAddress 
      };
    }

    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create a provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Get the signer
    const signer = provider.getSigner();
    
    // Get the connected address
    const address = await signer.getAddress();
    
    // Cache the values
    providerCache = provider;
    signerCache = signer;
    addressCache = address;
    
    // Set up event listeners for network changes
    window.ethereum.on('chainChanged', () => {
      // Clear cache and reload the page
      providerCache = null;
      signerCache = null;
      addressCache = null;
      window.location.reload();
    });
    
    window.ethereum.on('accountsChanged', () => {
      // Clear cache and reload the page
      providerCache = null;
      signerCache = null;
      addressCache = null;
      window.location.reload();
    });
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    console.warn('Falling back to mock mode');
    useMockMode = true;
    const mockAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
    addressCache = mockAddress;
    return { 
      provider: null, 
      signer: createMockSigner(), 
      address: mockAddress 
    };
  }
};

/**
 * Create a mock signer for testing without MetaMask
 */
const createMockSigner = () => {
  return {
    getAddress: async () => '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1',
    signMessage: async () => '0xmocksignature',
    _signTypedData: async () => '0xmocksignature',
    connect: () => this,
    sendTransaction: async (tx) => {
      console.log('Mock transaction sent:', tx);
      return createMockTransaction();
    }
  };
};

/**
 * Create a mock transaction response
 */
const createMockTransaction = () => {
  // Create a mock event with the correct structure
  const mockEvent = {
    event: 'AssetCreated',
    args: {
      tokenId: ethers.BigNumber.from(Date.now().toString()),
      name: 'Mock Asset',
      assetType: 0,
      value: 10000,
      owner: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1'
    }
  };

  // Create a mock receipt with the events array
  const mockReceipt = {
    status: 1,
    events: [mockEvent]
  };

  // Create the transaction object with the wait function
  return {
    wait: async () => {
      // Simulate transaction confirmation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockReceipt;
    },
    hash: '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2)
  };
};

/**
 * Get the current wallet address if connected
 */
export const getCurrentWalletAddress = async () => {
  try {
    if (addressCache) {
      return addressCache;
    }
    
    if (useMockMode) {
      const mockAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
      addressCache = mockAddress;
      return mockAddress;
    }
    
    if (!window.ethereum) {
      return null;
    }
    
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts && accounts.length > 0) {
      addressCache = accounts[0];
      return accounts[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting wallet address:', error);
    return null;
  }
};

/**
 * Add the FinTernet network to MetaMask
 */
export const addFinTernetNetworkToMetaMask = async () => {
  try {
    if (!window.ethereum) {
      console.warn('MetaMask not detected, using mock mode');
      useMockMode = true;
      const mockAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
      addressCache = mockAddress;
      return mockAddress;
    }
    
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [hardhatNetwork]
    });
    
    // Request account access after adding the network
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Clear cache to force reconnection
    providerCache = null;
    signerCache = null;
    addressCache = null;
    
    // Reconnect to get the updated address
    const { address } = await connectToMetaMask();
    return address;
  } catch (error) {
    console.error('Error adding FinTernet network to MetaMask:', error);
    console.warn('Falling back to mock mode');
    useMockMode = true;
    const mockAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
    addressCache = mockAddress;
    return mockAddress;
  }
};

/**
 * Get the FinTokenAsset contract instance
 */
export const getFinTokenAssetContract = (signer) => {
  try {
    const contractAddress = addresses.FinTokenAsset;
    
    if (!contractAddress) {
      throw new Error('FinTokenAsset contract address not configured');
    }
    
    if (useMockMode) {
      return createMockFinTokenAssetContract();
    }
    
    return new ethers.Contract(contractAddress, FinTokenAssetABI.abi, signer);
  } catch (error) {
    console.error('Error getting FinTokenAsset contract:', error);
    return createMockFinTokenAssetContract();
  }
};

/**
 * Create a mock FinTokenAsset contract for testing without a blockchain
 */
const createMockFinTokenAssetContract = () => {
  return {
    address: addresses.FinTokenAsset,
    connect: () => this,
    mintAsset: async (to, name, assetType, description, value, tokenURI) => {
      console.log('Mock mintAsset called with:', { to, name, assetType, description, value, tokenURI });
      return createMockTransaction();
    },
    transferFrom: async (from, to, tokenId) => {
      console.log('Mock transferFrom called with:', { from, to, tokenId });
      return createMockTransaction();
    }
  };
};

/**
 * Get the FinTokenMarketplace contract instance
 */
export const getFinTokenMarketplaceContract = (signer) => {
  try {
    const contractAddress = addresses.FinTokenMarketplace;
    
    if (!contractAddress) {
      throw new Error('FinTokenMarketplace contract address not configured');
    }
    
    if (useMockMode) {
      return createMockFinTokenMarketplaceContract();
    }
    
    return new ethers.Contract(contractAddress, FinTokenMarketplaceABI.abi, signer);
  } catch (error) {
    console.error('Error getting FinTokenMarketplace contract:', error);
    return createMockFinTokenMarketplaceContract();
  }
};

/**
 * Create a mock FinTokenMarketplace contract for testing without a blockchain
 */
const createMockFinTokenMarketplaceContract = () => {
  return {
    address: addresses.FinTokenMarketplace,
    connect: () => this,
    listAsset: async (tokenId, price) => {
      console.log('Mock listAsset called with:', { tokenId, price });
      return createMockTransaction();
    }
  };
};

/**
 * Update contract addresses from deployment
 */
export const updateContractAddresses = (newAddresses) => {
  addresses = { ...addresses, ...newAddresses };
  console.log('Updated contract addresses:', addresses);
};

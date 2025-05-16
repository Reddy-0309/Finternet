/**
 * Blockchain Explorer Service
 * Provides integration with external blockchain explorers and APIs
 */

import axios from 'axios';

// Default configuration
const DEFAULT_CONFIG = {
  etherscanApiKey: 'YourApiKeyToken', // Replace with actual API key in production
  infuraApiKey: 'YourInfuraApiKey', // Replace with actual API key in production
  alchemyApiKey: 'YourAlchemyApiKey', // Replace with actual API key in production
  chainId: 1337, // Default to local development network
  useLocalBlockchain: true, // For development, use local blockchain by default
};

// Explorer base URLs by network
const EXPLORER_URLS = {
  1: 'https://etherscan.io',      // Ethereum Mainnet
  3: 'https://ropsten.etherscan.io', // Ropsten Testnet
  4: 'https://rinkeby.etherscan.io', // Rinkeby Testnet
  5: 'https://goerli.etherscan.io',  // Goerli Testnet
  42: 'https://kovan.etherscan.io',  // Kovan Testnet
  56: 'https://bscscan.com',       // Binance Smart Chain
  137: 'https://polygonscan.com',  // Polygon
  1337: 'http://localhost:8545',   // Local development
};

// API base URLs by network
const API_URLS = {
  1: 'https://api.etherscan.io/api',
  3: 'https://api-ropsten.etherscan.io/api',
  4: 'https://api-rinkeby.etherscan.io/api',
  5: 'https://api-goerli.etherscan.io/api',
  42: 'https://api-kovan.etherscan.io/api',
  56: 'https://api.bscscan.com/api',
  137: 'https://api.polygonscan.com/api',
  1337: 'http://localhost:8545',
};

let config = { ...DEFAULT_CONFIG };

/**
 * Initialize the blockchain explorer service with configuration
 * @param {Object} userConfig - Configuration options
 */
const initialize = (userConfig = {}) => {
  config = { ...DEFAULT_CONFIG, ...userConfig };
  console.log('Blockchain Explorer Service initialized with config:', config);
  return config;
};

/**
 * Get the external explorer URL for an address, transaction, or block
 * @param {string} type - Type of entity ('address', 'tx', 'block', 'token')
 * @param {string} value - Address, transaction hash, block number, or token address
 * @param {number} chainId - Optional chain ID to override the default
 * @returns {string} URL to the external explorer
 */
const getExplorerUrl = (type, value, chainId = config.chainId) => {
  const baseUrl = EXPLORER_URLS[chainId] || EXPLORER_URLS[1];
  
  switch (type) {
    case 'address':
      return `${baseUrl}/address/${value}`;
    case 'tx':
      return `${baseUrl}/tx/${value}`;
    case 'block':
      return `${baseUrl}/block/${value}`;
    case 'token':
      return `${baseUrl}/token/${value}`;
    default:
      return baseUrl;
  }
};

/**
 * Get transaction details from an external explorer
 * @param {string} txHash - Transaction hash
 * @param {number} chainId - Optional chain ID to override the default
 * @returns {Promise<Object>} Transaction details
 */
const getTransactionDetails = async (txHash, chainId = config.chainId) => {
  if (config.useLocalBlockchain && chainId === 1337) {
    // For local development, use mock data
    return getMockTransactionDetails(txHash);
  }
  
  try {
    const apiUrl = API_URLS[chainId] || API_URLS[1];
    const response = await axios.get(`${apiUrl}`, {
      params: {
        module: 'proxy',
        action: 'eth_getTransactionByHash',
        txhash: txHash,
        apikey: config.etherscanApiKey,
      },
    });
    
    if (response.data.result) {
      return response.data.result;
    }
    
    throw new Error('Transaction not found');
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    throw error;
  }
};

/**
 * Get contract details from an external explorer
 * @param {string} address - Contract address
 * @param {number} chainId - Optional chain ID to override the default
 * @returns {Promise<Object>} Contract details
 */
const getContractDetails = async (address, chainId = config.chainId) => {
  if (config.useLocalBlockchain && chainId === 1337) {
    // For local development, use mock data
    return getMockContractDetails(address);
  }
  
  try {
    const apiUrl = API_URLS[chainId] || API_URLS[1];
    const response = await axios.get(`${apiUrl}`, {
      params: {
        module: 'contract',
        action: 'getabi',
        address: address,
        apikey: config.etherscanApiKey,
      },
    });
    
    if (response.data.status === '1') {
      // Get contract source code as well
      const sourceResponse = await axios.get(`${apiUrl}`, {
        params: {
          module: 'contract',
          action: 'getsourcecode',
          address: address,
          apikey: config.etherscanApiKey,
        },
      });
      
      return {
        abi: JSON.parse(response.data.result),
        sourceCode: sourceResponse.data.result[0]?.SourceCode || '',
        contractName: sourceResponse.data.result[0]?.ContractName || '',
        compilerVersion: sourceResponse.data.result[0]?.CompilerVersion || '',
      };
    }
    
    throw new Error('Contract not found or not verified');
  } catch (error) {
    console.error('Error fetching contract details:', error);
    throw error;
  }
};

/**
 * Get token details from an external explorer
 * @param {string} address - Token contract address
 * @param {number} chainId - Optional chain ID to override the default
 * @returns {Promise<Object>} Token details
 */
const getTokenDetails = async (address, chainId = config.chainId) => {
  if (config.useLocalBlockchain && chainId === 1337) {
    // For local development, use mock data
    return getMockTokenDetails(address);
  }
  
  try {
    const apiUrl = API_URLS[chainId] || API_URLS[1];
    const response = await axios.get(`${apiUrl}`, {
      params: {
        module: 'token',
        action: 'tokeninfo',
        contractaddress: address,
        apikey: config.etherscanApiKey,
      },
    });
    
    if (response.data.status === '1') {
      return response.data.result[0];
    }
    
    throw new Error('Token not found');
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
};

/**
 * Get account transactions from an external explorer
 * @param {string} address - Account address
 * @param {number} page - Page number for pagination
 * @param {number} offset - Number of results per page
 * @param {number} chainId - Optional chain ID to override the default
 * @returns {Promise<Array>} List of transactions
 */
const getAccountTransactions = async (address, page = 1, offset = 10, chainId = config.chainId) => {
  if (config.useLocalBlockchain && chainId === 1337) {
    // For local development, use mock data
    return getMockAccountTransactions(address);
  }
  
  try {
    const apiUrl = API_URLS[chainId] || API_URLS[1];
    const response = await axios.get(`${apiUrl}`, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: page,
        offset: offset,
        sort: 'desc',
        apikey: config.etherscanApiKey,
      },
    });
    
    if (response.data.status === '1') {
      return response.data.result;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching account transactions:', error);
    throw error;
  }
};

/**
 * Get gas price estimates from an external API
 * @returns {Promise<Object>} Gas price estimates
 */
const getGasPriceEstimates = async () => {
  if (config.useLocalBlockchain) {
    // For local development, use mock data
    return getMockGasPriceEstimates();
  }
  
  try {
    // Use Etherscan gas tracker API
    const apiUrl = API_URLS[config.chainId] || API_URLS[1];
    const response = await axios.get(`${apiUrl}`, {
      params: {
        module: 'gastracker',
        action: 'gasoracle',
        apikey: config.etherscanApiKey,
      },
    });
    
    if (response.data.status === '1') {
      return {
        low: response.data.result.SafeGasPrice,
        average: response.data.result.ProposeGasPrice,
        fast: response.data.result.FastGasPrice,
      };
    }
    
    throw new Error('Gas price data not available');
  } catch (error) {
    console.error('Error fetching gas price estimates:', error);
    // Fallback to mock data if API fails
    return getMockGasPriceEstimates();
  }
};

// Mock data functions for development
const getMockTransactionDetails = (txHash) => {
  return {
    hash: txHash,
    blockNumber: '0x3',
    from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
    to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    value: '0x0',
    gasPrice: '0x3b9aca00',
    gas: '0x1e8480',
    input: '0x...',
    status: '0x1',
  };
};

const getMockContractDetails = (address) => {
  const contracts = {
    '0x5FbDB2315678afecb367f032d93F642f64180aa3': {
      abi: [
        {
          "type": "function",
          "name": "mint",
          "inputs": [
            { "name": "to", "type": "address" },
            { "name": "tokenId", "type": "uint256" }
          ],
          "outputs": [],
          "stateMutability": "nonpayable"
        }
      ],
      sourceCode: 'pragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n\ncontract FinTokenAsset is ERC721 {\n    // Contract implementation...\n}',
      contractName: 'FinTokenAsset',
      compilerVersion: 'v0.8.4+commit.c7e474f2',
    },
    '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512': {
      abi: [
        {
          "type": "function",
          "name": "createListing",
          "inputs": [
            { "name": "tokenId", "type": "uint256" },
            { "name": "tokenContract", "type": "address" },
            { "name": "price", "type": "uint256" }
          ],
          "outputs": [{ "name": "", "type": "uint256" }],
          "stateMutability": "nonpayable"
        }
      ],
      sourceCode: 'pragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\n\ncontract FinTokenMarketplace is ReentrancyGuard {\n    // Contract implementation...\n}',
      contractName: 'FinTokenMarketplace',
      compilerVersion: 'v0.8.4+commit.c7e474f2',
    }
  };
  
  return contracts[address] || {
    abi: [],
    sourceCode: '',
    contractName: 'Unknown Contract',
    compilerVersion: '',
  };
};

const getMockTokenDetails = (address) => {
  return {
    contractAddress: address,
    tokenName: 'Finternet Token',
    symbol: 'FIN',
    totalSupply: '1000000000000000000000000',
    decimals: '18',
    tokenType: 'ERC-20',
  };
};

const getMockAccountTransactions = (address) => {
  return [
    {
      hash: '0x3152cc0dcab9897fcb55ada2d4fdff6cc727973077f6ae258a160635cd56f316',
      blockNumber: '3',
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      value: '0',
      gasUsed: '762971',
      isError: '0',
      functionName: 'Contract Deployment',
    },
    {
      hash: '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
      blockNumber: '4',
      timeStamp: Math.floor(Date.now() / 1000 - 3600).toString(),
      from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
      to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      value: '0',
      gasUsed: '154872',
      isError: '0',
      functionName: 'mint(address,uint256)',
    },
  ];
};

const getMockGasPriceEstimates = () => {
  return {
    low: '25',
    average: '35',
    fast: '50',
  };
};

const blockchainExplorerService = {
  initialize,
  getExplorerUrl,
  getTransactionDetails,
  getContractDetails,
  getTokenDetails,
  getAccountTransactions,
  getGasPriceEstimates,
};

export default blockchainExplorerService;

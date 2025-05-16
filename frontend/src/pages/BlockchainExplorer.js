import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import BlockchainDataDisplay from '../components/BlockchainDataDisplay';
import BlockchainTransactionViewer from '../components/BlockchainTransactionViewer';
import BlockchainAssetCard from '../components/BlockchainAssetCard';
import ContractInfoCard from '../components/ContractInfoCard';
import SmartContractInteraction from '../components/SmartContractInteraction';
import SmartContractTemplates from '../components/SmartContractTemplates';
import EnhancedTransactionHistory from '../components/EnhancedTransactionHistory';
import EnhancedAssetManagement from '../components/EnhancedAssetManagement';
import GasFeeEstimator from '../components/GasFeeEstimator';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaEthereum, FaExchangeAlt, FaCoins, FaFileContract, FaGasPump, FaExternalLinkAlt, FaQuestionCircle } from 'react-icons/fa';
import walletService from '../services/walletService';
import blockchainMonitorService from '../services/blockchainMonitorService';
import blockchainExplorerService from '../services/blockchainExplorerService';

function BlockchainExplorer() {
  const [isLoading, setIsLoading] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletBalance, setWalletBalance] = useState('0');
  const [chainId, setChainId] = useState(null);
  const { assets } = useSelector((state) => state.assets);

  useEffect(() => {
    // Initialize blockchain services
    initializeBlockchainServices();
    
    // Load blockchain data
    loadBlockchainData();
    
    // Check if wallet is already connected
    checkWalletConnection();
    
    // Initialize blockchain explorer service
    blockchainExplorerService.initialize({
      etherscanApiKey: 'YourApiKeyToken', // Replace with actual API key in production
      chainId: 1337, // Default to local development network
      useLocalBlockchain: true, // For development, use local blockchain by default
    });
    
    // Add wallet connection listener
    walletService.addConnectionListener(handleWalletConnection);
    
    return () => {
      walletService.removeConnectionListener(handleWalletConnection);
    };
  }, []);

  const initializeBlockchainServices = async () => {
    // Initialize blockchain monitor service
    await blockchainMonitorService.initialize({
      rpcUrl: 'http://localhost:8545',
      contracts: [
        {
          name: 'FinTokenAsset',
          address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          abi: [] // In a real app, you would provide the actual ABI
        },
        {
          name: 'FinTokenMarketplace',
          address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          abi: [] // In a real app, you would provide the actual ABI
        }
      ]
    });
  };

  const checkWalletConnection = () => {
    if (walletService.isConnected) {
      setWalletConnected(true);
      setWalletAddress(walletService.address);
      setChainId(walletService.chainId);
      fetchWalletBalance();
    }
  };

  const handleWalletConnection = (connectionState) => {
    setWalletConnected(connectionState.isConnected);
    if (connectionState.isConnected) {
      setWalletAddress(connectionState.address);
      setChainId(connectionState.chainId);
      fetchWalletBalance();
    } else {
      setWalletAddress('');
      setWalletBalance('0');
      setChainId(null);
    }
  };

  const fetchWalletBalance = async () => {
    if (walletService.isConnected) {
      try {
        const balance = await walletService.getBalance();
        setWalletBalance(balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      await walletService.connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const loadBlockchainData = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would fetch data from your blockchain node or API
      setTimeout(() => {
        setContracts([
          {
            name: 'FinTokenAsset',
            address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            chainId: 1337,
            deploymentTime: new Date().toISOString(),
            description: 'ERC-721 token contract for managing digital assets',
            sourceCode: 'pragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/token/ERC721/ERC721.sol";\n\ncontract FinTokenAsset is ERC721 {\n    // Contract implementation...\n}'
          },
          {
            name: 'FinTokenMarketplace',
            address: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            chainId: 1337,
            deploymentTime: new Date().toISOString(),
            description: 'Marketplace contract for trading FinToken assets',
            sourceCode: 'pragma solidity ^0.8.0;\n\nimport "@openzeppelin/contracts/security/ReentrancyGuard.sol";\n\ncontract FinTokenMarketplace is ReentrancyGuard {\n    // Contract implementation...\n}'
          }
        ]);
        
        setTransactions([
          {
            hash: '0x3152cc0dcab9897fcb55ada2d4fdff6cc727973077f6ae258a160635cd56f316',
            blockNumber: 2,
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            value: '0',
            gasUsed: '762971',
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            type: 'Contract Deployment'
          },
          {
            hash: '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
            blockNumber: 3,
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            value: '0',
            gasUsed: '154872',
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            type: 'Mint Token'
          },
          {
            hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            value: '0',
            status: 'pending',
            timestamp: new Date().toISOString(),
            type: 'Create Listing'
          }
        ]);
        
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading blockchain data:', error);
      setIsLoading(false);
    }
  };

  // Filter contracts and transactions based on search query
  const filteredContracts = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTransactions = transactions.filter(tx => 
    tx.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tx.from && tx.from.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (tx.to && tx.to.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.tokenId && asset.tokenId.toString().includes(searchQuery.toLowerCase())) ||
    asset.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getNetworkName = (chainId) => {
    const networks = {
      1: 'Ethereum Mainnet',
      3: 'Ropsten Testnet',
      4: 'Rinkeby Testnet',
      5: 'Goerli Testnet',
      42: 'Kovan Testnet',
      56: 'Binance Smart Chain',
      137: 'Polygon',
      1337: 'Finternet Local Network',
    };
    return networks[chainId] || `Chain ID: ${chainId}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'assets':
        return <EnhancedAssetManagement />;
      case 'transactions':
        return <EnhancedTransactionHistory />;
      case 'contracts':
        return renderContractsTab();
      case 'templates':
        return <SmartContractTemplates />;
      case 'gas':
        return <GasFeeEstimator />;
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => {
    return (
      <div className="space-y-8">
        {/* Network Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FaEthereum className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                {chainId ? getNetworkName(chainId) : 'Finternet Local Network'}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Chain ID: {chainId || '1337'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">RPC URL</p>
              <p className="text-sm text-gray-900 dark:text-white font-mono">http://localhost:8545</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Latest Block</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {Math.max(...transactions.map(tx => tx.blockNumber || 0))}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Currency</p>
              <p className="text-sm text-gray-900 dark:text-white">ETH</p>
            </div>
          </div>
        </div>

        {/* Wallet Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Wallet Status</h2>
          {walletConnected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</p>
                <p className="text-sm text-gray-900 dark:text-white font-mono break-all">{walletAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Balance</p>
                <p className="text-sm text-gray-900 dark:text-white">{walletBalance} ETH</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Connect your wallet to interact with the blockchain</p>
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md"
              >
                Connect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                <FaCoins className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Assets</h2>
                <p className="text-gray-600 dark:text-gray-300">{assets.length} total</p>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab('assets')}
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View All Assets
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
                <FaExchangeAlt className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Transactions</h2>
                <p className="text-gray-600 dark:text-gray-300">{transactions.length} total</p>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View All Transactions
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mr-4">
                <FaFileContract className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Contracts</h2>
                <p className="text-gray-600 dark:text-gray-300">{contracts.length} deployed</p>
              </div>
            </div>
            <div className="mt-2">
              <button
                onClick={() => setActiveTab('contracts')}
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
              >
                View All Contracts
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
          <div className="space-y-4">
            {filteredTransactions.slice(0, 3).map((transaction, index) => (
              <BlockchainTransactionViewer key={index} transaction={transaction} />
            ))}
            {filteredTransactions.length > 3 && (
              <div className="text-center mt-4">
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md"
                >
                  View All Transactions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gas Fee Estimator Preview */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Gas Fee Estimator</h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                <FaGasPump className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Current Gas Prices</h2>
                <p className="text-gray-600 dark:text-gray-300">Optimize your transaction costs</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Slow</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">25 Gwei</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">~5 min</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center border-2 border-primary-500 dark:border-primary-400">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">35 Gwei</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">~1 min</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fast</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">50 Gwei</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">&lt;30 sec</p>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={() => setActiveTab('gas')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium rounded-md"
              >
                Open Gas Fee Calculator
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContractsTab = () => {
    return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Smart Contracts</h2>
        {filteredContracts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContracts.map((contract, index) => (
              <ContractInfoCard key={index} contract={contract} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 py-4">No contracts found matching your search criteria.</p>
        )}

        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white my-6">Interact with Contracts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SmartContractInteraction 
            contractAddress="0x5FbDB2315678afecb367f032d93F642f64180aa3"
            contractABI={[
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
            ]}
            functionName="mint"
          />
          
          <SmartContractInteraction 
            contractAddress="0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
            contractABI={[
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
            ]}
            functionName="createListing"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Blockchain Explorer</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Explore blockchain assets, contracts, and transactions</p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by address, hash, or name"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <FaSearch />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'overview' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'assets' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'transactions' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('contracts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'contracts' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Contracts
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'templates' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Contract Templates
          </button>
          <button
            onClick={() => setActiveTab('gas')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === 'gas' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            Gas Fees
          </button>
        </nav>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" text="Loading blockchain data..." />
        </div>
      ) : (
        renderTabContent()
      )}
    </div>
  );
}

export default BlockchainExplorer;

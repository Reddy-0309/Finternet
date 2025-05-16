import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaCoins, FaPlus, FaExchangeAlt, FaInfoCircle, FaFilter, FaSort, FaEye, FaSearch } from 'react-icons/fa';
import BlockchainAssetCard from './BlockchainAssetCard';
import walletService from '../services/walletService';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './FormElements';

function EnhancedAssetManagement() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('value');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if wallet is connected
    setWalletConnected(walletService.isConnected);
    
    // Add wallet connection listener
    walletService.addConnectionListener(handleWalletConnection);
    
    // Fetch assets
    fetchAssets();
    
    return () => {
      walletService.removeConnectionListener(handleWalletConnection);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [assets, searchQuery, filter, sortBy, sortOrder]);

  const handleWalletConnection = (connectionState) => {
    setWalletConnected(connectionState.isConnected);
    if (connectionState.isConnected) {
      fetchAssets();
    }
  };

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your backend or blockchain
      // Simulating API call
      setTimeout(() => {
        const mockAssets = [
          {
            id: '1',
            name: 'Digital Art #1',
            tokenId: '1234',
            type: 'NFT',
            value: 0.5,
            priceChange: 2.5,
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            description: 'A unique digital artwork representing abstract concepts',
            imageUrl: 'https://via.placeholder.com/150',
            creator: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
            attributes: [
              { trait_type: 'Background', value: 'Blue' },
              { trait_type: 'Style', value: 'Abstract' }
            ]
          },
          {
            id: '2',
            name: 'FinToken',
            tokenId: '5678',
            type: 'ERC20',
            value: 1200,
            priceChange: -1.2,
            contractAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            description: 'Utility token for the Finternet platform',
            balance: '1200',
            decimals: 18,
            symbol: 'FIN'
          },
          {
            id: '3',
            name: 'Real Estate Token #42',
            tokenId: '42',
            type: 'RealEstate',
            value: 250000,
            priceChange: 0.8,
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            description: 'Tokenized real estate property at 123 Main St',
            imageUrl: 'https://via.placeholder.com/150',
            attributes: [
              { trait_type: 'Location', value: 'New York' },
              { trait_type: 'Size', value: '2000 sqft' },
              { trait_type: 'Type', value: 'Commercial' }
            ]
          },
          {
            id: '4',
            name: 'Ethereum',
            type: 'Native',
            value: 3.2,
            priceChange: 5.7,
            description: 'Native ETH balance',
            balance: '3.2',
            symbol: 'ETH'
          },
          {
            id: '5',
            name: 'Digital Art #2',
            tokenId: '5432',
            type: 'NFT',
            value: 0.8,
            priceChange: -0.5,
            contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            description: 'A unique digital artwork representing nature',
            imageUrl: 'https://via.placeholder.com/150',
            creator: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
            attributes: [
              { trait_type: 'Background', value: 'Green' },
              { trait_type: 'Style', value: 'Nature' }
            ]
          }
        ];
        
        setAssets(mockAssets);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...assets];

    // Apply type filter
    if (filter !== 'all') {
      filtered = filtered.filter(asset => asset.type === filter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(asset => 
        asset.name.toLowerCase().includes(query) ||
        (asset.tokenId && asset.tokenId.toString().toLowerCase().includes(query)) ||
        asset.type.toLowerCase().includes(query) ||
        (asset.description && asset.description.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'value' || sortBy === 'priceChange') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAssets(filtered);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewAsset = (asset) => {
    setSelectedAsset(asset);
  };

  const handleCreateAsset = () => {
    setShowCreateModal(true);
  };

  const handleTransferAsset = (asset) => {
    setSelectedAsset(asset);
    setShowTransferModal(true);
  };

  const connectWallet = async () => {
    try {
      await walletService.connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // Calculate total portfolio value
  const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

  // Get unique asset types for filter
  const assetTypes = ['all', ...new Set(assets.map(asset => asset.type))];

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Portfolio Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Assets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{assets.length}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Wallet Status</p>
            {walletConnected ? (
              <p className="text-lg font-medium text-green-600 dark:text-green-400">Connected</p>
            ) : (
              <button
                onClick={connectWallet}
                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-medium rounded-md"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Asset Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Asset Management</h2>
            <Button
              onClick={handleCreateAsset}
              className="mt-2 md:mt-0"
            >
              <FaPlus className="mr-2" /> Create Asset
            </Button>
          </div>
          
          {/* Filters and Controls */}
          <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <FaSearch />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {assetTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => toggleSort('value')}
                className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <FaSort className="mr-1" />
                {sortBy === 'value' ? (sortOrder === 'asc' ? 'Value ↑' : 'Value ↓') : 'Value'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Asset Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="medium" text="Loading assets..." />
          </div>
        ) : filteredAssets.length > 0 ? (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map(asset => (
              <BlockchainAssetCard 
                key={asset.id} 
                asset={asset} 
                onView={() => handleViewAsset(asset)}
                onTransfer={() => handleTransferAsset(asset)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No assets found matching your criteria.</p>
            <Button
              onClick={handleCreateAsset}
              variant="primary"
            >
              <FaPlus className="mr-2" /> Create Your First Asset
            </Button>
          </div>
        )}
      </div>

      {/* Asset Distribution */}
      {assets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Asset Distribution</h2>
          <div className="space-y-4">
            {assetTypes.filter(type => type !== 'all').map(type => {
              const typeAssets = assets.filter(asset => asset.type === type);
              const typeValue = typeAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);
              const percentage = (typeValue / totalValue * 100).toFixed(1);
              
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ${typeValue.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Asset Creation Modal - Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Asset</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Asset creation functionality would be implemented here.</p>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowCreateModal(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle asset creation
                  setShowCreateModal(false);
                }}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Transfer Modal - Placeholder */}
      {showTransferModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer Asset</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Asset: {selectedAsset.name}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Transfer functionality would be implemented here.</p>
            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setShowTransferModal(false)}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Handle asset transfer
                  setShowTransferModal(false);
                }}
              >
                Transfer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EnhancedAssetManagement;

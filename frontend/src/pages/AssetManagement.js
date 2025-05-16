import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAssets, createAsset, transferAsset, reset } from '../features/assets/assetSlice';
import { FaPlus, FaExchangeAlt, FaSearch, FaInfoCircle, FaSave, FaHistory, FaChartLine, FaFilter, FaSortAmountDown, FaSortAmountUp, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AssetHistory from '../components/AssetHistory';
import AssetDetails from '../components/AssetDetails';
import SavedSearches from '../components/SavedSearches';

function AssetManagement() {
  const dispatch = useDispatch();
  const { assets, isLoading, isSuccess, isError, message } = useSelector((state) => state.assets);
  const { user } = useSelector((state) => state.auth);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [creatingAsset, setCreatingAsset] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    keyword: '',
    type: 'all',
    minValue: '',
    maxValue: '',
    status: 'all'
  });
  
  const [createForm, setCreateForm] = useState({
    name: '',
    type: 'real-estate',
    description: '',
    value: '',
    metadata: ''
  });
  
  const [transferForm, setTransferForm] = useState({
    recipientAddress: ''
  });

  useEffect(() => {
    dispatch(getAssets());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error(message);
      setCreatingAsset(false);
      setTransactionStatus('');
    }
    
    if (isSuccess && message === 'Asset created') {
      toast.success('Asset created successfully!');
      setShowCreateModal(false);
      setCreatingAsset(false);
      setTransactionStatus('');
      setCreateForm({
        name: '',
        type: 'real-estate',
        description: '',
        value: '',
        metadata: ''
      });
    }

    if (isSuccess && message === 'Asset transferred') {
      toast.success('Asset transferred successfully!');
      setTransactionStatus('');
    }
  }, [isError, isSuccess, message]);

  const handleCreateChange = (e) => {
    setCreateForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const handleTransferChange = (e) => {
    setTransferForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setCreatingAsset(true);
      setTransactionStatus('Processing asset creation...');
      
      const assetData = {
        name: createForm.name,
        type: createForm.type,
        description: createForm.description,
        value: parseFloat(createForm.value),
        metadata: createForm.metadata
      };
      
      if (isNaN(assetData.value)) {
        toast.error('Please enter a valid number for value');
        setCreatingAsset(false);
        setTransactionStatus('');
        return;
      }
      
      toast.info('Creating asset');
      
      dispatch(createAsset(assetData));
    } catch (error) {
      toast.error('Error creating asset: ' + error.message);
      setCreatingAsset(false);
      setTransactionStatus('');
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setTransactionStatus('Processing asset transfer...');
      
      if (selectedAsset) {
        toast.info('Transferring asset');
        
        dispatch(transferAsset({
          assetId: selectedAsset.id,
          recipientAddress: transferForm.recipientAddress
        }));
        setShowTransferModal(false);
        setTransferForm({ recipientAddress: '' });
        setSelectedAsset(null);
      }
    } catch (error) {
      toast.error('Error transferring asset: ' + error.message);
      setTransactionStatus('');
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentFilters(prev => ({
      ...prev,
      keyword: value
    }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    setCurrentFilters(prev => ({
      ...prev,
      type: type
    }));
  };
  
  const handleValueFilterChange = (min, max) => {
    setCurrentFilters(prev => ({
      ...prev,
      minValue: min,
      maxValue: max
    }));
  };
  
  const clearAllFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setCurrentFilters({
      keyword: '',
      type: 'all',
      minValue: '',
      maxValue: '',
      status: 'all'
    });
  };
  
  const applySearchFilters = (filters) => {
    setSearchTerm(filters.keyword || '');
    setFilterType(filters.type || 'all');
    if (filters.minValue || filters.maxValue) {
      handleValueFilterChange(filters.minValue, filters.maxValue);
    }
    // Apply other filters as needed
  };

  const filteredAssets = assets
    .filter(asset => {
      // Apply type filter
      if (filterType !== 'all' && asset.type !== filterType) {
        return false;
      }
      
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          asset.name.toLowerCase().includes(searchLower) ||
          asset.description.toLowerCase().includes(searchLower) ||
          asset.type.toLowerCase().includes(searchLower) ||
          asset.id.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply value filters if set
      if (currentFilters.minValue && !isNaN(parseFloat(currentFilters.minValue))) {
        const minValue = parseFloat(currentFilters.minValue);
        if (parseFloat(asset.value) < minValue) {
          return false;
        }
      }
      
      if (currentFilters.maxValue && !isNaN(parseFloat(currentFilters.maxValue))) {
        const maxValue = parseFloat(currentFilters.maxValue);
        if (parseFloat(asset.value) > maxValue) {
          return false;
        }
      }
      
      // Apply status filter if set
      if (currentFilters.status && currentFilters.status !== 'all') {
        if (asset.status !== currentFilters.status) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'value') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleViewDetails = (asset) => {
    setSelectedAsset(asset);
    setShowDetailsModal(true);
  };

  const handleTransferClick = (asset) => {
    setSelectedAsset(asset);
    setShowTransferModal(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Asset Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <FaPlus className="mr-2" />
          Create Asset
        </button>
      </div>

      {/* Saved Searches Component */}
      {showSavedSearches && (
        <SavedSearches
          type="asset"
          onApplySearch={applySearchFilters}
          initialFilters={currentFilters}
        />
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="appearance-none pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="real-estate">Real Estate</option>
                <option value="stocks">Stocks</option>
                <option value="commodity">Commodity</option>
                <option value="art">Art</option>
                <option value="collectible">Collectible</option>
                <option value="other">Other</option>
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min $"
                value={currentFilters.minValue}
                onChange={(e) => handleValueFilterChange(e.target.value, currentFilters.maxValue)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max $"
                value={currentFilters.maxValue}
                onChange={(e) => handleValueFilterChange(currentFilters.minValue, e.target.value)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => handleSort('value')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {sortField === 'value' && sortDirection === 'asc' ? (
                <FaSortAmountUp className="mr-2 text-primary-500" />
              ) : sortField === 'value' && sortDirection === 'desc' ? (
                <FaSortAmountDown className="mr-2 text-primary-500" />
              ) : (
                <FaSortAmountUp className="mr-2 text-gray-400" />
              )}
              Sort by Value
            </button>
            
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <FaSave className="mr-2 text-gray-600" />
              {showSavedSearches ? 'Hide Saved Searches' : 'Saved Searches'}
            </button>
            
            {(searchTerm || filterType !== 'all' || currentFilters.minValue || currentFilters.maxValue) && (
              <button
                onClick={clearAllFilters}
                className="flex items-center px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <FaTimes className="mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No assets found matching your search.' : 'No assets found. Create your first asset!'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      {sortField === 'name' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <FaSortAmountUp className="text-primary-500" />
                          ) : (
                            <FaSortAmountDown className="text-primary-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center">
                      Type
                      {sortField === 'type' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <FaSortAmountUp className="text-primary-500" />
                          ) : (
                            <FaSortAmountDown className="text-primary-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('value')}
                  >
                    <div className="flex items-center">
                      Value
                      {sortField === 'value' && (
                        <span className="ml-2">
                          {sortDirection === 'asc' ? (
                            <FaSortAmountUp className="text-primary-500" />
                          ) : (
                            <FaSortAmountDown className="text-primary-500" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{asset.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                        {asset.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${asset.value.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(asset)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        <FaInfoCircle className="inline-block mr-1" />
                        Details
                      </button>
                      <button
                        onClick={() => handleTransferClick(asset)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <FaExchangeAlt className="inline-block mr-1" />
                        Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Create New Asset</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                disabled={creatingAsset}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Name</label>
                  <input
                    type="text"
                    name="name"
                    value={createForm.name}
                    onChange={handleCreateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter asset name"
                    required
                    disabled={creatingAsset}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asset Type</label>
                  <select
                    name="type"
                    value={createForm.type}
                    onChange={handleCreateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    disabled={creatingAsset}
                  >
                    <option value="real-estate">Real Estate</option>
                    <option value="stocks">Stocks</option>
                    <option value="commodity">Commodity</option>
                    <option value="art">Art</option>
                    <option value="collectible">Collectible</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={createForm.description}
                    onChange={handleCreateChange}
                    rows="3"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter asset description"
                    disabled={creatingAsset}
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value (USD)</label>
                  <input
                    type="number"
                    name="value"
                    value={createForm.value}
                    onChange={handleCreateChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter asset value"
                    min="0"
                    step="0.01"
                    required
                    disabled={creatingAsset}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Additional Metadata</label>
                  <textarea
                    name="metadata"
                    value={createForm.metadata}
                    onChange={handleCreateChange}
                    rows="2"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter any additional information (optional)"
                    disabled={creatingAsset}
                  ></textarea>
                </div>
                
                {transactionStatus && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          {transactionStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={creatingAsset}
                >
                  {creatingAsset ? 'Creating...' : 'Create Asset'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  disabled={creatingAsset}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Transfer Asset Modal */}
      {showTransferModal && selectedAsset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 md:mx-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Transfer Asset</h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleTransferSubmit}>
              <div className="p-6">
                <div className="mb-6">
                  <div className="bg-gray-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-gray-700 mb-2">You are about to transfer:</p>
                    <p className="font-semibold text-gray-900">{selectedAsset.name}</p>
                    <p className="text-sm text-gray-500 mt-1">Current value: ${selectedAsset.value.toLocaleString()}</p>
                  </div>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Address</label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={transferForm.recipientAddress}
                    onChange={handleTransferChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter recipient address"
                    required
                  />
                </div>
                
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This action cannot be undone. Please verify the recipient address before confirming.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showDetailsModal && selectedAsset && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <AssetDetails 
            asset={selectedAsset} 
            onClose={() => setShowDetailsModal(false)} 
          />
        </div>
      )}
    </div>
  );
}

export default AssetManagement;

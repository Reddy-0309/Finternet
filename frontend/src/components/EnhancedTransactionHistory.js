import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaExchangeAlt, FaFilter, FaSearch, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import BlockchainTransactionViewer from './BlockchainTransactionViewer';
import walletService from '../services/walletService';
import blockchainMonitorService from '../services/blockchainMonitorService';
import LoadingSpinner from './LoadingSpinner';

function EnhancedTransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedTx, setExpandedTx] = useState(null);
  const [showPending, setShowPending] = useState(true);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchTransactions();

    // Subscribe to new transactions
    const listenerId = blockchainMonitorService.subscribeToBlocks(() => {
      fetchTransactions();
    });

    return () => {
      blockchainMonitorService.unsubscribeFromBlocks(listenerId);
    };
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [transactions, searchQuery, filter, sortBy, sortOrder, showPending]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would fetch from your backend or blockchain
      // Simulating API call
      setTimeout(() => {
        const mockTransactions = [
          {
            id: '1',
            hash: '0x3152cc0dcab9897fcb55ada2d4fdff6cc727973077f6ae258a160635cd56f316',
            blockNumber: 2,
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            value: '0',
            gasUsed: '762971',
            status: 'confirmed',
            timestamp: Date.now() - 86400000, // 1 day ago
            type: 'Contract Deployment',
            asset: 'ETH',
            fee: '0.0012'
          },
          {
            id: '2',
            hash: '0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6',
            blockNumber: 3,
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            value: '0',
            gasUsed: '154872',
            status: 'confirmed',
            timestamp: Date.now() - 43200000, // 12 hours ago
            type: 'Mint Token',
            asset: 'NFT',
            fee: '0.0008'
          },
          {
            id: '3',
            hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3',
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            value: '0',
            status: 'pending',
            timestamp: Date.now() - 3600000, // 1 hour ago
            type: 'Create Listing',
            asset: 'NFT',
            fee: '0.0005'
          },
          {
            id: '4',
            hash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7',
            blockNumber: 5,
            from: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            to: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            value: '0.5',
            gasUsed: '21000',
            status: 'confirmed',
            timestamp: Date.now() - 1800000, // 30 minutes ago
            type: 'Transfer',
            asset: 'ETH',
            fee: '0.0003'
          },
          {
            id: '5',
            hash: '0x5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3',
            from: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
            to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            value: '0',
            status: 'failed',
            timestamp: Date.now() - 900000, // 15 minutes ago
            type: 'Buy Token',
            asset: 'NFT',
            fee: '0.0002',
            error: 'Out of gas'
          }
        ];
        
        setTransactions(mockTransactions);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...transactions];

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(tx => tx.status === filter);
    }

    // Hide pending if needed
    if (!showPending) {
      filtered = filtered.filter(tx => tx.status !== 'pending');
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.hash.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        (tx.from && tx.from.toLowerCase().includes(query)) ||
        (tx.to && tx.to.toLowerCase().includes(query)) ||
        (tx.asset && tx.asset.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortBy === 'value' || sortBy === 'fee') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;

    // Create CSV content
    const headers = ['Type', 'Asset', 'Status', 'Hash', 'From', 'To', 'Value', 'Fee', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(tx => {
        const row = [
          tx.type,
          tx.asset,
          tx.status,
          tx.hash,
          tx.from,
          tx.to,
          tx.value,
          tx.fee,
          new Date(tx.timestamp).toLocaleString()
        ];
        return row.join(',');
      })
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
  };

  const toggleExpandTx = (txId) => {
    setExpandedTx(expandedTx === txId ? null : txId);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Transaction History</h2>
        
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by hash, type, address..."
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
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            
            <button
              onClick={() => setShowPending(!showPending)}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
              title={showPending ? 'Hide pending transactions' : 'Show pending transactions'}
            >
              {showPending ? <FaEye className="mr-1" /> : <FaEyeSlash className="mr-1" />}
              Pending
            </button>
            
            <button
              onClick={handleExportCSV}
              disabled={filteredTransactions.length === 0}
              className="flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export as CSV"
            >
              <FaDownload className="mr-1" />
              Export
            </button>
          </div>
        </div>
        
        {/* Transaction Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="medium" text="Loading transactions..." />
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('type')}>
                    Type {getSortIcon('type')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('asset')}>
                    Asset {getSortIcon('asset')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('status')}>
                    Status {getSortIcon('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('timestamp')}>
                    Time {getSortIcon('timestamp')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('value')}>
                    Value {getSortIcon('value')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('fee')}>
                    Fee {getSortIcon('fee')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-2">
                            <FaExchangeAlt size={14} />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{tx.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">{tx.asset}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tx.value ? `${tx.value} ${tx.asset}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {tx.fee ? `${tx.fee} ETH` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpandTx(tx.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          {expandedTx === tx.id ? 'Hide Details' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedTx === tx.id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 bg-gray-50 dark:bg-gray-700">
                          <BlockchainTransactionViewer transaction={tx} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnhancedTransactionHistory;

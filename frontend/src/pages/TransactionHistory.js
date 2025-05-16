import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getTransactions, getTransactionById, reset } from '../features/ledger/ledgerSlice';
import { FaExchangeAlt, FaFilter, FaSearch, FaCalendarAlt, FaFileDownload } from 'react-icons/fa';

function TransactionHistory() {
  const dispatch = useDispatch();
  const { transactions, selectedTransaction, isLoading } = useSelector((state) => state.ledger);
  
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [sortConfig, setSortConfig] = useState({ key: 'timestamp', direction: 'desc' });

  useEffect(() => {
    dispatch(getTransactions());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const viewTransactionDetails = (id) => {
    dispatch(getTransactionById(id));
    setShowDetailsModal(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const exportTransactions = () => {
    // Create CSV content
    const headers = ['Transaction ID', 'Type', 'Asset', 'Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.id,
        t.type_,
        t.asset_name || 'Unknown Asset',
        new Date(t.timestamp).toLocaleString(),
        t.status
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by status
    if (filterStatus !== 'all' && transaction.status !== filterStatus) {
      return false;
    }
    
    // Filter by type
    if (filterType !== 'all' && transaction.type_ !== filterType) {
      return false;
    }
    
    // Filter by date range
    if (dateRange.from && new Date(transaction.timestamp) < new Date(dateRange.from)) {
      return false;
    }
    if (dateRange.to && new Date(transaction.timestamp) > new Date(`${dateRange.to}T23:59:59`)) {
      return false;
    }
    
    // Search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(searchLower) ||
        (transaction.asset_name && transaction.asset_name.toLowerCase().includes(searchLower)) ||
        transaction.type_.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  }).sort((a, b) => {
    // Handle sorting
    const key = sortConfig.key;
    if (key === 'timestamp') {
      return sortConfig.direction === 'asc' 
        ? new Date(a.timestamp) - new Date(b.timestamp)
        : new Date(b.timestamp) - new Date(a.timestamp);
    }
    
    // Handle different property names in the ledger service
    const aValue = key === 'assetName' ? (a.asset_name || '') : 
                  key === 'type' ? a.type_ : 
                  a[key];
    const bValue = key === 'assetName' ? (b.asset_name || '') : 
                  key === 'type' ? b.type_ : 
                  b[key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
          <p className="text-gray-600 mt-1">View and filter your transaction history</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={exportTransactions}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
            disabled={filteredTransactions.length === 0}
          >
            <FaFileDownload className="mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <select
                  id="filterStatus"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <div className="relative">
                <select
                  id="filterType"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 appearance-none"
                >
                  <option value="all">All Types</option>
                  <option value="transfer">Transfer</option>
                  <option value="mint">Mint</option>
                  <option value="burn">Burn</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaFilter className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <div className="relative">
                <input
                  type="date"
                  id="dateFrom"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <div className="relative">
                <input
                  type="date"
                  id="dateTo"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Search by ID, asset name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('id')}
                  >
                    Transaction ID {getSortIndicator('id')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('type')}
                  >
                    Type {getSortIndicator('type')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('assetName')}
                  >
                    Asset {getSortIndicator('assetName')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('timestamp')}
                  >
                    Date {getSortIndicator('timestamp')}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIndicator('status')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.id.substring(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-2 ${transaction.type_ === 'transfer' ? 'bg-blue-100 text-blue-600' : transaction.type_ === 'mint' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          <FaExchangeAlt size={12} />
                        </div>
                        <div className="text-sm text-gray-900">{transaction.type_}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{transaction.asset_name || 'Unknown Asset'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => viewTransactionDetails(transaction.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found matching your filters.</p>
          </div>
        )}
      </div>

      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="relative bg-white rounded-lg max-w-3xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b">
              <h3 className="text-xl font-semibold text-gray-800">Transaction Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedTransaction.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedTransaction.type_}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Asset</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedTransaction.asset_name || 'Unknown Asset'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Asset ID</h4>
                  <p className="text-sm text-gray-900 mt-1">{selectedTransaction.asset_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedTransaction.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <p className="text-sm mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-800' : selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedTransaction.status}
                    </span>
                  </p>
                </div>
                {selectedTransaction.from && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">From</h4>
                    <p className="text-sm text-gray-900 mt-1 break-all">{selectedTransaction.from}</p>
                  </div>
                )}
                {selectedTransaction.to && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">To</h4>
                    <p className="text-sm text-gray-900 mt-1 break-all">{selectedTransaction.to}</p>
                  </div>
                )}
              </div>

              {selectedTransaction.blockchain_data && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Blockchain Data</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedTransaction.blockchain_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-4 border-t flex justify-end">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;

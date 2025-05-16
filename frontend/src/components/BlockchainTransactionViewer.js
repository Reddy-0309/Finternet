import React, { useState } from 'react';
import { FaExchangeAlt, FaInfoCircle, FaCheck, FaTimes } from 'react-icons/fa';

/**
 * A component for displaying blockchain transaction details with enhanced dark mode support
 */
function BlockchainTransactionViewer({ transaction, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  if (!transaction) {
    return (
      <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-center">No transaction data available</p>
      </div>
    );
  }

  const toggleExpanded = () => setExpanded(!expanded);

  // Format status with appropriate styling
  const getStatusDisplay = (status) => {
    if (status === 'confirmed' || status === 'success') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
          <FaCheck className="mr-1" /> {status}
        </span>
      );
    } else if (status === 'pending') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300">
          <FaExchangeAlt className="mr-1 animate-spin" /> {status}
        </span>
      );
    } else if (status === 'failed' || status === 'error') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300">
          <FaTimes className="mr-1" /> {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
        {status}
      </span>
    );
  };

  // Format hash to be more readable
  const formatHash = (hash) => {
    if (!hash) return 'N/A';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm ${className}`}>
      {/* Transaction Header */}
      <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-3">
            <FaExchangeAlt />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type || 'Transaction'}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimestamp(transaction.timestamp)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusDisplay(transaction.status)}
          <button 
            onClick={toggleExpanded}
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            <FaInfoCircle />
          </button>
        </div>
      </div>

      {/* Transaction Summary (always visible) */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Transaction Hash</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white">{formatHash(transaction.hash)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Block</p>
            <p className="text-sm text-gray-900 dark:text-white">{transaction.blockNumber || 'Pending'}</p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(transaction).map(([key, value]) => {
              // Skip already displayed fields or null/undefined values
              if (['hash', 'blockNumber', 'status', 'timestamp', 'type'].includes(key) || value === null || value === undefined) {
                return null;
              }
              
              return (
                <div key={key} className="border-b border-gray-100 dark:border-gray-700 pb-2">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockchainTransactionViewer;

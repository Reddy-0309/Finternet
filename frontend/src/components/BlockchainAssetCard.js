import React from 'react';
import { FaCoins, FaExchangeAlt, FaInfoCircle, FaChartLine } from 'react-icons/fa';
import { Link } from 'react-router-dom';

/**
 * A component for displaying blockchain asset information with enhanced dark mode support
 */
function BlockchainAssetCard({ asset, className = '' }) {
  if (!asset) return null;

  // Format price change with appropriate styling
  const formatPriceChange = (change) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {isPositive ? '+' : ''}{change}%
        <FaChartLine className="ml-1" />
      </span>
    );
  };

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
      {/* Asset Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 mr-3">
              <FaCoins />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{asset.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{asset.type}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">${asset.value?.toLocaleString()}</p>
            {asset.priceChange !== undefined && (
              <p className="text-sm">{formatPriceChange(asset.priceChange)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Asset Details */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Token ID</p>
            <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{asset.tokenId || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
            <p className="text-sm">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                Active
              </span>
            </p>
          </div>
        </div>

        {/* Additional Asset Information */}
        {asset.description && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{asset.description}</p>
          </div>
        )}

        {/* Asset Actions */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Link 
            to={`/assets?id=${asset.id}`}
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
          >
            <FaInfoCircle className="mr-1" /> Details
          </Link>
          <Link 
            to={`/transactions/new?assetId=${asset.id}`}
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center"
          >
            <FaExchangeAlt className="mr-1" /> Transfer
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlockchainAssetCard;

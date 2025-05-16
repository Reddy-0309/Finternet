import React, { useState } from 'react';
import { FaFileContract, FaExternalLinkAlt, FaCode, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { BlockchainCode } from './BlockchainDataDisplay';

/**
 * A component for displaying smart contract information with enhanced dark mode support
 */
function ContractInfoCard({ contract, className = '' }) {
  const [showCode, setShowCode] = useState(false);
  
  if (!contract) return null;

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return address;
  };

  // Format explorer URL
  const getExplorerUrl = (address, chainId = 1) => {
    // This is a simplified version - in a real app, you'd have a mapping of chain IDs to explorer URLs
    const explorers = {
      1: 'https://etherscan.io',      // Ethereum Mainnet
      3: 'https://ropsten.etherscan.io', // Ropsten Testnet
      4: 'https://rinkeby.etherscan.io', // Rinkeby Testnet
      5: 'https://goerli.etherscan.io',  // Goerli Testnet
      42: 'https://kovan.etherscan.io',  // Kovan Testnet
      56: 'https://bscscan.com',        // Binance Smart Chain
      137: 'https://polygonscan.com',    // Polygon
      1337: 'http://localhost:8545',     // Local development
    };
    
    const baseUrl = explorers[chainId] || explorers[1];
    return `${baseUrl}/address/${address}`;
  };

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden ${className}`}>
      {/* Contract Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 mr-3">
            <FaFileContract />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{contract.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Smart Contract</p>
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Contract Address</p>
            <div className="flex items-center">
              <p className="text-sm font-mono text-gray-900 dark:text-white truncate mr-2">
                {formatAddress(contract.address)}
              </p>
              <a 
                href={getExplorerUrl(contract.address, contract.chainId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                aria-label="View on explorer"
              >
                <FaExternalLinkAlt size={14} />
              </a>
            </div>
          </div>
          
          {contract.deploymentTime && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Deployed On</p>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(contract.deploymentTime).toLocaleString()}
              </p>
            </div>
          )}
          
          {contract.description && (
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{contract.description}</p>
            </div>
          )}
        </div>

        {/* Contract Source Code Toggle */}
        {contract.sourceCode && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => setShowCode(!showCode)}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none"
            >
              <div className="flex items-center">
                <FaCode className="mr-2" />
                <span>Source Code</span>
              </div>
              {showCode ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {showCode && (
              <div className="mt-3">
                <BlockchainCode code={contract.sourceCode} language="solidity" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContractInfoCard;

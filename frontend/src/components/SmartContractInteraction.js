import React, { useState } from 'react';
import { FaCode, FaEthereum, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from './FormElements';

/**
 * A component for interacting with smart contracts with enhanced dark mode support
 */
function SmartContractInteraction({ contractAddress, contractABI, functionName, params = [], onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [inputValues, setInputValues] = useState({});

  // Find the function in the ABI
  const functionABI = contractABI?.find(item => 
    item.type === 'function' && item.name === functionName
  );

  const handleInputChange = (name, value) => {
    setInputValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const executeTransaction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // This is a placeholder for actual Web3 interaction code
      // In a real implementation, you would use ethers.js or web3.js
      console.log(`Executing ${functionName} with params:`, inputValues);
      
      // Simulate a successful transaction
      setTimeout(() => {
        setResult({
          transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`,
          blockNumber: Math.floor(Math.random() * 1000000),
          status: 'success'
        });
        setIsLoading(false);
        if (onSuccess) onSuccess(result);
      }, 2000);
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setIsLoading(false);
      if (onError) onError(err);
    }
  };

  if (!contractABI || !functionABI) {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900 p-4 text-red-700 dark:text-red-300">
        <div className="flex items-center mb-2">
          <FaExclamationTriangle className="mr-2" />
          <h3 className="font-medium">Contract Configuration Error</h3>
        </div>
        <p className="text-sm">
          {!contractABI ? 'Contract ABI is missing.' : `Function "${functionName}" not found in ABI.`}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 flex items-center">
        <FaCode className="text-gray-500 dark:text-gray-400 mr-2" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {functionName}
        </h3>
      </div>

      <div className="p-4">
        {/* Contract Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contract Address
          </label>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-2">
            <FaEthereum className="text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-mono text-gray-800 dark:text-gray-200 truncate">
              {contractAddress}
            </span>
          </div>
        </div>

        {/* Function Parameters */}
        {functionABI.inputs && functionABI.inputs.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parameters</h4>
            <div className="space-y-3">
              {functionABI.inputs.map((input, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {input.name || `param${index}`} ({input.type})
                  </label>
                  <input
                    type="text"
                    value={inputValues[input.name || `param${index}`] || ''}
                    onChange={(e) => handleInputChange(input.name || `param${index}`, e.target.value)}
                    placeholder={`Enter ${input.type} value`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Execute Button */}
        <Button
          onClick={executeTransaction}
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? 'Processing...' : `Execute ${functionName}`}
        </Button>

        {/* Result Display */}
        {result && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-800 rounded-md">
            <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">Transaction Successful</h4>
            <div className="space-y-1">
              <p className="text-xs text-green-700 dark:text-green-400">
                <span className="font-medium">Transaction Hash:</span> {result.transactionHash}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                <span className="font-medium">Block Number:</span> {result.blockNumber}
              </p>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-md">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Transaction Failed</h4>
            <p className="text-xs text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartContractInteraction;

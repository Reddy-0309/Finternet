import React from 'react';

/**
 * A component for displaying blockchain data with enhanced dark mode support
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the data display
 * @param {React.ReactNode} props.children - Content to display
 * @param {string} props.className - Additional CSS classes
 */
function BlockchainDataDisplay({ title, children, className = '' }) {
  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      <div className="text-gray-700 dark:text-gray-200 font-mono text-sm overflow-auto">
        {children}
      </div>
    </div>
  );
}

/**
 * A component for displaying blockchain code with syntax highlighting
 * 
 * @param {Object} props - Component props
 * @param {string} props.code - The code to display
 * @param {string} props.language - The language of the code
 */
export function BlockchainCode({ code, language = 'solidity' }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 overflow-x-auto">
      <pre className="text-gray-800 dark:text-gray-200 font-mono text-sm whitespace-pre-wrap break-all">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/**
 * A component for displaying blockchain transaction data
 * 
 * @param {Object} props - Component props
 * @param {Object} props.transaction - Transaction data
 */
export function TransactionData({ transaction }) {
  if (!transaction) return null;
  
  return (
    <BlockchainDataDisplay title="Transaction Details">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(transaction).map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 dark:border-gray-700 pb-2">
            <span className="font-semibold text-gray-700 dark:text-gray-300">{key}: </span>
            <span className="text-gray-900 dark:text-gray-100 break-all">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </BlockchainDataDisplay>
  );
}

export default BlockchainDataDisplay;

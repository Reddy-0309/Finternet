import React from 'react';
import { FaChartLine, FaExchangeAlt, FaMoneyBillWave, FaShieldAlt, FaPlus, FaTimes } from 'react-icons/fa';

function DashboardWidget({ type, title, data, onRemove }) {
  const getWidgetIcon = () => {
    switch (type) {
      case 'assets':
        return <FaChartLine className="text-primary-500" />;
      case 'transactions':
        return <FaExchangeAlt className="text-blue-500" />;
      case 'payments':
        return <FaMoneyBillWave className="text-green-500" />;
      case 'security':
        return <FaShieldAlt className="text-red-500" />;
      default:
        return <FaPlus className="text-gray-500" />;
    }
  };

  const renderWidgetContent = () => {
    switch (type) {
      case 'assets':
        return renderAssetsWidget();
      case 'transactions':
        return renderTransactionsWidget();
      case 'payments':
        return renderPaymentsWidget();
      case 'security':
        return renderSecurityWidget();
      default:
        return <p className="text-gray-500 dark:text-gray-400">Widget content not available</p>;
    }
  };

  const renderAssetsWidget = () => {
    if (!data || data.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No assets available</p>;
    }

    return (
      <div className="space-y-2">
        {data.slice(0, 3).map((asset) => (
          <div key={asset.id} className="flex justify-between items-center">
            <span className="font-medium dark:text-gray-200">{asset.name}</span>
            <span className="text-primary-600 dark:text-primary-400">${asset.value.toFixed(2)}</span>
          </div>
        ))}
        {data.length > 3 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            +{data.length - 3} more assets
          </p>
        )}
      </div>
    );
  };

  const renderTransactionsWidget = () => {
    if (!data || data.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No transactions available</p>;
    }

    return (
      <div className="space-y-2">
        {data.slice(0, 3).map((transaction) => (
          <div key={transaction.id} className="flex justify-between items-center">
            <span className="font-medium truncate dark:text-gray-200">{transaction.description}</span>
            <span className={transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
          </div>
        ))}
        {data.length > 3 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            +{data.length - 3} more transactions
          </p>
        )}
      </div>
    );
  };

  const renderPaymentsWidget = () => {
    if (!data || data.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400">No payments available</p>;
    }

    return (
      <div className="space-y-2">
        {data.slice(0, 3).map((payment) => (
          <div key={payment.id} className="flex justify-between items-center">
            <span className="font-medium dark:text-gray-200">{payment.recipient}</span>
            <span className="text-primary-600 dark:text-primary-400">${payment.amount.toFixed(2)}</span>
          </div>
        ))}
        {data.length > 3 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            +{data.length - 3} more payments
          </p>
        )}
      </div>
    );
  };

  const renderSecurityWidget = () => {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-200">Two-Factor Authentication</span>
          <span className={data?.mfaEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
            {data?.mfaEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-200">Last Login</span>
          <span className="text-gray-600 dark:text-gray-400">{data?.lastLogin || 'Unknown'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="dark:text-gray-200">Login Attempts</span>
          <span className="text-gray-600 dark:text-gray-400">{data?.loginAttempts || 0}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-full transition-colors duration-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          {getWidgetIcon()}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
        {onRemove && (
          <button 
            onClick={onRemove} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Remove widget"
          >
            <FaTimes size={14} />
          </button>
        )}
      </div>
      <div className="mt-2">
        {renderWidgetContent()}
      </div>
    </div>
  );
}

export default DashboardWidget;

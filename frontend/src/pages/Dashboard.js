import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAssets } from '../features/assets/assetSlice';
import { getTransactions } from '../features/transactions/transactionSlice';
import { Link } from 'react-router-dom';
import { FaChartPie, FaExchangeAlt, FaWallet, FaChartLine, FaPlus, FaCog, FaQuestionCircle } from 'react-icons/fa';
import DashboardWidget from '../components/DashboardWidget';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { assets, isLoading: assetsLoading } = useSelector((state) => state.assets);
  const { transactions, isLoading: transactionsLoading } = useSelector((state) => state.transactions);
  const [assetDistribution, setAssetDistribution] = useState([]);
  const [showCustomDashboard, setShowCustomDashboard] = useState(false);

  useEffect(() => {
    dispatch(getAssets());
    dispatch(getTransactions());
  }, [dispatch]);

  useEffect(() => {
    if (assets.length > 0) {
      // Calculate asset distribution by type
      const distribution = {};
      assets.forEach(asset => {
        const type = asset.type || 'Other';
        if (!distribution[type]) {
          distribution[type] = 0;
        }
        distribution[type] += asset.value || 0;
      });

      // Convert to array for rendering
      const distributionArray = Object.entries(distribution).map(([type, value]) => ({
        type,
        value,
        percentage: (value / totalAssetValue * 100).toFixed(1)
      }));

      setAssetDistribution(distributionArray);
    }
  }, [assets]);

  const totalAssetValue = assets.reduce((total, asset) => total + (asset.value || 0), 0);
  
  // Calculate recent performance (mock data for now)
  const recentPerformance = 5.2; // percentage

  const toggleDashboardView = () => {
    setShowCustomDashboard(!showCustomDashboard);
  };

  // If using custom dashboard
  if (showCustomDashboard) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={toggleDashboardView}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
          >
            <FaCog className="mr-2" /> Switch to Standard View
          </button>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <DashboardWidget 
            type="assets" 
            title="Portfolio Summary" 
            data={assets}
          />
          <DashboardWidget 
            type="transactions" 
            title="Recent Transactions" 
            data={transactions}
          />
          <DashboardWidget 
            type="security" 
            title="Security Status" 
            data={{
              mfaEnabled: user?.mfaEnabled || false,
              lastLogin: new Date().toLocaleString(),
              loginAttempts: 1
            }}
          />
          <DashboardWidget 
            type="payments" 
            title="Payment Activity" 
            data={[]}
          />
        </div>
      </div>
    );
  }

  // Standard dashboard view
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-3">
          <button
            onClick={toggleDashboardView}
            className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center mr-2"
          >
            <FaCog className="mr-2" /> Customize Dashboard
          </button>
          <Link
            to="/assets"
            className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
            data-tour="create-asset"
          >
            <FaPlus className="mr-2" /> Create Asset
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
              <FaWallet className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio Value</h2>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">${totalAssetValue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
              <FaChartPie className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assets</h2>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{assets.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mr-4">
              <FaExchangeAlt className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</h2>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{transactions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
              <FaChartLine className="text-xl" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">Performance</h2>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                <span className={recentPerformance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                  {recentPerformance >= 0 ? '+' : ''}{recentPerformance}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Asset Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6" data-tour="smart-contracts">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Asset Distribution</h2>
          {assetsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="small" text="Loading assets..." />
            </div>
          ) : assetDistribution.length > 0 ? (
            <div className="space-y-4">
              {assetDistribution.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary-600 dark:bg-primary-500 h-2.5 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No assets found. Create your first asset to see distribution.</p>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Transactions</h2>
            <Link to="/transactions" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
              View all
            </Link>
          </div>
          {transactionsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="small" text="Loading transactions..." />
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700">
                  <div className={`p-2 rounded-full mr-3 ${transaction.type === 'transfer' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'}`}>
                    <FaExchangeAlt />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{transaction.type} - {transaction.assetName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                    {transaction.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No transactions found.</p>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Your Assets</h2>
          <Link to="/assets" className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            View all
          </Link>
        </div>
        {assetsLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" text="Loading assets..." />
          </div>
        ) : assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Value
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {assets.slice(0, 5).map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{asset.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{asset.tokenId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{asset.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">${asset.value?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/assets?id=${asset.id}`} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 mr-3">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No assets found. Create your first asset to get started.</p>
            <Link
              to="/assets"
              className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-md transition-colors inline-flex items-center"
            >
              <FaPlus className="mr-2" /> Create Asset
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Add Help section for guided tour
function HelpSection({ startTour }) {
  return (
    <div className="fixed bottom-4 right-4 z-10" data-tour="help">
      <div className="relative group">
        <button
          onClick={startTour}
          className="bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white p-3 rounded-full shadow-lg transition-colors"
          aria-label="Help"
        >
          <FaQuestionCircle size={24} />
        </button>
        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click for a guided tour of Finternet
        </div>
      </div>
    </div>
  );
}

// Wrap Dashboard component to include Help section
function DashboardWithHelp() {
  // Access the OnboardingTour component's startTour function
  const tourRef = React.useRef(null);
  
  const startTour = () => {
    // Use the global startFinTour method exposed by OnboardingTour component
    if (window.startFinTour) {
      window.startFinTour();
    } else {
      // Fallback if the method is not available
      localStorage.removeItem('hasSeenTour');
      window.location.reload();
    }
  };
  
  return (
    <>
      <Dashboard />
      <HelpSection startTour={startTour} />
    </>
  );
}

export default DashboardWithHelp;

import React, { useState, useEffect } from 'react';
import { FaGasPump, FaInfoCircle, FaEthereum, FaHistory, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import walletService from '../services/walletService';
import blockchainMonitorService from '../services/blockchainMonitorService';
import LoadingSpinner from './LoadingSpinner';

function GasFeeEstimator({ onSelectGasPrice, initialGasLimit = 21000 }) {
  const [isLoading, setIsLoading] = useState(true);
  const [gasPrices, setGasPrices] = useState({
    slow: 0,
    average: 0,
    fast: 0
  });
  const [selectedSpeed, setSelectedSpeed] = useState('average');
  const [customGasPrice, setCustomGasPrice] = useState('');
  const [useCustomGasPrice, setUseCustomGasPrice] = useState(false);
  const [gasLimit, setGasLimit] = useState(initialGasLimit);
  const [ethPrice, setEthPrice] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [historicalPrices, setHistoricalPrices] = useState([]);
  const [gasPriceUnit, setGasPriceUnit] = useState('gwei'); // 'gwei' or 'wei'

  useEffect(() => {
    fetchGasPrices();
    fetchEthPrice();
    fetchHistoricalGasPrices();

    // Refresh gas prices every 30 seconds
    const interval = setInterval(fetchGasPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Notify parent component when gas price changes
    if (onSelectGasPrice) {
      const gasPrice = useCustomGasPrice 
        ? parseFloat(customGasPrice) 
        : gasPrices[selectedSpeed];
      
      onSelectGasPrice({
        gasPrice,
        gasLimit,
        totalGasFee: calculateTotalGasFee(gasPrice, gasLimit),
        speed: useCustomGasPrice ? 'custom' : selectedSpeed
      });
    }
  }, [selectedSpeed, customGasPrice, useCustomGasPrice, gasLimit, gasPrices]);

  const fetchGasPrices = async () => {
    setIsLoading(true);
    try {
      // In a real application, this would use a gas price oracle or RPC call
      // For this example, we'll simulate the API call
      setTimeout(() => {
        const mockGasPrices = {
          slow: 25,     // gwei
          average: 35,  // gwei
          fast: 50      // gwei
        };
        setGasPrices(mockGasPrices);
        
        // If not using custom gas price, update the custom input with the selected speed's price
        if (!useCustomGasPrice) {
          setCustomGasPrice(mockGasPrices[selectedSpeed].toString());
        }
        
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching gas prices:', error);
      setIsLoading(false);
    }
  };

  const fetchEthPrice = async () => {
    try {
      // In a real application, this would use a price feed API
      // For this example, we'll simulate the API call
      setTimeout(() => {
        setEthPrice(3000); // $3000 per ETH
      }, 500);
    } catch (error) {
      console.error('Error fetching ETH price:', error);
    }
  };

  const fetchHistoricalGasPrices = async () => {
    try {
      // In a real application, this would fetch historical gas prices
      // For this example, we'll simulate the API call
      setTimeout(() => {
        const mockHistoricalPrices = [
          { timestamp: Date.now() - 24 * 60 * 60 * 1000, price: 30 },
          { timestamp: Date.now() - 20 * 60 * 60 * 1000, price: 35 },
          { timestamp: Date.now() - 16 * 60 * 60 * 1000, price: 40 },
          { timestamp: Date.now() - 12 * 60 * 60 * 1000, price: 38 },
          { timestamp: Date.now() - 8 * 60 * 60 * 1000, price: 32 },
          { timestamp: Date.now() - 4 * 60 * 60 * 1000, price: 28 },
          { timestamp: Date.now(), price: 35 }
        ];
        setHistoricalPrices(mockHistoricalPrices);
      }, 800);
    } catch (error) {
      console.error('Error fetching historical gas prices:', error);
    }
  };

  const handleSpeedSelect = (speed) => {
    setSelectedSpeed(speed);
    setUseCustomGasPrice(false);
    setCustomGasPrice(gasPrices[speed].toString());
  };

  const handleCustomGasPriceChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomGasPrice(value);
      setUseCustomGasPrice(true);
    }
  };

  const handleGasLimitChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setGasLimit(value === '' ? 0 : parseInt(value));
    }
  };

  const toggleAdvanced = () => {
    setShowAdvanced(!showAdvanced);
  };

  const toggleGasPriceUnit = () => {
    if (gasPriceUnit === 'gwei') {
      // Convert gwei to wei
      setGasPriceUnit('wei');
      if (useCustomGasPrice && customGasPrice) {
        setCustomGasPrice((parseFloat(customGasPrice) * 1e9).toString());
      }
    } else {
      // Convert wei to gwei
      setGasPriceUnit('wei');
      if (useCustomGasPrice && customGasPrice) {
        setCustomGasPrice((parseFloat(customGasPrice) / 1e9).toString());
      }
    }
  };

  const calculateTotalGasFee = (gasPrice, gasLimit) => {
    const gasPriceInEth = gasPriceUnit === 'gwei' 
      ? gasPrice * 1e-9 // Convert gwei to ETH
      : gasPrice * 1e-18; // Convert wei to ETH
    
    return gasPriceInEth * gasLimit;
  };

  const getGasFeeInUsd = (gasPrice, gasLimit) => {
    const totalEth = calculateTotalGasFee(gasPrice, gasLimit);
    return totalEth * ethPrice;
  };

  const getSpeedClass = (speed) => {
    if (useCustomGasPrice) return '';
    return selectedSpeed === speed ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:border-primary-400' : '';
  };

  const getGasPriceWithUnit = (price) => {
    if (gasPriceUnit === 'gwei') {
      return `${price} Gwei`;
    } else {
      return `${price * 1e9} Wei`;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate gas price trend (up, down, or stable)
  const getGasPriceTrend = () => {
    if (historicalPrices.length < 2) return 'stable';
    
    const latest = historicalPrices[historicalPrices.length - 1].price;
    const previous = historicalPrices[historicalPrices.length - 2].price;
    
    const percentChange = ((latest - previous) / previous) * 100;
    
    if (percentChange > 5) return 'up';
    if (percentChange < -5) return 'down';
    return 'stable';
  };

  const trend = getGasPriceTrend();
  const trendIcon = trend === 'up' ? <FaArrowUp className="text-red-500" /> : 
                    trend === 'down' ? <FaArrowDown className="text-green-500" /> : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-3">
            <FaGasPump />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Gas Fee Estimator</h3>
        </div>
        {trendIcon && (
          <div className="flex items-center text-sm">
            {trendIcon}
            <span className={`ml-1 ${trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {trend === 'up' ? 'Rising' : 'Falling'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner size="small" text="Loading gas prices..." />
          </div>
        ) : (
          <>
            {/* Gas Price Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Transaction Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleSpeedSelect('slow')}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getSpeedClass('slow')}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Slow</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{getGasPriceWithUnit(gasPrices.slow)}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">~5 min</div>
                </button>
                <button
                  onClick={() => handleSpeedSelect('average')}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getSpeedClass('average')}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Average</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{getGasPriceWithUnit(gasPrices.average)}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">~1 min</div>
                </button>
                <button
                  onClick={() => handleSpeedSelect('fast')}
                  className={`p-3 border rounded-lg text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${getSpeedClass('fast')}`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">Fast</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{getGasPriceWithUnit(gasPrices.fast)}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">&lt;30 sec</div>
                </button>
              </div>
            </div>

            {/* Custom Gas Price */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Gas Price ({gasPriceUnit})
                </label>
                <button
                  onClick={toggleGasPriceUnit}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  Switch to {gasPriceUnit === 'gwei' ? 'Wei' : 'Gwei'}
                </button>
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={customGasPrice}
                  onChange={handleCustomGasPriceChange}
                  className="flex-grow px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter gas price in ${gasPriceUnit}`}
                />
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              onClick={toggleAdvanced}
              className="flex items-center text-sm text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 mb-4"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gas Limit
                  </label>
                  <input
                    type="text"
                    value={gasLimit}
                    onChange={handleGasLimitChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter gas limit"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <FaInfoCircle className="inline mr-1" />
                    Standard ETH transfer: 21,000. Smart contracts may require more.
                  </p>
                </div>

                {/* Historical Gas Prices */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <FaHistory className="inline mr-1" /> Gas Price History (24h)
                  </label>
                  <div className="h-20 flex items-end space-x-1">
                    {historicalPrices.map((item, index) => {
                      const maxPrice = Math.max(...historicalPrices.map(p => p.price));
                      const height = (item.price / maxPrice) * 100;
                      
                      return (
                        <div key={index} className="flex flex-col items-center" style={{ height: '100%' }}>
                          <div 
                            className="w-6 bg-primary-500 dark:bg-primary-400 rounded-t" 
                            style={{ height: `${height}%` }}
                            title={`${item.price} Gwei at ${formatTimestamp(item.timestamp)}`}
                          ></div>
                          {index % 2 === 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatTimestamp(item.timestamp)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Fee Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Fee Summary</h4>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gas Price:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {useCustomGasPrice 
                    ? getGasPriceWithUnit(parseFloat(customGasPrice) || 0)
                    : getGasPriceWithUnit(gasPrices[selectedSpeed])}
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Gas Limit:</span>
                <span className="text-sm text-gray-900 dark:text-white">{gasLimit}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Fee:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {calculateTotalGasFee(
                    useCustomGasPrice ? (parseFloat(customGasPrice) || 0) : gasPrices[selectedSpeed],
                    gasLimit
                  ).toFixed(6)} ETH
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600 mt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Cost:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${getGasFeeInUsd(
                    useCustomGasPrice ? (parseFloat(customGasPrice) || 0) : gasPrices[selectedSpeed],
                    gasLimit
                  ).toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default GasFeeEstimator;

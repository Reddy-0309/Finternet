import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaChartLine, FaExchangeAlt, FaInfoCircle, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAssetPriceHistory, getAssetMarketTrends } from '../features/assets/assetSlice';

// Simple chart component for price history
const PriceHistoryChart = ({ priceHistory }) => {
  if (!priceHistory || priceHistory.length === 0) {
    return <div className="text-center p-4">No price history available</div>;
  }

  const maxValue = Math.max(...priceHistory.map(item => item.value));
  const minValue = Math.min(...priceHistory.map(item => item.value));
  const range = maxValue - minValue;
  const chartHeight = 200;

  return (
    <div className="p-4">
      <div className="flex justify-between mb-2">
        <span className="text-xs text-gray-500">{priceHistory[0].date}</span>
        <span className="text-xs text-gray-500">{priceHistory[priceHistory.length - 1].date}</span>
      </div>
      <div className="relative h-52">
        <div className="absolute left-0 top-0 text-xs text-gray-500">${maxValue.toLocaleString()}</div>
        <div className="absolute left-0 bottom-0 text-xs text-gray-500">${minValue.toLocaleString()}</div>
        <div className="flex items-end h-full">
          {priceHistory.map((item, index) => {
            const height = range === 0 ? 100 : ((item.value - minValue) / range) * chartHeight;
            const color = index > 0 && item.value > priceHistory[index - 1].value ? 'bg-green-500' : 'bg-red-500';
            return (
              <div key={index} className="flex-1 flex flex-col items-center" title={`${item.date}: $${item.value.toLocaleString()}`}>
                <div className={`w-2 ${color}`} style={{ height: `${height}px` }}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Market trends component
const MarketTrends = ({ trends }) => {
  if (!trends) {
    return <div className="text-center p-4">No market trends available</div>;
  }

  const getTrendIcon = (forecast) => {
    if (forecast.includes('Positive')) {
      return <FaArrowUp className="text-green-500" />;
    } else if (forecast.includes('Negative')) {
      return <FaArrowDown className="text-red-500" />;
    } else {
      return <FaEquals className="text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <FaChartLine className="mr-2 text-primary-500" />
        Market Trends
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="border-r pr-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Growth Rate</p>
            <p className="text-lg font-semibold">{trends.growthRate}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Market Volume</p>
            <p className="text-lg font-semibold">{trends.marketVolume}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Return</p>
            <p className="text-lg font-semibold">{trends.averageReturn}</p>
          </div>
        </div>
        <div className="pl-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500">Risk Level</p>
            <p className="text-lg font-semibold">{trends.riskLevel}</p>
          </div>
          <div className="mb-4">
            <p className="text-sm text-gray-500">Liquidity Index</p>
            <p className="text-lg font-semibold">{trends.liquidityIndex}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Forecast</p>
            <p className="text-lg font-semibold flex items-center">
              {getTrendIcon(trends.forecast)}
              <span className="ml-2">{trends.forecast}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetDetails = ({ asset, onClose }) => {
  const dispatch = useDispatch();
  const [priceHistory, setPriceHistory] = useState([]);
  const [marketTrends, setMarketTrends] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (asset) {
      // Load price history
      const loadPriceHistory = async () => {
        try {
          const result = await dispatch(getAssetPriceHistory(asset.id)).unwrap();
          setPriceHistory(result);
        } catch (error) {
          toast.error('Failed to load price history');
        }
      };

      // Load market trends
      const loadMarketTrends = async () => {
        try {
          const result = await dispatch(getAssetMarketTrends(asset.type)).unwrap();
          setMarketTrends(result);
        } catch (error) {
          toast.error('Failed to load market trends');
        }
      };

      loadPriceHistory();
      loadMarketTrends();
    }
  }, [asset, dispatch]);

  if (!asset) return null;

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full mx-auto">
      {/* Header */}
      <div className="bg-primary-600 text-white p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{asset.name}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-2 flex items-center">
          <span className="bg-primary-700 text-sm px-2 py-1 rounded-full">{asset.type}</span>
          <span className="ml-4 text-xl font-semibold">${asset.value.toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'details' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaInfoCircle className="inline-block mr-2" />
            Details
          </button>
          <button
            onClick={() => setActiveTab('priceHistory')}
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'priceHistory' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaChartLine className="inline-block mr-2" />
            Price History
          </button>
          <button
            onClick={() => setActiveTab('marketTrends')}
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${activeTab === 'marketTrends' ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FaExchangeAlt className="inline-block mr-2" />
            Market Trends
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700">{asset.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Asset Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ID:</span>
                    <span className="text-gray-900 font-medium">{asset.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Token ID:</span>
                    <span className="text-gray-900 font-medium">{asset.tokenId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Owner ID:</span>
                    <span className="text-gray-900 font-medium">{asset.ownerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900 font-medium">{new Date(asset.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Additional Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{asset.metadata}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'priceHistory' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Price History (Last 12 Months)</h3>
            <PriceHistoryChart priceHistory={priceHistory} />
          </div>
        )}

        {activeTab === 'marketTrends' && (
          <MarketTrends trends={marketTrends} />
        )}
      </div>
    </div>
  );
};

export default AssetDetails;

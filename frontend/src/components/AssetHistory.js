import React from 'react';
import { FaExchangeAlt, FaPlus, FaChartLine, FaEdit } from 'react-icons/fa';

function AssetHistory({ asset }) {
  // This would typically come from an API call
  // For demo purposes, we're generating mock history data
  const generateMockHistory = (asset) => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return [
      {
        id: 1,
        type: 'created',
        timestamp: new Date(now - oneDay * 30).toISOString(), // 30 days ago
        details: 'Asset was created and tokenized',
        value: asset.value * 0.9 // 10% less than current value
      },
      {
        id: 2,
        type: 'value_change',
        timestamp: new Date(now - oneDay * 20).toISOString(), // 20 days ago
        details: 'Value increased by 5%',
        value: asset.value * 0.945 // 5% increase from previous value
      },
      {
        id: 3,
        type: 'transfer',
        timestamp: new Date(now - oneDay * 15).toISOString(), // 15 days ago
        details: 'Transferred from user_123456 to current owner',
        value: asset.value * 0.95
      },
      {
        id: 4,
        type: 'value_change',
        timestamp: new Date(now - oneDay * 7).toISOString(), // 7 days ago
        details: 'Value increased by 5%',
        value: asset.value * 0.95
      },
      {
        id: 5,
        type: 'metadata_update',
        timestamp: new Date(now - oneDay * 3).toISOString(), // 3 days ago
        details: 'Metadata was updated',
        value: asset.value
      }
    ];
  };
  
  const history = generateMockHistory(asset);
  
  const getEventIcon = (type) => {
    switch (type) {
      case 'created':
        return <FaPlus className="text-green-500" />;
      case 'transfer':
        return <FaExchangeAlt className="text-blue-500" />;
      case 'value_change':
        return <FaChartLine className="text-purple-500" />;
      case 'metadata_update':
        return <FaEdit className="text-yellow-500" />;
      default:
        return <FaEdit className="text-gray-500" />;
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Asset History</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Timeline events */}
        <div className="space-y-6 relative">
          {history.map((event) => (
            <div key={event.id} className="flex items-start">
              {/* Timeline dot */}
              <div className="absolute left-4 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary-500 transform -translate-x-1/2 mt-1.5"></div>
              
              {/* Event icon */}
              <div className="bg-white rounded-full p-1.5 mr-4 ml-6">
                {getEventIcon(event.type)}
              </div>
              
              {/* Event content */}
              <div className="flex-grow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <p className="text-sm font-medium text-gray-900">
                    {event.type === 'created' && 'Asset Created'}
                    {event.type === 'transfer' && 'Asset Transferred'}
                    {event.type === 'value_change' && 'Value Changed'}
                    {event.type === 'metadata_update' && 'Metadata Updated'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(event.timestamp)}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{event.details}</p>
                {event.type === 'value_change' && (
                  <p className="text-sm font-medium mt-1">
                    Value: <span className="text-gray-900">${event.value.toLocaleString()}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AssetHistory;

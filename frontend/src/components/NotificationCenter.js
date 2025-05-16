import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell, FaCheck, FaExchangeAlt, FaPlus, FaTimes, FaShieldAlt, FaMoneyBillWave, FaCog } from 'react-icons/fa';
import { getNotifications, markAsRead, markAllAsRead, reset, addNotification } from '../features/notifications/notificationSlice';
import notificationService from '../services/notificationService';
import websocketService from '../services/websocketService';
import { toast } from 'react-toastify';
import LoadingSpinner from './LoadingSpinner';

function NotificationCenter() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(websocketService.getNotificationPreferences());
  
  const dispatch = useDispatch();
  const { notifications, unreadCount, isLoading, isError, message } = useSelector(
    (state) => state.notifications
  );
  const { user } = useSelector((state) => state.auth);
  
  useEffect(() => {
    dispatch(getNotifications());
    
    // Initialize WebSocket connection for real-time notifications
    if (user) {
      const socket = notificationService.initializeNotificationSocket(user.token);
      
      // Register handler for incoming notifications
      const unregisterHandler = notificationService.registerNotificationHandler((notification) => {
        dispatch(addNotification(notification));
        
        // Only show toast notifications if they're enabled in preferences
        if (preferences.enabled) {
          // Don't show toast for low-priority notifications if user has set frequency to low
          const isLowPriority = ['asset_created', 'price_alert'].includes(notification.type);
          if (isLowPriority && preferences.frequency === 'low') {
            // Skip toast for low priority notifications when frequency is low
            return;
          }
          
          toast.info(`${notification.title}: ${notification.message}`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        }
      });
      
      return () => {
        unregisterHandler();
        dispatch(reset());
      };
    }
    
    return () => {
      dispatch(reset());
    };
  }, [dispatch, user, preferences]);
  
  useEffect(() => {
    if (isError) {
      toast.error(message);
    }
  }, [isError, message]);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowPreferences(false); // Close preferences when toggling notifications
  };
  
  const togglePreferences = () => {
    setShowPreferences(!showPreferences);
    setShowNotifications(false); // Close notifications when toggling preferences
  };
  
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id));
  };
  
  const updatePreference = (key, value) => {
    const newPreferences = { ...preferences };
    
    if (key.includes('.')) {
      // Handle nested properties like 'types.asset_created'
      const [parent, child] = key.split('.');
      newPreferences[parent] = { ...newPreferences[parent], [child]: value };
    } else {
      newPreferences[key] = value;
    }
    
    // Update local state
    setPreferences(newPreferences);
    
    // Update service state
    websocketService.updateNotificationPreferences(newPreferences);
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'asset_created':
        return <FaPlus className="text-green-500 dark:text-green-400" />;
      case 'asset_transferred':
        return <FaExchangeAlt className="text-blue-500 dark:text-blue-400" />;
      case 'price_alert':
        return <FaBell className="text-yellow-500 dark:text-yellow-400" />;
      case 'security_alert':
        return <FaShieldAlt className="text-red-500 dark:text-red-400" />;
      case 'payment_received':
        return <FaMoneyBillWave className="text-green-500 dark:text-green-400" />;
      case 'mfa_enabled':
        return <FaShieldAlt className="text-purple-500 dark:text-purple-400" />;
      default:
        return <FaBell className="text-gray-500 dark:text-gray-400" />;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button 
          onClick={toggleNotifications}
          className="relative p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          aria-label="Notifications"
        >
          <FaBell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 dark:bg-red-500 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={togglePreferences}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          aria-label="Notification Settings"
        >
          <FaCog size={18} />
        </button>
      </div>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="py-2 px-3 bg-gray-100 dark:bg-gray-700 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <LoadingSpinner size="small" text="Loading notifications..." />
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="ml-4 flex-shrink-0 flex">
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="bg-white dark:bg-gray-700 rounded-md inline-flex text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 p-1"
                          aria-label="Mark as read"
                        >
                          <span className="sr-only">Mark as read</span>
                          <FaCheck className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>No notifications</p>
                <p className="mt-1 text-xs">You'll see notifications here when there's activity in your account</p>
              </div>
            )}
          </div>
          <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-center text-gray-500 dark:text-gray-400">
            Click a notification to mark it as read
          </div>
        </div>
      )}
      
      {showPreferences && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
          <div className="py-2 px-3 bg-gray-100 dark:bg-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Notification Settings</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* Enable/Disable All Notifications */}
            <div className="flex items-center justify-between">
              <label htmlFor="enable-notifications" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Enable Notifications
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="enable-notifications"
                  checked={preferences.enabled}
                  onChange={(e) => updatePreference('enabled', e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out"
                  style={{
                    right: preferences.enabled ? '0' : '4px',
                    borderColor: preferences.enabled ? '#4F46E5' : '#D1D5DB',
                    transform: preferences.enabled ? 'translateX(100%)' : 'translateX(0)',
                    backgroundColor: preferences.enabled ? '#4F46E5' : 'white'
                  }}
                />
                <label
                  htmlFor="enable-notifications"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"
                  style={{ backgroundColor: preferences.enabled ? '#C7D2FE' : '#D1D5DB' }}
                ></label>
              </div>
            </div>
            
            {/* Notification Frequency */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Frequency</label>
              <div className="flex space-x-2">
                {['low', 'medium', 'high'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updatePreference('frequency', freq)}
                    className={`px-3 py-1 text-xs rounded-full ${
                      preferences.frequency === freq
                        ? 'bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-200 font-medium'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preferences.frequency === 'low' && 'Fewer notifications, only important alerts'}
                {preferences.frequency === 'medium' && 'Balanced notification frequency'}
                {preferences.frequency === 'high' && 'Get notified about all activity'}
              </p>
            </div>
            
            {/* Notification Types */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notification Types</label>
              <div className="space-y-2">
                {Object.entries(preferences.types).map(([type, enabled]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2">{getNotificationIcon(type)}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                    <div className="relative inline-block w-8 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        id={`enable-${type}`}
                        checked={enabled}
                        onChange={(e) => updatePreference(`types.${type}`, e.target.checked)}
                        className="toggle-checkbox absolute block w-4 h-4 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        style={{
                          right: enabled ? '0' : '4px',
                          borderColor: enabled ? '#4F46E5' : '#D1D5DB',
                          transform: enabled ? 'translateX(100%)' : 'translateX(0)',
                          backgroundColor: enabled ? '#4F46E5' : 'white'
                        }}
                      />
                      <label
                        htmlFor={`enable-${type}`}
                        className="toggle-label block overflow-hidden h-4 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"
                        style={{ backgroundColor: enabled ? '#C7D2FE' : '#D1D5DB' }}
                      ></label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="py-2 px-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 text-xs text-center text-gray-500 dark:text-gray-400">
            Settings are saved automatically
          </div>
        </div>
      )}
    </div>
  );
}

// Add some CSS for toggle switches
const style = document.createElement('style');
style.textContent = `
  .toggle-checkbox:checked {
    right: 0;
    border-color: #4F46E5;
  }
  .toggle-checkbox:checked + .toggle-label {
    background-color: #C7D2FE;
  }
`;
document.head.appendChild(style);

export default NotificationCenter;

// WebSocket service for real-time notifications
let socket = null;
let reconnectTimer = null;
let messageHandlers = [];

// Initialize WebSocket connection
const initializeWebSocket = (token) => {
  // Close existing connection if any
  if (socket) {
    socket.close();
  }

  // Clear any existing reconnect timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // In a real app, this would connect to a real WebSocket server
  // For now, we'll simulate WebSocket events
  console.log('Initializing mock WebSocket connection');
  
  // Create a mock socket object
  socket = {
    readyState: 1, // WebSocket.OPEN
    send: (data) => {
      console.log('Mock WebSocket - Sent data:', data);
    },
    close: () => {
      console.log('Mock WebSocket - Connection closed');
      socket.readyState = 3; // WebSocket.CLOSED
      socket = null;
    }
  };

  // Simulate connection events
  setTimeout(() => {
    triggerEvent('open', {});
    console.log('Mock WebSocket - Connection opened');
    
    // Simulate receiving notifications periodically
    startMockNotifications();
  }, 500);

  return socket;
};

// Add event handler
const addMessageHandler = (handler) => {
  messageHandlers.push(handler);
  return () => {
    messageHandlers = messageHandlers.filter(h => h !== handler);
  };
};

// Trigger event to all handlers
const triggerEvent = (type, data) => {
  const event = { type, data };
  messageHandlers.forEach(handler => handler(event));
};

// User notification preferences (would be stored in user settings in a real app)
let userNotificationPreferences = {
  enabled: true,
  frequency: 'low', // 'low', 'medium', 'high'
  types: {
    asset_created: true,
    asset_transferred: true,
    price_alert: true,
    security_alert: true,
    payment_received: true,
    mfa_enabled: true
  }
};

// Get notification preferences
const getNotificationPreferences = () => {
  return userNotificationPreferences;
};

// Update notification preferences
const updateNotificationPreferences = (preferences) => {
  userNotificationPreferences = {
    ...userNotificationPreferences,
    ...preferences
  };
  return userNotificationPreferences;
};

// Simulate periodic notifications with respect to user preferences
const startMockNotifications = () => {
  // Determine interval based on frequency preference
  let interval = 120000; // Default: 2 minutes (low frequency)
  if (userNotificationPreferences.frequency === 'medium') {
    interval = 60000; // 1 minute
  } else if (userNotificationPreferences.frequency === 'high') {
    interval = 30000; // 30 seconds
  }
  
  // Only start notifications if they're enabled
  if (!userNotificationPreferences.enabled) {
    console.log('Mock WebSocket - Notifications disabled by user preferences');
    return null;
  }
  
  const notificationInterval = setInterval(() => {
    if (!socket || socket.readyState !== 1) {
      clearInterval(notificationInterval);
      return;
    }
    
    // Filter notification types based on user preferences
    const notificationTypes = Object.entries(userNotificationPreferences.types)
      .filter(([_, enabled]) => enabled)
      .map(([type]) => type);
    
    // If no notification types are enabled, don't send any
    if (notificationTypes.length === 0) {
      return;
    }
    
    const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    
    let title, message;
    switch (randomType) {
      case 'asset_created':
        title = 'New Asset Created';
        message = 'Your new asset has been successfully tokenized.';
        break;
      case 'asset_transferred':
        title = 'Asset Transferred';
        message = 'Your asset transfer has been completed.';
        break;
      case 'price_alert':
        title = 'Price Alert';
        message = `One of your assets has ${Math.random() > 0.5 ? 'increased' : 'decreased'} in value by ${(Math.random() * 10).toFixed(2)}%.`;
        break;
      case 'security_alert':
        title = 'Security Alert';
        message = 'A new login was detected from a new device.';
        break;
      case 'payment_received':
        title = 'Payment Received';
        message = `You have received a new payment of ${(Math.random() * 2).toFixed(2)} ETH.`;
        break;
      case 'mfa_enabled':
        title = 'Two-Factor Authentication';
        message = 'Your account security settings have been updated.';
        break;
      default:
        title = 'Notification';
        message = 'You have a new notification.';
    }
    
    const notification = {
      id: Date.now(),
      type: randomType,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    triggerEvent('message', {
      type: 'notification',
      data: notification
    });
    
    console.log('Mock WebSocket - Received notification:', notification);
  }, interval);
  
  // Only show welcome notification if security alerts are enabled
  if (userNotificationPreferences.types.security_alert) {
    setTimeout(() => {
      const notification = {
        id: Date.now(),
        type: 'security_alert',
        title: 'Welcome Back',
        message: 'You have successfully logged in to your account.',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      triggerEvent('message', {
        type: 'notification',
        data: notification
      });
      
      console.log('Mock WebSocket - Received initial notification:', notification);
    }, 2000);
  }
  
  return notificationInterval;
};

// Check if WebSocket is connected
const isConnected = () => {
  return socket && socket.readyState === 1; // WebSocket.OPEN
};

// Disconnect WebSocket
const disconnect = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
  
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const websocketService = {
  initializeWebSocket,
  addMessageHandler,
  isConnected,
  disconnect,
  getNotificationPreferences,
  updateNotificationPreferences
};

export default websocketService;

import axios from 'axios';
import websocketService from './websocketService';

// Create a simple axios instance without complex configuration
const API_URL = 'http://localhost:8000/api';

// Get all notifications
const getNotifications = async () => {
  try {
    // In a real app, this would fetch from an API
    // For now, we'll use mock data
    return getMockNotifications();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
  try {
    // In a real app, this would call an API
    // For now, we'll simulate it with mock data
    const notifications = getMockNotifications();
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return notification;
    }
    throw new Error('Notification not found');
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    // In a real app, this would call an API
    // For now, we'll simulate it
    return { success: true };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Initialize WebSocket connection for real-time notifications
const initializeNotificationSocket = (token) => {
  return websocketService.initializeWebSocket(token);
};

// Register a notification handler
const registerNotificationHandler = (callback) => {
  return websocketService.addMessageHandler((event) => {
    if (event.type === 'message' && event.data.type === 'notification') {
      callback(event.data.data);
    }
  });
};

// Helper function to get mock notifications
const getMockNotifications = () => {
  return [
    {
      id: 1,
      type: 'asset_created',
      title: 'New Asset Created',
      message: 'Your new asset has been successfully tokenized.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      read: false
    },
    {
      id: 2,
      type: 'asset_transferred',
      title: 'Asset Transferred',
      message: 'Your asset transfer has been completed.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      read: false
    },
    {
      id: 3,
      type: 'price_alert',
      title: 'Price Alert',
      message: 'One of your assets has increased in value by 5%.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      read: true
    },
    {
      id: 4,
      type: 'security_alert',
      title: 'New Login Detected',
      message: 'A new login was detected from a new device.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      read: false
    },
    {
      id: 5,
      type: 'payment_received',
      title: 'Payment Received',
      message: 'You have received a new payment of 0.5 ETH.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
      read: false
    },
    {
      id: 6,
      type: 'mfa_enabled',
      title: 'Two-Factor Authentication Enabled',
      message: 'Your account is now protected with two-factor authentication.',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      read: true
    }
  ];
};

const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  initializeNotificationSocket,
  registerNotificationHandler
};

export default notificationService;

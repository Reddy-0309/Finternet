import axios from 'axios';

const API_URL = process.env.REACT_APP_LEDGER_API_URL || 'http://localhost:8002/api';

// Create axios instance
const ledgerApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
ledgerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get all transactions
const getTransactions = async () => {
  try {
    const response = await ledgerApi.get('/transactions');
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return getMockTransactions();
  }
};

// Get transaction by ID
const getTransactionById = async (id) => {
  try {
    const response = await ledgerApi.get(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    const mockTransactions = getMockTransactions();
    return mockTransactions.find(tx => tx.id === id) || null;
  }
};

// Create a new transaction
const createTransaction = async (transactionData) => {
  try {
    const response = await ledgerApi.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    console.error('Error creating transaction:', error);
    // In development/offline mode, create a mock transaction
    return createMockTransaction(transactionData);
  }
};

// Mock functions for development and offline mode
const getMockTransactions = () => {
  const mockTransactions = localStorage.getItem('mockTransactions');
  return mockTransactions ? JSON.parse(mockTransactions) : [];
};

const createMockTransaction = (transactionData) => {
  const mockTransactions = getMockTransactions();
  
  // Generate a mock transaction
  const newTransaction = {
    id: `mock-tx-${Date.now()}`,
    asset_id: transactionData.asset_id,
    asset_name: transactionData.asset_name,
    type_: transactionData.type_,
    from: transactionData.from || localStorage.getItem('userId'),
    to: transactionData.to,
    status: 'completed',
    timestamp: new Date().toISOString(),
    blockchain_data: transactionData.blockchain_data,
  };
  
  // Save to mock storage
  mockTransactions.push(newTransaction);
  localStorage.setItem('mockTransactions', JSON.stringify(mockTransactions));
  
  return newTransaction;
};

const ledgerService = {
  getTransactions,
  getTransactionById,
  createTransaction,
  getMockTransactions,
};

export default ledgerService;

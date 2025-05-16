import axios from 'axios';

const API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'http://localhost:8003/api';

// Create axios instance
const paymentApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
paymentApi.interceptors.request.use(
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

// Get all payments
const getPayments = async () => {
  try {
    const response = await paymentApi.get('/payments');
    return response.data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return getMockPayments();
  }
};

// Get payment by ID
const getPaymentById = async (id) => {
  try {
    const response = await paymentApi.get(`/payments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching payment ${id}:`, error);
    const mockPayments = getMockPayments();
    return mockPayments.find(payment => payment.id === id) || null;
  }
};

// Create a new payment
const createPayment = async (paymentData) => {
  try {
    const response = await paymentApi.post('/payments', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    // In development/offline mode, create a mock payment
    return createMockPayment(paymentData);
  }
};

// Get exchange rates
const getExchangeRates = async () => {
  try {
    const response = await paymentApi.get('/exchange-rates');
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return getMockExchangeRates();
  }
};

// Mock functions for development and offline mode
const getMockPayments = () => {
  const mockPayments = localStorage.getItem('mockPayments');
  return mockPayments ? JSON.parse(mockPayments) : [];
};

const createMockPayment = (paymentData) => {
  const mockPayments = getMockPayments();
  const userId = localStorage.getItem('userId') || 'user-1';
  
  // Calculate exchange rate and crypto amount
  const exchangeRate = getMockExchangeRate(paymentData.crypto_currency);
  const cryptoAmount = paymentData.payment_type === 'fiat_to_crypto' 
    ? paymentData.amount / exchangeRate 
    : paymentData.amount * exchangeRate;
  
  // Generate a mock payment
  const newPayment = {
    id: `mock-payment-${Date.now()}`,
    user_id: userId,
    amount: paymentData.amount,
    currency: paymentData.currency,
    payment_type: paymentData.payment_type,
    status: 'pending',
    crypto_address: paymentData.crypto_address,
    crypto_currency: paymentData.crypto_currency,
    crypto_amount: cryptoAmount,
    exchange_rate: exchangeRate,
    timestamp: new Date().toISOString(),
    metadata: paymentData.metadata,
  };
  
  // Save to mock storage
  mockPayments.push(newPayment);
  localStorage.setItem('mockPayments', JSON.stringify(mockPayments));
  
  // Simulate async completion
  setTimeout(() => {
    const storedPayments = JSON.parse(localStorage.getItem('mockPayments'));
    const index = storedPayments.findIndex(p => p.id === newPayment.id);
    if (index !== -1) {
      storedPayments[index].status = 'completed';
      localStorage.setItem('mockPayments', JSON.stringify(storedPayments));
    }
  }, 2000);
  
  return newPayment;
};

const getMockExchangeRate = (cryptoCurrency) => {
  switch (cryptoCurrency) {
    case 'BTC':
      return 50000.0;
    case 'ETH':
      return 3000.0;
    case 'USDC':
      return 1.0;
    default:
      return 1.0;
  }
};

const getMockExchangeRates = () => {
  return {
    rates: {
      BTC: 50000.0,
      ETH: 3000.0,
      USDC: 1.0,
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.75
    },
    timestamp: new Date().toISOString()
  };
};

const paymentService = {
  getPayments,
  getPaymentById,
  createPayment,
  getExchangeRates,
  getMockPayments,
  getMockExchangeRates
};

export default paymentService;

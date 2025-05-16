import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Get all transactions
const getTransactions = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/transactions`, config);
  return response.data;
};

// Get transaction by ID
const getTransactionById = async (transactionId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/transactions/${transactionId}`, config);
  return response.data;
};

const transactionService = {
  getTransactions,
  getTransactionById,
};

export default transactionService;

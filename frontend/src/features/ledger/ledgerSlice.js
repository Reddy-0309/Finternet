import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ledgerService from '../../services/ledgerService';

// Initial state
const initialState = {
  transactions: [],
  selectedTransaction: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all transactions
export const getTransactions = createAsyncThunk(
  'ledger/getTransactions',
  async (_, thunkAPI) => {
    try {
      return await ledgerService.getTransactions();
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch transactions';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get transaction by ID
export const getTransactionById = createAsyncThunk(
  'ledger/getTransactionById',
  async (id, thunkAPI) => {
    try {
      return await ledgerService.getTransactionById(id);
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch transaction';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new transaction
export const createTransaction = createAsyncThunk(
  'ledger/createTransaction',
  async (transactionData, thunkAPI) => {
    try {
      return await ledgerService.createTransaction(transactionData);
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to create transaction';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Ledger slice
export const ledgerSlice = createSlice({
  name: 'ledger',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedTransaction: (state) => {
      state.selectedTransaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get transactions
      .addCase(getTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // If API call fails, try to get mock transactions
        state.transactions = ledgerService.getMockTransactions();
      })
      // Get transaction by ID
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedTransaction = action.payload;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transactions.push(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearSelectedTransaction } = ledgerSlice.actions;
export default ledgerSlice.reducer;

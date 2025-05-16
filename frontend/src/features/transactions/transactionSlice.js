import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

const initialState = {
  transactions: [],
  transaction: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all transactions
export const getTransactions = createAsyncThunk(
  'transactions/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await transactionService.getTransactions(token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get transaction by ID
export const getTransactionById = createAsyncThunk(
  'transactions/getById',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await transactionService.getTransactionById(id, token);
    } catch (error) {
      const message = error.response?.data?.message || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    reset: (state) => initialState,
    clearTransaction: (state) => {
      state.transaction = null;
    },
  },
  extraReducers: (builder) => {
    builder
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
      })
      .addCase(getTransactionById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.transaction = action.payload;
      })
      .addCase(getTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearTransaction } = transactionSlice.actions;
export default transactionSlice.reducer;

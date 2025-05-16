import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService from '../../services/paymentService';

// Initial state
const initialState = {
  payments: [],
  selectedPayment: null,
  exchangeRates: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all payments
export const getPayments = createAsyncThunk(
  'payments/getPayments',
  async (_, thunkAPI) => {
    try {
      return await paymentService.getPayments();
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch payments';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get payment by ID
export const getPaymentById = createAsyncThunk(
  'payments/getPaymentById',
  async (id, thunkAPI) => {
    try {
      return await paymentService.getPaymentById(id);
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch payment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new payment
export const createPayment = createAsyncThunk(
  'payments/createPayment',
  async (paymentData, thunkAPI) => {
    try {
      return await paymentService.createPayment(paymentData);
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to create payment';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get exchange rates
export const getExchangeRates = createAsyncThunk(
  'payments/getExchangeRates',
  async (_, thunkAPI) => {
    try {
      return await paymentService.getExchangeRates();
    } catch (error) {
      const message = error.response?.data?.error || error.message || 'Failed to fetch exchange rates';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Payment slice
export const paymentSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearSelectedPayment: (state) => {
      state.selectedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payments
      .addCase(getPayments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.payments = action.payload;
      })
      .addCase(getPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // If API call fails, try to get mock payments
        state.payments = paymentService.getMockPayments();
      })
      // Get payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.selectedPayment = action.payload;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create payment
      .addCase(createPayment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.payments.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get exchange rates
      .addCase(getExchangeRates.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExchangeRates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.exchangeRates = action.payload;
      })
      .addCase(getExchangeRates.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // If API call fails, use mock exchange rates
        state.exchangeRates = paymentService.getMockExchangeRates();
      });
  },
});

export const { reset, clearSelectedPayment } = paymentSlice.actions;
export default paymentSlice.reducer;

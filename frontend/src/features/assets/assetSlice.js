import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import assetService from '../../services/assetService';

const initialState = {
  assets: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Get all assets
export const getAssets = createAsyncThunk(
  'assets/getAll',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await assetService.getAssets(token);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new asset - simplified to avoid object extension issues
export const createAsset = createAsyncThunk(
  'assets/create',
  async (assetData, thunkAPI) => {
    try {
      // Manually extract the data we need to avoid object extension issues
      const simpleAssetData = {
        name: assetData.name || '',
        type: assetData.type || 'other',
        description: assetData.description || '',
        value: parseFloat(assetData.value) || 0,
        metadata: assetData.metadata || ''
      };
      
      const token = thunkAPI.getState().auth.user?.token;
      const result = await assetService.createAsset(simpleAssetData, token);
      
      // Dispatch getAssets as a separate action to avoid issues
      setTimeout(() => {
        thunkAPI.dispatch(getAssets());
      }, 500);
      
      return result;
    } catch (error) {
      console.error('Error in createAsset thunk:', error);
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Transfer asset - simplified to avoid object extension issues
export const transferAsset = createAsyncThunk(
  'assets/transfer',
  async (transferData, thunkAPI) => {
    try {
      const { assetId, recipientAddress } = transferData;
      const token = thunkAPI.getState().auth.user?.token;
      const result = await assetService.transferAsset(assetId, recipientAddress, token);
      
      // Dispatch getAssets as a separate action to avoid issues
      setTimeout(() => {
        thunkAPI.dispatch(getAssets());
      }, 500);
      
      return result;
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get asset price history
export const getAssetPriceHistory = createAsyncThunk(
  'assets/getPriceHistory',
  async (assetId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user?.token;
      return await assetService.getAssetPriceHistory(assetId, token);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get asset market trends
export const getAssetMarketTrends = createAsyncThunk(
  'assets/getMarketTrends',
  async (assetType, thunkAPI) => {
    try {
      return await assetService.getAssetMarketTrends(assetType);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const assetSlice = createSlice({
  name: 'assets',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssets.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.assets = action.payload;
      })
      .addCase(getAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        // Don't clear assets if we already have some - this helps with offline mode
        if (state.assets.length === 0) {
          state.assets = [];
        }
      })
      .addCase(createAsset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createAsset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Asset created';
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(transferAsset.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(transferAsset.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Asset transferred';
      })
      .addCase(transferAsset.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAssetPriceHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssetPriceHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Price history retrieved';
      })
      .addCase(getAssetPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAssetMarketTrends.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAssetMarketTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = 'Market trends retrieved';
      })
      .addCase(getAssetMarketTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = assetSlice.actions;
export default assetSlice.reducer;

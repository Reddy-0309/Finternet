import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user ? user : null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
  mfaRequired: false,
  mfaSetup: null,
};

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      return await authService.login(userData);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Verify MFA code
export const verifyMfa = createAsyncThunk(
  'auth/verifyMfa',
  async (code, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const userId = state.auth.user?.user?.id;
      return await authService.verifyMfa(code, userId);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Setup MFA
export const setupMfa = createAsyncThunk(
  'auth/setupMfa',
  async (_, thunkAPI) => {
    try {
      return await authService.setupMfa();
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update MFA preferences
export const updateMfaPreferences = createAsyncThunk(
  'auth/updateMfaPreferences',
  async (preferences, thunkAPI) => {
    try {
      return await authService.updateMfaPreferences(preferences);
    } catch (error) {
      const message = error.response?.data?.error || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearMfaSetup: (state) => {
      state.mfaSetup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.mfaRequired = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.mfaRequired = action.payload.mfaRequired || false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.mfaRequired = false;
      })
      .addCase(verifyMfa.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.mfaRequired = false;
      })
      .addCase(verifyMfa.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(setupMfa.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(setupMfa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.mfaSetup = action.payload;
      })
      .addCase(setupMfa.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateMfaPreferences.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMfaPreferences.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateMfaPreferences.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.mfaRequired = false;
        state.mfaSetup = null;
      });
  },
});

export const { reset, clearMfaSetup } = authSlice.actions;
export default authSlice.reducer;

import axios from 'axios';

// Create a simple axios instance without any complex configuration
const API_URL = 'http://localhost:8000/api';

// Register user
const register = async (userData) => {
  try {
    console.log('Attempting to register with:', userData.email);
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }

    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Login user
const login = async (userData) => {
  try {
    console.log('Attempting to login with:', userData.email);
    console.log('API URL being used:', `${API_URL}/auth/login`);
    const response = await axios.post(`${API_URL}/auth/login`, userData);

    // Check if MFA is required
    if (response.data.mfaRequired) {
      console.log('MFA required for login');
      return response.data;
    }

    if (response.data) {
      console.log('Login successful, storing user data');
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
      }
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    throw error;
  }
};

// Verify MFA code
const verifyMfa = async (code, userId) => {
  try {
    console.log('Verifying MFA code');
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await axios.post(
      `${API_URL}/auth/mfa/verify`, 
      { code }, 
      config
    );

    if (response.data) {
      console.log('MFA verification successful, storing user data');
      localStorage.setItem('user', JSON.stringify(response.data));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
      }
    }

    return response.data;
  } catch (error) {
    console.error('MFA verification error:', error);
    throw error;
  }
};

// Setup MFA
const setupMfa = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await axios.post(
      `${API_URL}/auth/mfa/setup`, 
      {}, 
      config
    );

    return response.data;
  } catch (error) {
    console.error('MFA setup error:', error);
    throw error;
  }
};

// Update MFA preferences
const updateMfaPreferences = async (preferences) => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token;
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    
    const response = await axios.patch(
      `${API_URL}/auth/mfa/preferences`, 
      preferences, 
      config
    );

    return response.data;
  } catch (error) {
    console.error('MFA preferences update error:', error);
    throw error;
  }
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

const authService = {
  register,
  login,
  logout,
  verifyMfa,
  setupMfa,
  updateMfaPreferences,
};

export default authService;

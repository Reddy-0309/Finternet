import axios from 'axios';

// Create a secure axios instance with credentials support
const secureApi = axios.create({
  withCredentials: true, // Important for cookies
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for authentication
secureApi.interceptors.request.use(
  config => {
    // Get token from localStorage as fallback (for compatibility)
    const token = localStorage.getItem('token');
    
    // If token exists in localStorage, add it to Authorization header
    // This is a fallback - we prefer HTTP-only cookies
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add response interceptor for handling auth errors
secureApi.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear any stored tokens
      localStorage.removeItem('token');
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Enhanced login function that supports HTTP-only cookies
const secureLogin = async (credentials) => {
  try {
    const response = await secureApi.post('/api/auth/login', credentials);
    
    // Store token in localStorage as fallback
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Secure logout function that clears HTTP-only cookies
const secureLogout = async () => {
  try {
    await secureApi.post('/api/auth/logout');
    localStorage.removeItem('token');
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove local token even if API call fails
    localStorage.removeItem('token');
  }
};

// Function to check if user is authenticated
const isAuthenticated = () => {
  // Check for token in localStorage as fallback
  const token = localStorage.getItem('token');
  
  // In a real implementation, we would verify the token's validity
  return !!token;
};

// Function to refresh the authentication token
const refreshToken = async () => {
  try {
    const response = await secureApi.post('/api/auth/refresh');
    
    // Update token in localStorage as fallback
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export { secureApi, secureLogin, secureLogout, isAuthenticated, refreshToken };

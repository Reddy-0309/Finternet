import axios from 'axios';

// Use direct URL to asset service
const API_URL = 'http://localhost:8001/api';

// Flag to track if we should use mock data
let useMockData = true; // Start with mock data by default

// Mock data for assets when backend is not available
const mockAssets = [
  {
    id: 'asset_20250427001',
    ownerId: 'user_123456',
    name: 'Downtown Apartment',
    type: 'real-estate',
    description: 'Luxury apartment in downtown area',
    value: 450000,
    tokenId: 'token_20250427001',
    blockchainAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: 'Location: Downtown, Size: 1200 sq ft, Bedrooms: 2'
  },
  {
    id: 'asset_20250427002',
    ownerId: 'user_123456',
    name: 'Tech Company Shares',
    type: 'stocks',
    description: '1000 shares of a leading tech company',
    value: 250000,
    tokenId: 'token_20250427002',
    blockchainAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: 'Company: TechCorp, Shares: 1000, Purchase Date: 2025-01-15'
  }
];

// Check if backend is available
const isBackendAvailable = async () => {
  // If we've already determined to use mock data, don't keep checking
  if (useMockData) {
    return false;
  }
  
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 2000 });
    return response.status === 200;
  } catch (error) {
    console.log('Backend not available, using mock data');
    useMockData = true; // Set the flag to use mock data for future calls
    return false;
  }
};

// Get all assets
const getAssets = async (token) => {
  try {
    // Try to use real backend first
    if (await isBackendAvailable()) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/assets`, config);
      return response.data;
    } else {
      // Use mock data if backend is not available
      console.log('Using mock asset data');
      return [...mockAssets]; // Return a copy to avoid modification issues
    }
  } catch (error) {
    console.error('Get assets error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    // Set the flag to use mock data for future calls
    useMockData = true;
    // Return mock data as fallback
    return [...mockAssets]; // Return a copy to avoid modification issues
  }
};

// Get asset by ID
const getAssetById = async (id, token) => {
  try {
    // Try to use real backend first
    if (await isBackendAvailable()) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.get(`${API_URL}/assets/${id}`, config);
      return response.data;
    } else {
      // Use mock data if backend is not available
      const asset = mockAssets.find(a => a.id === id);
      if (!asset) {
        throw new Error('Asset not found');
      }
      return {...asset}; // Return a copy to avoid modification issues
    }
  } catch (error) {
    console.error('Get asset by ID error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    throw error;
  }
};

// Create asset
const createAsset = async (assetData, token) => {
  try {
    // Generate a wallet address for mock purposes
    const walletAddress = '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1';
    
    // Generate a mock token ID
    const tokenId = 'token_' + Date.now().toString();
    
    // Create a new asset object directly without using spread operator
    const newAsset = {
      id: 'asset_' + Date.now().toString(),
      name: assetData.name || '',
      type: assetData.type || 'other',
      description: assetData.description || '',
      value: parseFloat(assetData.value) || 0,
      metadata: assetData.metadata || '',
      tokenId: tokenId,
      blockchainAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      ownerId: walletAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Try to use real backend if available
    if (await isBackendAvailable()) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${API_URL}/assets`, newAsset, config);
      return response.data;
    } else {
      // Add to mock assets if backend is not available
      mockAssets.push({...newAsset}); // Add a copy to avoid modification issues
      return {...newAsset}; // Return a copy to avoid modification issues
    }
  } catch (error) {
    console.error('Create asset error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Transfer asset
const transferAsset = async (assetId, recipientAddress, token) => {
  try {
    // First, get the asset details
    const asset = await getAssetById(assetId, token);
    if (!asset) {
      throw new Error('Asset not found');
    }
    
    // Try to use real backend first to update the asset ownership
    if (await isBackendAvailable()) {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/assets/${assetId}/transfer`,
        { recipientAddress },
        config
      );
      return response.data;
    } else {
      // Handle mock transfer if backend is not available
      const assetIndex = mockAssets.findIndex(a => a.id === assetId);
      if (assetIndex === -1) {
        throw new Error('Asset not found');
      }
      
      // Create a new asset object with updated owner
      const updatedAsset = {
        ...mockAssets[assetIndex],
        ownerId: recipientAddress,
        updatedAt: new Date().toISOString()
      };
      
      // Replace in mock assets
      mockAssets[assetIndex] = updatedAsset;
      
      return {...updatedAsset}; // Return a copy to avoid modification issues
    }
  } catch (error) {
    console.error('Transfer asset error:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    throw error;
  }
};

// Get asset price history (new feature)
const getAssetPriceHistory = async (assetId, token) => {
  try {
    // For mock data, generate random price history
    const priceHistory = [];
    const asset = await getAssetById(assetId, token);
    const baseValue = asset.value;
    
    // Generate data for the last 12 months
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const randomFactor = 0.9 + (Math.random() * 0.2); // Random factor between 0.9 and 1.1
      priceHistory.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(baseValue * randomFactor)
      });
    }
    
    return priceHistory;
  } catch (error) {
    console.error('Get asset price history error:', error);
    throw error;
  }
};

// Get asset market trends (new feature)
const getAssetMarketTrends = async (assetType) => {
  try {
    // Mock market trends data
    const trends = {
      'real-estate': {
        growthRate: '5.2%',
        marketVolume: '$2.3T',
        averageReturn: '8.7%',
        riskLevel: 'Medium',
        liquidityIndex: 'Low',
        forecast: 'Positive'
      },
      'stocks': {
        growthRate: '7.8%',
        marketVolume: '$89.5T',
        averageReturn: '10.2%',
        riskLevel: 'Medium-High',
        liquidityIndex: 'High',
        forecast: 'Stable'
      },
      'commodity': {
        growthRate: '3.1%',
        marketVolume: '$20.7T',
        averageReturn: '5.4%',
        riskLevel: 'Medium',
        liquidityIndex: 'Medium',
        forecast: 'Neutral'
      },
      'art': {
        growthRate: '9.5%',
        marketVolume: '$65.1B',
        averageReturn: '12.8%',
        riskLevel: 'High',
        liquidityIndex: 'Low',
        forecast: 'Positive'
      },
      'collectible': {
        growthRate: '11.2%',
        marketVolume: '$372B',
        averageReturn: '15.3%',
        riskLevel: 'High',
        liquidityIndex: 'Low',
        forecast: 'Very Positive'
      },
      'other': {
        growthRate: '4.0%',
        marketVolume: '$1.2T',
        averageReturn: '6.5%',
        riskLevel: 'Medium',
        liquidityIndex: 'Medium',
        forecast: 'Neutral'
      }
    };
    
    return trends[assetType] || trends['other'];
  } catch (error) {
    console.error('Get asset market trends error:', error);
    throw error;
  }
};

// Export mock assets for direct access in other modules
const getMockAssets = () => {
  return [...mockAssets]; // Return a copy to avoid modification issues
};

const assetService = {
  getAssets,
  getAssetById,
  createAsset,
  transferAsset,
  getMockAssets,
  getAssetPriceHistory,
  getAssetMarketTrends
};

export default assetService;

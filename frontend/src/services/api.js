import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Change to your backend URL

// Create axios instance with auth header
const createAuthHeader = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth endpoints
export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Registration failed';
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Login failed';
  }
};

export const logout = async () => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/logout`,
      {},
      { headers: createAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Logout failed';
  }
};

// Portfolio endpoints
export const getMyPortfolio = async () => {
  try {
    const response = await axios.get(`${API_URL}/portfolios/`, {
      headers: createAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch portfolio';
  }
};

export const createOrUpdatePortfolioEntry = async (asset_id, quantity, average_buy_price) => {
  try {
    const response = await axios.post(
      `${API_URL}/portfolios/`,
      { asset_id, quantity, average_buy_price },
      { headers: createAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to update portfolio';
  }
};

export const updatePortfolioEntry = async (entry_id, asset_id, quantity, average_buy_price) => {
  try {
    const response = await axios.put(
      `${API_URL}/portfolios/${entry_id}`,
      { asset_id, quantity, average_buy_price },
      { headers: createAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to update portfolio entry';
  }
};

export const deletePortfolioEntry = async (entry_id) => {
  try {
    await axios.delete(`${API_URL}/portfolios/${entry_id}`, {
      headers: createAuthHeader()
    });
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to delete portfolio entry';
  }
};

// Assets endpoints
export const getAssets = async () => {
  try {
    const response = await axios.get(`${API_URL}/assets/`, {
      headers: createAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to fetch assets';
  }
};

// Transaction endpoints
export const buyAsset = async (asset_id, quantity) => {
  try {
    const response = await axios.post(
      `${API_URL}/transactions/buy`,
      { asset_id, quantity },
      { headers: createAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to buy asset';
  }
};

export const sellAsset = async (asset_id, quantity) => {
  try {
    const response = await axios.post(
      `${API_URL}/transactions/sell`,
      { asset_id, quantity },
      { headers: createAuthHeader() }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || 'Failed to sell asset';
  }
};

export const getWalletBalance = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/wallet/balance', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to fetch wallet balance');
  }

  return await response.json();
};

export const depositToWallet = async (amount) => {
  const token = localStorage.getItem('access_token');
  const response = await fetch('http://localhost:8000/wallet/deposit', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Deposit failed');
  }

  return await response.json();
};

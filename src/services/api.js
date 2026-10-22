import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Demo data for fallback when backend is unavailable
const DEMO_PRODUCTS = [
  {
    _id: '1',
    name: 'Fresh Tomatoes',
    description: 'Organic vine-ripened tomatoes, perfect for salads and cooking',
    price: 2.99,
    category: 'Food',
    stock: 50,
    unit: 'kg',
    images: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '2',
    name: 'Whole Milk',
    description: 'Fresh whole milk from local farms',
    price: 3.49,
    category: 'Beverages',
    stock: 30,
    unit: 'liter',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '3',
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread',
    price: 4.99,
    category: 'Food',
    stock: 25,
    unit: 'piece',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '4',
    name: 'Organic Eggs',
    description: 'Free-range organic eggs, dozen',
    price: 5.99,
    category: 'Food',
    stock: 40,
    unit: 'pack',
    images: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '5',
    name: 'Orange Juice',
    description: '100% natural orange juice, no added sugar',
    price: 4.49,
    category: 'Beverages',
    stock: 35,
    unit: 'liter',
    images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '6',
    name: 'Fresh Apples',
    description: 'Crisp red apples, perfect for snacking',
    price: 3.99,
    category: 'Food',
    stock: 60,
    unit: 'kg',
    images: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '7',
    name: 'Chicken Breast',
    description: 'Boneless chicken breast, lean protein',
    price: 8.99,
    category: 'Food',
    stock: 20,
    unit: 'kg',
    images: ['https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  },
  {
    _id: '8',
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt, high protein',
    price: 1.99,
    category: 'Food',
    stock: 45,
    unit: 'piece',
    images: ['https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'],
    supermarketId: { _id: 'vendor1', name: 'Fresh Market' },
    isAvailable: true
  }
];

// Add request interceptor for token & debugging
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
API.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(
      `[API Error] ${error.response?.status || 'Network Error'} ${error.config?.url}`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

// Set token for protected routes
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete API.defaults.headers.common['Authorization'];
  }
};

// Auth
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);

// Products
export const getProducts = async (params) => {
  try {
    return await API.get('/products', { params });
  } catch (error) {
    console.warn('Backend unavailable, using demo data');
    // Return demo data with simulated API response structure
    return { data: DEMO_PRODUCTS };
  }
};
export const getVendorProducts = async (vendorId) => {
  try {
    if (vendorId && vendorId !== 'mine') {
      return await API.get(`/products/vendor/${vendorId}`);
    }
    return await API.get('/products/vendor/mine');
  } catch (error) {
    console.warn('Backend unavailable, using demo data');
    return { data: DEMO_PRODUCTS };
  }
};
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (productId, productData) => API.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) => API.delete(`/products/${productId}`);
export const getProductById = (productId) => API.get(`/products/${productId}`);

// Vendors
export const getVendors = () => API.get('/vendors');
export const updateVendorProfile = (profileData) => API.put('/vendor/profile', profileData);

// Orders
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getPendingOrders = () => API.get('/orders/pending');
export const acceptOrder = (orderId) => API.put(`/orders/${orderId}/accept`);
export const getMyOrders = () => API.get('/orders/my-orders');

// Rider deliveries
export const getMyDeliveries = () => API.get('/orders/my-deliveries');
export const updateOrderStatus = (orderId, status) => API.put(`/orders/${orderId}/status`, { status });

export default API;
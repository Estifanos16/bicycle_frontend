import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://bicycle-backend16-2.onrender.com';
const API = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for debugging
API.interceptors.request.use(
  (config) => {
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
  API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Auth
export const registerUser = (userData) => API.post('/auth/register', userData);
export const loginUser = (userData) => API.post('/auth/login', userData);

// Products
export const getProducts = () => API.get('/products');
export const createProduct = (productData) => API.post('/products', productData);
export const updateProduct = (productId, productData) => API.put(`/products/${productId}`, productData);
export const deleteProduct = (productId) => API.delete(`/products/${productId}`);

// Orders
export const createOrder = (orderData) => API.post('/orders', orderData);
export const getPendingOrders = () => API.get('/orders/pending');
export const acceptOrder = (orderId) => API.put(`/orders/${orderId}/accept`);
export const getMyOrders = () => API.get('/orders/my-orders');

// Rider deliveries
export const getMyDeliveries = () => API.get('/orders/my-deliveries');
export const updateOrderStatus = (orderId, status) => API.put(`/orders/${orderId}/status`, { status });

export default API;
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://bicycle-backend16-2.onrender.com';
const API = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for token & debugging
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
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
export const getProducts = (params) => API.get('/products', { params });
export const getVendorProducts = (vendorId) => {
  if (vendorId && vendorId !== 'mine') {
    return API.get(`/products/vendor/${vendorId}`);
  }
  return API.get('/products/vendor/mine');
};
export const createProduct = (productData) => {
  // If productData is FormData, don't set Content-Type (let Axios handle it with boundary)
  if (productData instanceof FormData) {
    return API.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return API.post('/products', productData);
};
export const updateProduct = (productId, productData) => {
  // If productData is FormData, don't set Content-Type (let Axios handle it with boundary)
  if (productData instanceof FormData) {
    return API.put(`/products/${productId}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
  return API.put(`/products/${productId}`, productData);
};
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
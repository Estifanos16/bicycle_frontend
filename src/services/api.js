import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

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

    
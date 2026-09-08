import { useState, useCallback } from 'react';
import {
    getVendorProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
} from '../services/api';

/**
 * useProducts — centralizes product fetch + CRUD state for vendor pages.
 *
 * Usage:
 *   const { products, loading, error, message, fetchProducts, addProduct, editProduct, removeProduct } = useProducts();
 */
const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const clearMessages = () => {
        setError('');
        setMessage('');
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        clearMessages();
        try {
            const response = await getVendorProducts();
            setProducts(response.data || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.response?.data?.message || 'Failed to load products.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const addProduct = useCallback(async (formData) => {
        clearMessages();
        try {
            const response = await createProduct(formData);
            const newProduct = response.data?.product || response.product;
            if (newProduct) setProducts(prev => [newProduct, ...prev]);
            setMessage('Product created successfully!');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create product.';
            setError(msg);
            return { success: false, error: msg };
        }
    }, []);

    const editProduct = useCallback(async (id, formData) => {
        clearMessages();
        try {
            const response = await updateProduct(id, formData);
            const updated = response.data?.product || response.product;
            if (updated) setProducts(prev => prev.map(p => p._id === id ? updated : p));
            setMessage('Product updated successfully!');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to update product.';
            setError(msg);
            return { success: false, error: msg };
        }
    }, []);

    const removeProduct = useCallback(async (id) => {
        clearMessages();
        try {
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => p._id !== id));
            setMessage('Product deleted successfully!');
            return { success: true };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to delete product.';
            setError(msg);
            return { success: false, error: msg };
        }
    }, []);

    const fetchProductById = useCallback(async (id) => {
        setLoading(true);
        clearMessages();
        try {
            const response = await getProductById(id);
            return { success: true, data: response.data };
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to load product.';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        products,
        setProducts,
        loading,
        error,
        message,
        setError,
        setMessage,
        fetchProducts,
        addProduct,
        editProduct,
        removeProduct,
        fetchProductById,
    };
};

export default useProducts;

import React, { createContext, useState, useContext } from 'react';
import { createOrder } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const addToCart = (product) => {
    if (cart.length > 0) {
      const existingSupermarketId = cart[0].supermarketId?._id || cart[0].supermarketId;
      const newSupermarketId = product.supermarketId?._id || product.supermarketId;
      if (existingSupermarketId !== newSupermarketId) {
        setMessage('Please order from one supermarket at a time.');
        return;
      }
    }

    // Use variantId if present for unique identification
    const itemId = product.variantId ? `${product._id}-${product.variantId}` : product._id;
    const existing = cart.find((p) => {
      const existingItemId = p.variantId ? `${p._id}-${p.variantId}` : p._id;
      return existingItemId === itemId;
    });
    
    if (existing) {
      setCart(cart.map((p) => {
        const existingItemId = p.variantId ? `${p._id}-${p.variantId}` : p._id;
        return existingItemId === itemId ? { ...p, quantity: p.quantity + (product.quantity || 1) } : p;
      }));
    } else {
      setCart([...cart, { ...product, quantity: product.quantity || 1 }]);
    }
    setMessage('');
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((p) => {
      // Handle both regular IDs and composite IDs (productId-variantId)
      const itemId = p.variantId ? `${p._id}-${p.variantId}` : p._id;
      return itemId !== id;
    }));
  };

  const clearCart = () => setCart([]);

  const placeOrder = async ({ deliveryAddress, deliveryLocation, paymentMethod }) => {
    if (!deliveryAddress) {
      setMessage('Please enter a delivery address.');
      return;
    }
    if (cart.length === 0) {
      setMessage('Add at least one product before placing an order.');
      return;
    }

    // Generate unique idempotency key to prevent duplicate orders
    const idempotencyKey = `${user?._id || user?.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const orderData = {
      items: cart.map((p) => {
        // Split composite ID if it exists (productId-variantId format)
        const compositeId = p._id;
        const productId = compositeId.includes('-') ? compositeId.split('-')[0] : compositeId;
        const variantId = p.variantId || (compositeId.includes('-') ? compositeId.split('-')[1] : undefined);
        
        return {
          productId,
          variantId,
          quantity: p.quantity
        };
      }),
      deliveryAddress,
      deliveryLocation,
      paymentMethod,
      vendorId: cart[0].supermarketId?._id || cart[0].supermarketId || cart[0].vendorId?._id || cart[0].vendorId,
      idempotencyKey
    };

    try {
      await createOrder(orderData);
      setMessage('Order sent to the supermarket.');
      clearCart();
      return { success: true };
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create order');
      return { success: false, error: err };
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, placeOrder, message, setMessage }}>
      {children}
    </CartContext.Provider>
  );
};

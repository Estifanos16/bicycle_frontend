import React, { createContext, useState, useContext } from 'react';
import { createOrder } from '../services/api';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const { user } = useContext(AuthContext);

  const addToCart = (product, variant = null) => {
    if (cart.length > 0) {
      const existingSupermarketId = cart[0].product.supermarketId?._id || cart[0].product.supermarketId || cart[0].product.vendorId?._id || cart[0].product.vendorId;
      const newSupermarketId = product.supermarketId?._id || product.supermarketId || product.vendorId?._id || product.vendorId;
      if (existingSupermarketId && newSupermarketId && existingSupermarketId !== newSupermarketId) {
        setMessage('Please order from one supermarket at a time.');
        return;
      }
    }

    // Use variantId if present for unique identification
    const variantId = variant ? variant._id : null;
    const itemId = variantId ? `${product._id}-${variantId}` : product._id;
    const existing = cart.find((p) => {
      const existingItemId = p.variantId ? `${p.product._id}-${p.variantId}` : p.product._id;
      return existingItemId === itemId;
    });
    
    if (existing) {
      setCart(cart.map((p) => {
        const existingItemId = p.variantId ? `${p.product._id}-${p.variantId}` : p.product._id;
        return existingItemId === itemId ? { ...p, quantity: p.quantity + 1 } : p;
      }));
    } else {
      setCart([...cart, { product, variant, quantity: 1 }]);
    }
    setMessage('');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, quantity) => {
    if (quantity <= 0) {
      removeFromCart(index);
    } else {
      setCart(cart.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ));
    }
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
      items: cart.map((item) => {
        return {
          productId: item.product._id,
          variantId: item.variant?._id,
          quantity: item.quantity
        };
      }),
      deliveryAddress,
      deliveryLocation,
      paymentMethod,
      vendorId: cart[0].product.supermarketId?._id || cart[0].product.supermarketId || cart[0].product.vendorId?._id || cart[0].product.vendorId,
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
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, placeOrder, message, setMessage }}>
      {children}
    </CartContext.Provider>
  );
};

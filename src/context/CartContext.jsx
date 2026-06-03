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

    const existing = cart.find((p) => p._id === product._id);
    if (existing) {
      setCart(cart.map((p) => (p._id === product._id ? { ...p, quantity: p.quantity + 1 } : p)));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setMessage('');
  };

  const removeFromCart = (id) => setCart(cart.filter((p) => p._id !== id));

  const clearCart = () => setCart([]);

  const placeOrder = async ({ deliveryAddress }) => {
    if (!deliveryAddress) {
      setMessage('Please enter a delivery address.');
      return;
    }
    if (cart.length === 0) {
      setMessage('Add at least one product before placing an order.');
      return;
    }

    const orderData = {
      items: cart.map((p) => ({ productId: p._id, quantity: p.quantity })),
      deliveryAddress,
      supermarketId: cart[0].supermarketId?._id || cart[0].supermarketId,
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

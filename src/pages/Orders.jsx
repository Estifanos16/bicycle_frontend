// src/pages/Orders.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getProducts, createOrder } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [message, setMessage] = useState('');

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const removeFromCart = (id) => {
    setCart(cart.filter((p) => p._id !== id));
  };

  const handleOrder = async () => {
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
      setMessage('Order sent to the supermarket. A rider can accept it shortly.');
      setCart([]);
      setDeliveryAddress('');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create order');
    }
  };

  const orderTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container">
      <div className="page-header">
        <h2>Shop Products</h2>
        <p>Select items from a supermarket and place your order. Orders are delivered to the supermarket and then assigned to a rider.</p>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="orders-layout">
        <div className="products-grid">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
              <div className="product-card-header">
                <h3>{product.name}</h3>
                <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-warning'}`}>
                  {product.stock > 0 ? 'In stock' : 'Out of stock'}
                </span>
              </div>
              <p className="product-description">{product.description || 'No description provided.'}</p>
              <p className="product-price">${product.price.toFixed(2)}</p>
              <p className="product-seller">Supermarket: {product.supermarketId?.name || 'Unknown'}</p>
              <button disabled={product.stock <= 0} onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-panel">
          <div className="card">
            <h3>Your Cart</h3>
            {cart.length === 0 ? (
              <p>Your cart is empty. Pick a product to begin.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item._id}>
                    <div>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <button className="button-secondary" onClick={() => removeFromCart(item._id)}>
                      Remove
                    </button>
                  </div>
                ))}
                <div className="cart-total">
                  <strong>Total:</strong> ${orderTotal.toFixed(2)}
                </div>
                <input
                  type="text"
                  placeholder="Delivery Address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
                <button onClick={handleOrder} disabled={!deliveryAddress}>
                  Place Order
                </button>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Orders;
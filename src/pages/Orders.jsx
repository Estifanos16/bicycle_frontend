// src/pages/Orders.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getProducts } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const { cart, addToCart, removeFromCart, placeOrder, message, setMessage } = useCart();
  const [deliveryAddress, setDeliveryAddress] = useState('');

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

  const handleOrder = async () => {
    const res = await placeOrder({ deliveryAddress });
    if (res?.success) {
      setMessage('Order placed successfully');
      setDeliveryAddress('');
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
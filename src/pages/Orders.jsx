// src/pages/Orders.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { cart, addToCart, removeFromCart, message, setMessage } = useCart();

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load products.');
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] lg:grid-cols-6 gap-6 w-full items-start justify-start">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                storeOpen={true}
                compact={true}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        </div>

        <aside className="cart-panel">
          <div className="card">
            <h3 style={{fontSize: '1rem', marginBottom: '12px'}}>Your Cart</h3>
            {cart.length === 0 ? (
              <p style={{fontSize: '0.85rem', color: '#6B7280'}}>Your cart is empty. Pick a product to begin.</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="cart-item" key={item._id}>
                    <div style={{flex: 1}}>
                      <strong>{item.name}</strong>
                      <p>{item.quantity} x ETB {item.price.toFixed(2)}</p>
                    </div>
                    <button
                      className="button-secondary"
                      onClick={() => removeFromCart(item._id)}
                      style={{padding: '4px 8px', fontSize: '0.75rem'}}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <div className="cart-total" style={{marginTop: '12px', fontSize: '0.9rem'}}>
                  <strong>Total:</strong> ETB {orderTotal.toFixed(2)}
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={cart.length === 0}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.9rem',
                    marginTop: '12px',
                    background: '#FF5500',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                    opacity: cart.length === 0 ? 0.5 : 1
                  }}
                >
                  Proceed to Checkout
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
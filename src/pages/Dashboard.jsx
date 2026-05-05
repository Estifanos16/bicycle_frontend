import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  // Get recent products (last 5 by createdAt)
  const recentProducts = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  // Get most favorable products (top 5 by stock, assuming higher stock means more popular)
  const mostFavorableProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Bicycle App</h1>
        <p>The place where supermarkets publish products, customers shop, and riders deliver orders.</p>
      </div>

      {/* Ads Section */}
      <div className="card">
        <h3>Advertisements</h3>
        <div className="ads-container">
          <div className="ad-banner">
            <p>🚴‍♂️ Special Offer: 20% off on all bicycle accessories! Shop now!</p>
          </div>
          <div className="ad-banner">
            <p>🏪 New Supermarket Partner: Fresh groceries delivered to your door!</p>
          </div>
          <div className="ad-banner">
            <p>📦 Fast Delivery: Get your orders in under 30 minutes with our premium riders!</p>
          </div>
        </div>
      </div>

      {/* Recent Products Section */}
      <div className="card">
        <h3>Recent Products</h3>
        <div className="products-grid">
          {recentProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-card-header">
                <h4>{product.name}</h4>
                <span className="badge">{product.category || 'General'}</span>
              </div>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>
              <p className="product-seller">By: {product.supermarketId?.name || 'Unknown'}</p>
              <div className="product-actions">
                <Link to="/products" className="button-secondary">View Details</Link>
              </div>
            </div>
          ))}
        </div>
        {recentProducts.length === 0 && <p>No recent products available.</p>}
      </div>

      {/* Most Favorable Products Section */}
      <div className="card">
        <h3>Most Favorable Products</h3>
        <div className="products-grid">
          {mostFavorableProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-card-header">
                <h4>{product.name}</h4>
                <span className="badge">{product.category || 'General'}</span>
              </div>
              <p className="product-description">{product.description}</p>
              <p className="product-price">${product.price}</p>
              <p className="product-seller">By: {product.supermarketId?.name || 'Unknown'}</p>
              <div className="product-actions">
                <Link to="/products" className="button-secondary">View Details</Link>
              </div>
            </div>
          ))}
        </div>
        {mostFavorableProducts.length === 0 && <p>No products available.</p>}
      </div>

      {!user && (
        <div className="card">
          <h3>Welcome to Bicycle App</h3>
          <p>Create an account or log in to start shopping or managing products.</p>
          <div className="product-actions">
            <Link to="/login" className="button-secondary">Login</Link>
            <Link to="/register" className="button-secondary">Register</Link>
          </div>
        </div>
      )}

      {user && user.roles?.includes('customer') && (
        <div className="card">
          <h3>Customer Dashboard</h3>
          <p>Browse products and place orders from supermarkets.</p>
          <div className="product-actions">
            <Link to="/products" className="button-secondary">Browse Products</Link>
            <Link to="/orders" className="button-secondary">Go to Shop</Link>
            <Link to="/my-orders" className="button-secondary">My Orders</Link>
          </div>
        </div>
      )}

      {user && user.roles?.includes('rider') && (
        <div className="card">
          <h3>Rider Dashboard</h3>
          <p>Accept new orders and update delivery status.</p>
          <div className="product-actions">
            <Link to="/rider-orders" className="button-secondary">Pending Orders</Link>
            <Link to="/my-deliveries" className="button-secondary">My Deliveries</Link>
          </div>
        </div>
      )}

      {user && user.roles?.includes('supermarket') && (
        <div className="card">
          <h3>Supermarket Dashboard</h3>
          <p>Manage your product catalog and publish new items for customers to order.</p>
          <div className="product-actions">
            <Link to="/products" className="button-secondary">Manage Products</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
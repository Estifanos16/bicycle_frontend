import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Bicycle App</h1>
        <p>The place where supermarkets publish products, customers shop, and riders deliver orders.</p>
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
// src/components/Navbar.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand">Bicycle App</Link>
        <Link to="/products">Products</Link>
        {user?.roles?.includes('customer') && <Link to="/orders">Shop</Link>}
        {user?.roles?.includes('customer') && <Link to="/my-orders">My Orders</Link>}
        {user?.roles?.includes('rider') && <Link to="/rider-orders">Pending Orders</Link>}
        {user?.roles?.includes('rider') && <Link to="/my-deliveries">My Deliveries</Link>}
        {user?.roles?.includes('supermarket') && <Link to="/products">Manage Products</Link>}
        <Link to="/about">About</Link>
      </div>
      <div className="navbar-right">
        {user ? (
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
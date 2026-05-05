// src/components/Navbar.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hideTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleShowDropdown = () => {
    clearTimeout(hideTimerRef.current);
    setShowDropdown(true);
  };

  const handleHideDropdown = () => {
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  const handleToggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/profile');
    setShowDropdown(false);
    setMenuOpen(false);
  };

  const handleDropdownItemClick = (path) => {
    navigate(path);
    setShowDropdown(false);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="brand" onClick={closeMobileMenu}>Bicycle App</Link>
        <button className="navbar-toggle" onClick={handleToggleMenu} aria-label="Open navigation menu">
          Menu
          <span className={`navbar-toggle-icon ${menuOpen ? 'open' : ''}`}>▾</span>
        </button>
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/products" onClick={closeMobileMenu}>Products</Link>
          {user?.roles?.includes('customer') && <Link to="/orders" onClick={closeMobileMenu}>Shop</Link>}
          {user?.roles?.includes('customer') && <Link to="/my-orders" onClick={closeMobileMenu}>My Orders</Link>}
          {user?.roles?.includes('rider') && <Link to="/rider-orders" onClick={closeMobileMenu}>Pending Orders</Link>}
          {user?.roles?.includes('rider') && <Link to="/my-deliveries" onClick={closeMobileMenu}>My Deliveries</Link>}
          {user?.roles?.includes('supermarket') && <Link to="/products" onClick={closeMobileMenu}>Manage Products</Link>}
          <Link to="/about" onClick={closeMobileMenu}>About</Link>
        </div>
      </div>
      <div className="navbar-right">
        <div
          className="profile-container"
          onMouseEnter={handleShowDropdown}
          onMouseLeave={handleHideDropdown}
        >
          <div className="profile-trigger">
            <span className="profile-icon">👤</span>
            <span className="profile-name">{user ? user.name || 'Profile' : 'Account'}</span>
          </div>

          {showDropdown && (
            <div className="profile-dropdown">
              {!user ? (
                <>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/profile')}>
                    Login / Register
                  </div>
                </>
              ) : (
                <>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/my-orders')}>
                    My Orders
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/report')}>
                    Report by Message
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/payment')}>
                    Payment
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/delivery-status')}>
                    Delivery Status
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/favorites')}>
                    Favorite Products
                  </div>
                  <div className="dropdown-item" onClick={() => handleDropdownItemClick('/saved')}>
                    Save to Later Products
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    Logout
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
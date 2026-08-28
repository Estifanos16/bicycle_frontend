// src/components/Navbar.jsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const hideTimerRef = useRef(null);
  const searchTimerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    return () => {
      clearTimeout(hideTimerRef.current);
      clearTimeout(searchTimerRef.current);
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

  const handleSearchToggle = () => {
    setSearchExpanded(!searchExpanded);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = e.target.query.value;
    navigate(`/products${q?`?q=${encodeURIComponent(q)}`:''}`);
  };

  const handleSearchChange = (e) => {
    const q = e.target.value;
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      navigate(`/products${q?`?q=${encodeURIComponent(q)}`:''}`);
    }, 300);
  };

  const isCustomer = user?.roles?.includes('customer');
  const isRider = user?.roles?.includes('rider');
  const isSupermarket = user?.roles?.includes('supermarket');

  return (
    <nav className="nav">
      <div className="nav-left">
        <Link to="/" className="logo" onClick={closeMobileMenu}>
          <div className="mark">B</div>
          <div>Bicycle App</div>
        </Link>
        {!searchExpanded && (
          <>
            <button className="navbar-toggle" onClick={handleToggleMenu} aria-label="Open navigation menu">
              Menu
              <span className={`navbar-toggle-icon ${menuOpen ? 'open' : ''}`}>▾</span>
            </button>
            <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
              {isSupermarket ? (
                <Link to="/products" onClick={closeMobileMenu} style={{color: location.pathname === '/products' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/products' ? '700' : ''}}>Manage Products</Link>
              ) : (
                <Link to="/products" onClick={closeMobileMenu} style={{color: location.pathname === '/products' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/products' ? '700' : ''}}>Products</Link>
              )}
              {isCustomer && <Link to="/orders" onClick={closeMobileMenu} style={{color: location.pathname === '/orders' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/orders' ? '700' : ''}}>Shop</Link>}
              {isCustomer && <Link to="/my-orders" onClick={closeMobileMenu} style={{color: location.pathname === '/my-orders' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/my-orders' ? '700' : ''}}>My Orders</Link>}
              {isRider && <Link to="/rider-orders" onClick={closeMobileMenu} style={{color: location.pathname === '/rider-orders' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/rider-orders' ? '700' : ''}}>Pending Orders</Link>}
              {isRider && <Link to="/my-deliveries" onClick={closeMobileMenu} style={{color: location.pathname === '/my-deliveries' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/my-deliveries' ? '700' : ''}}>My Deliveries</Link>}
              <Link to="/about" onClick={closeMobileMenu} style={{color: location.pathname === '/about' ? 'var(--color-primary)' : '', fontWeight: location.pathname === '/about' ? '700' : ''}}>About</Link>
            </div>
          </>
        )}
        {searchExpanded && (
          <button 
            className="icon-btn" 
            onClick={handleSearchToggle}
            style={{background:'transparent',border:'none',fontSize:'18px',cursor:'pointer'}}
          >
            ...
          </button>
        )}
      </div>
      <div className="nav-center">
        {searchExpanded && (
          <form className="search" onSubmit={handleSearchSubmit}>
            <input type="search" name="query" placeholder="Search products..." autoFocus onChange={handleSearchChange} />
            <button type="submit">Search</button>
          </form>
        )}
      </div>

      <div className="nav-right">
        {!searchExpanded && <div className="icon-btn">Help</div>}
        {!searchExpanded && (
          <div className="icon-btn" onClick={handleSearchToggle} style={{cursor:'pointer'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div className="icon-btn cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 3h2l.4 2M7 13h10l3-8H6.4" stroke="#333" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="cart-badge">3</span>
        </div>
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
                  {isCustomer && (
                    <>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/my-orders')}>
                        My Orders
                      </div>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/favorites')}>
                        Favorite Products
                      </div>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/saved')}>
                        Save to Later Products
                      </div>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/payment')}>
                        Payment
                      </div>
                    </>
                  )}

                  {isRider && (
                    <>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/rider-orders')}>
                        Pending Orders
                      </div>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/my-deliveries')}>
                        My Deliveries
                      </div>
                    </>
                  )}

                  {isSupermarket && (
                    <>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/products')}>
                        Manage Products
                      </div>
                    </>
                  )}

                  {(isCustomer || isRider || isSupermarket) && (
                    <>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/report')}>
                        Report by Message
                      </div>
                      <div className="dropdown-item" onClick={() => handleDropdownItemClick('/delivery-status')}>
                        Delivery Status
                      </div>
                    </>
                  )}

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
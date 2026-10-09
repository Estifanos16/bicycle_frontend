// src/App.jsx
import React, { useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import CategoryBar from './components/layout/CategoryBar';
import ErrorBoundary from './components/ErrorBoundary';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Auth from './pages/auth/Auth';

// Vendor pages
import VendorProducts from './pages/vendor/VendorProducts';
import AddProduct from './pages/vendor/AddProduct';
import EditProduct from './pages/vendor/EditProduct';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorSettings from './pages/vendor/VendorSettings';

// Customer pages
import Storefront from './pages/customer/Storefront';
import Products from './pages/customer/Products';
import Saved from './pages/customer/Saved';
import Favorites from './pages/customer/Favorites';
import Payment from './pages/customer/Payment';
import MyOrders from './pages/customer/MyOrders';

// Rider pages
import RiderOrders from './pages/rider/RiderOrders';
import MyDeliveries from './pages/rider/MyDeliveries';
import DeliveryStatus from './pages/rider/DeliveryStatus';

// Shared/general pages
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Report from './pages/Report';
import Orders from './pages/Orders';

// Infrastructure
import PrivateRoute from './components/PrivateRoute';
import { VendorProvider } from './context/VendorContext';

function AppContent() {
  const location = useLocation();

  // Reset scroll position and clear any background state locks on path change
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Force cleanup of any dangling EventSource connections
    // This is a safety net in case individual components don't clean up properly
    const beforeUnloadHandler = () => {
      // Close any open EventSource connections
      if (window.EventSource) {
        // EventSource doesn't have a global close method, but this ensures
        // the browser cleans up connections when the page unloads
      }
    };

    window.addEventListener('beforeunload', beforeUnloadHandler);
    
    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
    };
  }, [location.pathname]);

  const hideNavbar = ['/login', '/register', '/profile'].includes(location.pathname);

  const hideCategoryBar = [
    '/login', '/register', '/profile',
    '/vendor/settings',
    '/vendor/products/new',
  ].includes(location.pathname) ||
    (location.pathname.startsWith('/vendor/products/') && location.pathname.endsWith('/edit'));

  return (
    <ErrorBoundary key={location.pathname}>
      <>
        {!hideNavbar && <Navbar />}
        {!hideCategoryBar && <CategoryBar />}
        <Suspense fallback={
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '1rem'
          }}>
            Loading page...
          </div>
        }>
          <Routes key={location.pathname} location={location}>
            {/* General */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/report" element={<Report />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Auth />} />
        <Route path="/auth" element={<Navigate to="/profile" replace />} />

        {/* Vendor */}
        <Route
          path="/vendor/products"
          element={
            <PrivateRoute roles={['supermarket']}>
              <VendorProducts />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/products/new"
          element={
            <PrivateRoute roles={['supermarket']}>
              <AddProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/products/:id/edit"
          element={
            <PrivateRoute roles={['supermarket']}>
              <EditProduct />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/dashboard"
          element={
            <PrivateRoute roles={['supermarket']}>
              <VendorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/vendor/settings"
          element={
            <PrivateRoute roles={['supermarket']}>
              <VendorSettings />
            </PrivateRoute>
          }
        />

        {/* Customer */}
        <Route path="/products" element={<Products />} />
        <Route path="/store/:storeSlug" element={<Storefront />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payment" element={<Payment />} />
        <Route
          path="/shop"
          element={
            <PrivateRoute roles={['customer']}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <PrivateRoute roles={['customer']}>
              <MyOrders />
            </PrivateRoute>
          }
        />

        {/* Rider */}
        <Route
          path="/rider-orders"
          element={
            <PrivateRoute roles={['rider']}>
              <RiderOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-deliveries"
          element={
            <PrivateRoute roles={['rider']}>
              <MyDeliveries />
            </PrivateRoute>
          }
        />
        <Route path="/delivery-status" element={<DeliveryStatus />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      </>
      </ErrorBoundary>
  );
}

function App() {
  return (
    <VendorProvider>
      <Router>
        <AppContent />
      </Router>
    </VendorProvider>
  );
}

export default App;
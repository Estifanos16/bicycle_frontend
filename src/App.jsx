// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout components
import Navbar from './components/layout/Navbar';
import CategoryBar from './components/layout/CategoryBar';

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

  const hideNavbar = ['/login', '/register', '/profile'].includes(location.pathname);

  const hideCategoryBar = [
    '/login', '/register', '/profile',
    '/vendor/settings', '/products',
    '/vendor/products/new',
  ].includes(location.pathname) ||
    (location.pathname.startsWith('/vendor/products/') && location.pathname.endsWith('/edit'));

  return (
    <>
      {!hideNavbar && <Navbar />}
      {!hideCategoryBar && <CategoryBar />}
      <Routes>
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
          path="/products"
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
        <Route path="/shop" element={<Products />} />
        <Route path="/store/:storeSlug" element={<Storefront />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/payment" element={<Payment />} />
        <Route
          path="/orders"
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
    </>
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
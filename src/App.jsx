// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Orders from './pages/Orders';
import RiderOrders from './pages/RiderOrders';
import Auth from './pages/Auth';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders.jsx';
import MyDeliveries from './pages/MyDeliveries';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Report from './pages/Report';
import Payment from './pages/Payment';
import DeliveryStatus from './pages/DeliveryStatus';
import Favorites from './pages/Favorites';
import Saved from './pages/Saved';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route
          path="/orders"
          element={
            <PrivateRoute roles={['customer']}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route path="/profile" element={<Auth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth" element={<Navigate to="/profile" replace />} />
        <Route path="/about" element={<About />} />
        <Route path="/report" element={<Report />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/delivery-status" element={<DeliveryStatus />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/saved" element={<Saved />} />
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
        <Route
          path="/my-orders"
          element={
            <PrivateRoute roles={['customer']}>
              <MyOrders />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
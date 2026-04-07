// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Products from './pages/Products';
import Orders from './pages/Orders';
import RiderOrders from './pages/RiderOrders';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders.jsx';
import MyDeliveries from './pages/MyDeliveries';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import About from './pages/About';

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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
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
      </Routes>
    </Router>
  );
}

export default App;
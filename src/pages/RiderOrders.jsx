// src/pages/RiderOrders.jsx
import React, { useState, useEffect, useContext } from 'react';
import { getPendingOrders, acceptOrder } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const RiderOrders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  const fetchPendingOrders = async () => {
    try {
      const response = await getPendingOrders();
      setOrders(response.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load orders');
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleAccept = async (orderId) => {
    try {
      await acceptOrder(orderId);
      setMessage('Order accepted successfully!');
      setOrders(orders.filter((o) => o._id !== orderId));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to accept order');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>Pending Orders</h2>
        <p>Accept orders so they can be assigned to a rider and move toward delivery.</p>
      </div>

      {message && <div className="alert">{message}</div>}

      {orders.length === 0 && <div className="alert">No pending orders.</div>}

      <div className="products-grid">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <h3>Order {order._id.slice(-6)}</h3>
              <span className="badge badge-success">{order.status}</span>
            </div>
            <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Address:</strong> {order.deliveryAddress}</p>
            <h4>Items</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={`${order._id}-${index}`}>
                  {item.name} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <button onClick={() => handleAccept(order._id)}>Accept Order</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiderOrders;
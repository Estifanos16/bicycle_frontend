// src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Orders</h2>
        <p>Track the orders you placed and view the delivery status.</p>
      </div>

      {orders.length === 0 && <div className="alert">No orders yet.</div>}

      <div className="products-grid">
        {orders.map((order) => (
          <div className="order-card" key={order._id}>
            <div className="order-card-header">
              <h3>Order {order._id.slice(-6)}</h3>
              <span className="badge badge-success">{order.status}</span>
            </div>
            <p><strong>Total:</strong> ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Address:</strong> {order.deliveryAddress}</p>
            <p><strong>Supermarket:</strong> {order.supermarketId?.name || 'Unknown'}</p>
            <h4>Items</h4>
            <ul>
              {order.items.map((item, index) => (
                <li key={`${order._id}-${index}`}>
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export { MyOrders as default };
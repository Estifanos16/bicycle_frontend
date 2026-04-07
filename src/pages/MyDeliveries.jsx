// src/pages/MyDeliveries.jsx
import React, { useEffect, useState } from 'react';
import { getMyDeliveries, updateOrderStatus } from '../services/api';

const MyDeliveries = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyDeliveries();
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o._id === orderId ? res.data.order : o)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Deliveries</h2>
        <p>Update delivery status as orders move from accepted to completed.</p>
      </div>

      {orders.length === 0 && <div className="alert">No deliveries yet.</div>}

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
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>

            {order.status === 'accepted' && (
              <button onClick={() => handleStatusChange(order._id, 'delivering')}>
                Mark as Delivering
              </button>
            )}
            {order.status === 'delivering' && (
              <button onClick={() => handleStatusChange(order._id, 'completed')}>
                Mark as Completed
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export { MyDeliveries as default };
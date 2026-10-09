// src/pages/MyOrders.jsx
import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getMyOrders();
        setOrders(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="page-header">
          <h2>My Orders</h2>
        </div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h2>My Orders</h2>
        <p>Track the orders you placed and view the delivery status.</p>
      </div>

      {orders.length === 0 && <div className="alert">No orders yet.</div>}

      <div className="products-grid">
        {orders.map((order) => {
          // Safe property access with fallbacks
          const orderId = order?._id || 'Unknown';
          const orderShortId = orderId.length > 6 ? orderId.slice(-6) : orderId;
          const status = order?.status || 'Pending';
          const totalPrice = order?.pricing?.total ?? order?.total ?? order?.totalPrice ?? 0;
          const currency = order?.pricing?.currency || 'ETB';
          const deliveryAddress = order?.deliveryAddress?.fullAddress || order?.deliveryAddress || 'N/A';
          const supermarketName = order?.supermarketId?.name || order?.vendorId?.name || 'Unknown';
          const orderItems = Array.isArray(order?.items) ? order.items : [];

          return (
            <div className="order-card" key={orderId}>
              <div className="order-card-header">
                <h3>Order #{orderShortId}</h3>
                <span className="badge badge-success">{status}</span>
              </div>
              <p><strong>Total:</strong> {currency} {Number(totalPrice).toFixed(2)}</p>
              <p><strong>Address:</strong> {deliveryAddress}</p>
              <p><strong>Supermarket:</strong> {supermarketName}</p>
              <h4>Items</h4>
              {orderItems.length === 0 ? (
                <p>No items</p>
              ) : (
                <ul>
                  {orderItems.map((item, index) => (
                    <li key={`${orderId}-${index}`}>
                      {item?.name || item?.productId || 'Unknown item'} x {item?.quantity || 1}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { MyOrders as default };

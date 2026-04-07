import React from 'react';

const About = () => {
  return (
    <div className="container">
      <div className="page-header">
        <h1>About Bicycle App</h1>
        <p>Learn how our delivery system works and the structure of our platform.</p>
      </div>

      <div className="card">
        <h2>How Delivery Works</h2>
        <ol>
          <li><strong>Customer Places Order:</strong> Customers browse products from supermarkets, add items to their cart, and place an order with a delivery address.</li>
          <li><strong>Order Sent to Supermarket:</strong> The order is immediately sent to the relevant supermarket for preparation.</li>
          <li><strong>Supermarket Prepares Order:</strong> Supermarket owners receive the order notification and prepare the items.</li>
          <li><strong>Rider Accepts Order:</strong> Available riders can view pending orders and accept them for delivery.</li>
          <li><strong>Order Status Updates:</strong> Riders update the order status as they pick up and deliver the order.</li>
          <li><strong>Delivery Completion:</strong> The order is marked as completed when delivered to the customer.</li>
        </ol>
      </div>

      <div className="card">
        <h2>App Structure</h2>
        <h3>User Roles</h3>
        <ul>
          <li><strong>Customer:</strong> Can browse products, place orders, and track deliveries.</li>
          <li><strong>Supermarket Owner:</strong> Can add, update, and manage their products.</li>
          <li><strong>Rider:</strong> Can accept orders and update delivery status.</li>
          <li><strong>Admin:</strong> Has full access to manage the platform.</li>
        </ul>

        <h3>Key Features</h3>
        <ul>
          <li>Multi-role user accounts</li>
          <li>Real-time order tracking</li>
          <li>Product management for supermarkets</li>
          <li>Efficient rider assignment</li>
          <li>Secure authentication and authorization</li>
        </ul>
      </div>

      <div className="card">
        <h2>License</h2>
        <p>This application is built for educational purposes. All rights reserved.</p>
        <p>Technologies used: React, Node.js, Express, MongoDB, JWT for authentication.</p>
      </div>
    </div>
  );
};

export default About;
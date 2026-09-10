import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ roles, children }) => {
  const { user, token, loading } = useContext(AuthContext);

  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Token:', token ? 'exists' : 'missing');
  console.log('PrivateRoute - Loading:', loading);
  console.log('PrivateRoute - Required roles:', roles);

  if (loading) {
    console.log('PrivateRoute - Loading auth state...');
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #e5e7eb', 
            borderTopColor: '#FF5500', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    console.log('PrivateRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (roles && !user?.roles?.some(role => roles.includes(role))) {
    console.log('PrivateRoute - User roles:', user.roles, 'do not match required:', roles);
    return <Navigate to="/login" />;
  }

  console.log('PrivateRoute - Access granted');
  return children;
};

export default PrivateRoute;
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Required roles:', roles);

  if (!user) {
    console.log('PrivateRoute - No user, redirecting to login');
    return <Navigate to="/login" />;
  }

  if (roles && !user?.roles?.some(role => roles.includes(role))) {
    console.log('PrivateRoute - User roles:', user.roles, 'do not match required:', roles);
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ roles, children }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !user?.roles?.some(role => roles.includes(role))) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, allowedRoles }) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const token = localStorage.getItem('token');

  if (!token || !userInfo) {
    return <Navigate to="/login" replace />;
  }

  const userType = userInfo.userType.toLowerCase();
  const allowedRolesLower = allowedRoles.map(role => role.toLowerCase());

  if (!allowedRolesLower.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    switch (userType) {
      case 'ngo':
        return <Navigate to="/ngo/dashboard" replace />;
      case 'government':
        return <Navigate to="/government/dashboard" replace />;
      case 'volunteer':
        return <Navigate to="/volunteer/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 
import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  return token ? <Navigate to="/products" /> : children;
};

export default PublicRoute;

// public route blocks access to the login page if a token is present

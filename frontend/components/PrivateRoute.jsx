import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles }) => {
  const { currentUser } = useSelector((state) => state.user);
  const userRole = localStorage.getItem('role'); // Fetch role from localStorage

  // If no user is logged in, redirect to sign-in
  if (!currentUser) {
    return <Navigate to="/sign-in" />;
  }

  // If the user role is not in allowedRoles, redirect to home
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default PrivateRoute;

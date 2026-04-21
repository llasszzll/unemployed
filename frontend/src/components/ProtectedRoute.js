import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, authStates } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children }) {
  const { authState } = useAuth();
  const location = useLocation();

  if (authState === authStates.loading) {
    return <Loading />;
  }

  if (authState === authStates.unauthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
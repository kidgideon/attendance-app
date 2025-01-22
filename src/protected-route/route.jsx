import React from "react";
import { Navigate } from "react-router-dom";
import Splash from './splash/splash.jsx'

function ProtectedRoute({ isAuthenticated, isLoading, children }) {
  if (isLoading) {
    // Show splash screen while loading
    return <Splash></Splash>;
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to the login page
    return <Navigate to="/login" />;
  }

  // Render the protected component if authenticated
  return children;
}

export default ProtectedRoute;

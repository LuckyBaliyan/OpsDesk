import React from 'react';
import { Navigate } from 'react-router-dom';

export default function Protected({ children }) {
      // Check if token exists in localStorage (mock authentication)
      const isAuthenticated = localStorage.getItem('opsdesk_token');

      if (!isAuthenticated) {
            // Agar logged in nahi hai, toh login page par bhej do
            return <Navigate to="/login" replace />;
      }

      // Agar logged in hai, toh dashboard component render kar do
      return children;
}
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashBoard from './pages/DashBoard';
import Protected from './components/auth/Protected';

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Operations Hub Routes */}
      <Route path="/dashboard" element={
        <Protected>
          <DashBoard />
        </Protected>
      } />

      {/* Default fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />

      {/*Home*/}
      <Route path='/' element={<h1>Welcome!</h1>} />

    </Routes>
  );
}
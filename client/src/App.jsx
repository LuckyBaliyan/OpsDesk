import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import DashBoard from './pages/DashBoard';
import DirectoryPage from './pages/DirectoryPage';
import WorkItemDetail from './pages/WorkItemDetail';
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

      {/* Unified Organization Directory (Teams & Users) */}
      <Route path="/directory" element={
        <Protected>
          <DirectoryPage />
        </Protected>
      } />

      {/* Legacy /teams alias for seamless backwards compatibility */}
      <Route path="/teams" element={
        <Protected>
          <DirectoryPage />
        </Protected>
      } />

      {/* Work item detail page */}
      <Route path="/work-items/:id" element={
        <Protected>
          <WorkItemDetail />
        </Protected>
      } />

      {/* Default fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}

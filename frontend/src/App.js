import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminResources from './pages/AdminResources';
import Catalogue from './pages/Catalogue';
import ResourceDetail from './pages/ResourceDetail';
import MyLibrary from './pages/MyLibrary';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-slate-900 focus:rounded-md focus:shadow"
        >
          Skip to main content
        </a>
        <Navbar />
        <div id="main-content" tabIndex={-1}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminResources />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalogue"
              element={
                <ProtectedRoute>
                  <Catalogue />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resources/:id"
              element={
                <ProtectedRoute>
                  <ResourceDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-library"
              element={
                <ProtectedRoute>
                  <MyLibrary />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/catalogue" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

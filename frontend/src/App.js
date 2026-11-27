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
        <Navbar />
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
    </Router>
  );
}

export default App;

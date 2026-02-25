import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import HotelList from './pages/Merchant/HotelList';
import HotelForm from './pages/Merchant/HotelForm';
import Chat from './pages/Merchant/Chat';
import HotelReview from './pages/Admin/HotelReview';
import HotelManagement from './pages/Admin/HotelManagement';
import HotelDetail from './pages/Admin/HotelDetail';
import Navbar from './components/Navbar';
import './App.css';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/" element={
        user ? (
          <Navigate to={user.role === 'merchant' ? '/merchant/hotels' : '/admin/hotels'} />
        ) : (
          <Navigate to="/login" />
        )
      } />
      <Route path="/merchant/hotels" element={
        <ProtectedRoute requiredRole="merchant">
          <div>
            <Navbar />
            <HotelList />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/merchant/hotels/add" element={
        <ProtectedRoute requiredRole="merchant">
          <div>
            <Navbar />
            <HotelForm />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/merchant/hotels/edit/:id" element={
        <ProtectedRoute requiredRole="merchant">
          <div>
            <Navbar />
            <HotelForm />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/merchant/chat" element={
        <ProtectedRoute requiredRole="merchant">
          <div>
            <Navbar />
            <Chat />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/hotels" element={
        <ProtectedRoute requiredRole="admin">
          <div>
            <Navbar />
            <HotelReview />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/hotels/:id" element={
        <ProtectedRoute requiredRole="admin">
          <div>
            <Navbar />
            <HotelDetail />
          </div>
        </ProtectedRoute>
      } />
      <Route path="/admin/hotels/manage" element={
        <ProtectedRoute requiredRole="admin">
          <div>
            <Navbar />
            <HotelManagement />
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
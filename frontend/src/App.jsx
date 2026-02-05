import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HotelListPage from './pages/HotelListPage';
import AddHotelPage from './pages/AddHotelPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* 受保护的路由 */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<HotelListPage />} />
            <Route path="hotels" element={<HotelListPage />} />
            <Route path="hotels/add" element={<AddHotelPage />} />
            <Route path="hotels/edit/:id" element={<AddHotelPage />} />
          </Route>
          
          {/* 404页面 */}
          <Route path="*" element={<div>页面不存在</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
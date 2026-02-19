import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HotelListPage from './pages/HotelListPage';
import AddHotelPage from './pages/AddHotelPage';
import AdminHotelListPage from './pages/AdminHotelListPage';
import ProtectedRoute from './components/ProtectedRoute';
import MobileHotelSearchPage from './pages/mobile/HotelSearchPage';
import MobileHotelListPage from './pages/mobile/HotelListPage';
import MobileHotelDetailPage from './pages/mobile/HotelDetailPage';
import PublicHotelListPage from './pages/PublicHotelListPage';
import PublicHotelDetailPage from './pages/PublicHotelDetailPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* 公开酒店列表和详情 */}
          <Route path="/public-hotels" element={<PublicHotelListPage />} />
          <Route path="/public-hotels/:id" element={<PublicHotelDetailPage />} />
          
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
            {/* 管理员路由 */}
            <Route path="admin" element={<AdminHotelListPage />} />
            <Route path="admin/hotels" element={<AdminHotelListPage />} />
          </Route>
          
          {/* 移动端路由 */}
          <Route path="/mobile" element={<MobileHotelSearchPage />} />
          <Route path="/mobile/hotels" element={<MobileHotelListPage />} />
          <Route path="/mobile/hotels/:id" element={<MobileHotelDetailPage />} />
          
          {/* 404页面 */}
          <Route path="*" element={<div>页面不存在</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
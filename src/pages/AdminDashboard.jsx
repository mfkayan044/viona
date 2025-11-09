import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminProducts from '../components/admin/AdminProducts';
import AdminSettings from '../components/admin/AdminSettings';
import AdminOrders from '../components/admin/AdminOrders';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminBlog from '../components/admin/AdminBlog';
import AdminContact from '../components/admin/AdminContact';
import AdminFaq from '../components/admin/AdminFaq';
import AdminFlashSale from '../components/admin/AdminFlashSale';
import AdminDashboardHome from '../components/admin/AdminDashboardHome';
import AdminInventory from '../components/admin/AdminInventory';
import AdminUsers from '../components/admin/AdminUsers';
import AdminReports from '../components/admin/AdminReports';
import AdminSEO from '../components/admin/AdminSEO';
import AdminPaymentSettings from '../components/admin/AdminPaymentSettings';
import AdminReviews from '../components/admin/AdminReviews';

const AdminDashboard = () => {
  const { user, loading } = useAuth();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <Routes>
          <Route path="/" element={<AdminDashboardHome />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/inventory" element={<AdminInventory />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/reports" element={<AdminReports />} />
          <Route path="/coupons" element={<AdminCoupons />} />
          <Route path="/flash-sale" element={<AdminFlashSale />} />
          <Route path="/blog" element={<AdminBlog />} />
          <Route path="/reviews" element={<AdminReviews />} />
          <Route path="/contact" element={<AdminContact />} />
          <Route path="/faq" element={<AdminFaq />} />
          <Route path="/seo" element={<AdminSEO />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="/payment-settings" element={<AdminPaymentSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;

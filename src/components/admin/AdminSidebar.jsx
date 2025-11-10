import React, { useState } from 'react';
import { Package, Settings, Eye, LogOut, ShoppingBag, Tag, FileText, MessageSquare, HelpCircle, Zap, BarChart2, Archive, Users, PieChart, Search, CreditCard, Star, Mail, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import NotificationBell from './NotificationBell';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Close mobile menu after navigation
  };

  const menuItems = [
    { path: '/admin/', icon: BarChart2, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Ürünler' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Siparişler' },
    { path: '/admin/inventory', icon: Archive, label: 'Envanter' },
    { path: '/admin/users', icon: Users, label: 'Kullanıcılar' },
    { path: '/admin/reports', icon: PieChart, label: 'Raporlar' },
    { path: '/admin/coupons', icon: Tag, label: 'Kuponlar' },
    { path: '/admin/flash-sale', icon: Zap, label: 'Flash Sale' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/reviews', icon: Star, label: 'Yorumlar' },
    { path: '/admin/contact', icon: MessageSquare, label: 'Mesajlar' },
    { path: '/admin/faq', icon: HelpCircle, label: 'SSS' },
    { path: '/admin/seo', icon: Search, label: 'SEO' },
    { path: '/admin/email', icon: Mail, label: 'Mail Gönder' },
    { path: '/admin/settings', icon: Settings, label: 'Ayarlar' },
    { path: '/admin/payment-settings', icon: CreditCard, label: 'Ödeme Yöntemleri' },
  ];

  const SidebarContent = () => (
    <>
      <div className="mb-8 border-b border-gray-800 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-widest">VIONA</h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">Admin Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            {/* Mobile close button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-900 rounded transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.path === '/admin/' 
            ? (isActive('/admin/') || isActive('/admin'))
            : isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
                active
                  ? 'bg-white text-black translate-x-2' 
                  : 'hover:bg-gray-900 hover:translate-x-1'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
        
        <button
          onClick={() => handleNavClick('/')}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 hover:translate-x-1 transition-all duration-300 text-sm uppercase tracking-wider"
        >
          <Eye size={18} />
          <span>Önizleme</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-900 hover:translate-x-1 transition-all duration-300 mt-8 text-sm uppercase tracking-wider text-gray-400"
        >
          <LogOut size={18} />
          <span>Çıkış</span>
        </button>
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-black text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-black text-white p-6 min-h-screen fixed left-0 top-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed left-0 top-0 bottom-0 w-64 bg-black text-white p-6 overflow-y-auto transform transition-transform duration-300 ease-out"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'slideInLeft 0.3s ease-out' }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Add slide animation */}
      <style jsx>{`
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;

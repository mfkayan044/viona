import React from 'react';
import { Package, Settings, Eye, LogOut, ShoppingBag, Tag, FileText, MessageSquare, HelpCircle, Zap, BarChart2, Archive, Users, PieChart, Search, CreditCard, Star } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import NotificationBell from './NotificationBell';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAdmin } = useApp();

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-black text-white p-6 min-h-screen">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light tracking-widest">VIONA</h2>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-wider">Admin Panel</p>
          </div>
          <div className="relative">
            <NotificationBell />
          </div>
        </div>
      </div>
      
      <nav className="space-y-1">
        <button
          onClick={() => navigate('/admin/')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/') || isActive('/admin')
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <BarChart2 size={18} />
          <span>Dashboard</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/products')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/products') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Package size={18} />
          <span>Ürünler</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/orders')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/orders') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <ShoppingBag size={18} />
          <span>Siparişler</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/inventory')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/inventory') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Archive size={18} />
          <span>Envanter</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/users')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/users') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Users size={18} />
          <span>Kullanıcılar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/reports')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/reports') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <PieChart size={18} />
          <span>Raporlar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/coupons')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/coupons') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Tag size={18} />
          <span>Kuponlar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/flash-sale')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/flash-sale') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Zap size={18} />
          <span>Flash Sale</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/blog')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/blog') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <FileText size={18} />
          <span>Blog</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/reviews')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/reviews') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Star size={18} />
          <span>Yorumlar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/contact')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/contact') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <MessageSquare size={18} />
          <span>Mesajlar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/faq')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/faq') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <HelpCircle size={18} />
          <span>SSS</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/seo')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/seo') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Search size={18} />
          <span>SEO</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/settings') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <Settings size={18} />
          <span>Ayarlar</span>
        </button>
        
        <button
          onClick={() => navigate('/admin/payment-settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider transition-all duration-300 ${
            isActive('/admin/payment-settings') 
              ? 'bg-white text-black translate-x-2' 
              : 'hover:bg-gray-900 hover:translate-x-1'
          }`}
        >
          <CreditCard size={18} />
          <span>Ödeme Yöntemleri</span>
        </button>
        
        <button
          onClick={() => navigate('/')}
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
    </div>
  );
};

export default AdminSidebar;

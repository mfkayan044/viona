import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Heart, User, LogOut, Package } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useMobileMenu } from '../hooks/useMobileMenu';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import LanguageSwitcher from './LanguageSwitcher';
import CurrencySwitcher from './CurrencySwitcher';

const Header = () => {
  const { siteSettings, cart, setShowCart } = useApp();
  const { wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const { isOpen, toggle, close } = useMobileMenu();
  const scrollProgress = useScrollProgress();
  const navigate = useNavigate();
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      {/* Scroll Progress Bar */}
      <div className="absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ease-out" 
           style={{ width: `${scrollProgress}%` }}>
      </div>
      
      <div className="container mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/')}>
          {siteSettings.logo && siteSettings.logo.startsWith('http') ? (
            <img 
              src={siteSettings.logo} 
              alt={siteSettings.siteName}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-3xl">{siteSettings.logo}</span>
          )}
          <div>
            <h1 className="text-2xl font-light tracking-[0.3em] uppercase">
              {siteSettings.siteName}
            </h1>
            <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
              {siteSettings.slogan}
            </p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
            className="text-sm text-neutral-700 hover:text-black transition-all duration-300 uppercase tracking-widest relative group"
          >
            {t('nav.home')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('products');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="text-sm text-neutral-700 hover:text-black transition-all duration-300 uppercase tracking-widest relative group"
          >
            {t('nav.products')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => navigate('/blog')}
            className="text-sm text-neutral-700 hover:text-black transition-all duration-300 uppercase tracking-widest relative group"
          >
            {t('nav.blog')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('about');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
            }}
            className="text-sm text-neutral-700 hover:text-black transition-all duration-300 uppercase tracking-widest relative group"
          >
            {t('nav.about')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="text-sm text-neutral-700 hover:text-black transition-all duration-300 uppercase tracking-widest relative group"
          >
            {t('nav.contact')}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
          </button>
          <button
            onClick={() => navigate('/admin-login')}
            className="text-xs text-neutral-400 hover:text-black transition-all duration-300 uppercase tracking-widest hover:scale-105"
          >
            Admin
          </button>
        </nav>
        
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />
          
          {/* Currency Switcher */}
          <CurrencySwitcher />
          
          {/* Wishlist Button */}
          <button
            onClick={() => navigate('/wishlist')}
            className="relative p-2 hover:bg-neutral-100 transition group"
          >
            <Heart size={22} className="text-black group-hover:fill-red-500 group-hover:text-red-500 transition-all duration-300" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Menu */}
          <div className="relative">
            {user ? (
              <>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-2 hover:bg-neutral-100 transition rounded"
                >
                  <img 
                    src={user.avatar} 
                    alt={user.firstName} 
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden md:block text-sm font-light">
                    {user.firstName}
                  </span>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-200 shadow-lg rounded z-50">
                    <div className="p-3 border-b border-neutral-200">
                      <p className="font-medium text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-neutral-500">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 transition flex items-center gap-2"
                      >
                        <User size={16} />
                        Profilim
                      </button>
                      <button
                        onClick={() => {
                          navigate('/my-orders');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-neutral-100 transition flex items-center gap-2"
                      >
                        <Package size={16} />
                        Siparişlerim
                      </button>
                      <button
                        onClick={async () => {
                          await logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 transition flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="p-2 hover:bg-neutral-100 transition group"
              >
                <User size={22} className="text-black" strokeWidth={1.5} />
              </button>
            )}
          </div>
          
          {/* Cart Button */}
          <button
            onClick={() => setShowCart(true)}
            className="relative p-2 hover:bg-neutral-100 transition"
          >
            <ShoppingBag size={22} className="text-black" strokeWidth={1.5} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-light">
                {cart.length}
              </span>
            )}
          </button>
          
          <button
            onClick={toggle}
            className="md:hidden p-2"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu with Slide Down Animation */}
      <div 
        className={`md:hidden border-t border-neutral-200 bg-white overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-2 p-6">
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
              close();
            }}
            className="text-left text-sm uppercase tracking-widest text-neutral-700 py-3 hover:text-black hover:translate-x-2 transition-all duration-300 border-b border-neutral-100"
          >
            Home
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('products');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
              close();
            }}
            className="text-left text-sm uppercase tracking-widest text-neutral-700 py-3 hover:text-black hover:translate-x-2 transition-all duration-300 border-b border-neutral-100"
          >
            Collection
          </button>
          <button
            onClick={() => {
              navigate('/blog');
              close();
            }}
            className="text-left text-sm uppercase tracking-widest text-neutral-700 py-3 hover:text-black hover:translate-x-2 transition-all duration-300 border-b border-neutral-100"
          >
            Blog
          </button>
          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('about');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }, 100);
              close();
            }}
            className="text-left text-sm uppercase tracking-widest text-neutral-700 py-3 hover:text-black hover:translate-x-2 transition-all duration-300 border-b border-neutral-100"
          >
            About
          </button>
          <button
            onClick={() => {
              navigate('/contact');
              close();
            }}
            className="text-left text-sm uppercase tracking-widest text-neutral-700 py-3 hover:text-black hover:translate-x-2 transition-all duration-300 border-b border-neutral-100"
          >
            Contact
          </button>
          <button
            onClick={() => {
              navigate('/admin-login');
              close();
            }}
            className="text-left text-xs uppercase tracking-widest text-neutral-400 py-3 hover:text-black hover:translate-x-2 transition-all duration-300"
          >
            Admin
          </button>
        </nav>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;

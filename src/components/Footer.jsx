import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Footer = () => {
  const navigate = useNavigate();
  const { siteSettings } = useApp();

  return (
    <footer className="bg-black text-white py-8 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              {siteSettings.logo && siteSettings.logo.startsWith('http') ? (
                <img 
                  src={siteSettings.logo} 
                  alt={siteSettings.siteName}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-xl sm:text-2xl">{siteSettings.logo}</span>
              )}
              <h3 className="text-lg sm:text-xl font-light tracking-widest uppercase">
                {siteSettings.siteName}
              </h3>
            </div>
            <p className="text-neutral-400 text-sm">
              {siteSettings.slogan}
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('/')} className="hover:text-white transition touch-manipulation py-1">
                  Ana Sayfa
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/blog')} className="hover:text-white transition touch-manipulation py-1">
                  Blog
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition touch-manipulation py-1">
                  SSS
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition touch-manipulation py-1">
                  İletişim
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">Müşteri Hizmetleri</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('/my-orders')} className="hover:text-white transition touch-manipulation py-1">
                  Siparişlerim
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/wishlist')} className="hover:text-white transition touch-manipulation py-1">
                  Favorilerim
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition touch-manipulation py-1">
                  İade & Değişim
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/faq')} className="hover:text-white transition touch-manipulation py-1">
                  Kargo Bilgileri
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-medium uppercase tracking-wider mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>E-posta: info@viona.com</li>
              <li>Tel: 0850 XXX XX XX</li>
              <li>Adres: Nişantaşı, İstanbul</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 text-center">
          <p className="text-xs text-neutral-500 uppercase tracking-widest">
            © 2025 {siteSettings.siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

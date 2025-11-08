import React, { useState, useEffect } from 'react';
import { X, Mail, Gift } from 'lucide-react';

const NewsletterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // LocalStorage'dan kontrol et
    const hasSeenPopup = localStorage.getItem('viona_newsletter_shown');
    const dismissedAt = localStorage.getItem('viona_newsletter_dismissed');
    
    // Eğer daha önce görmediyse veya 7 günden önce kapatmışsa
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const shouldShow = !hasSeenPopup || (dismissedAt && parseInt(dismissedAt) < sevenDaysAgo);
    
    if (shouldShow) {
      // 3 saniye sonra göster
      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('viona_newsletter_shown', 'true');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('viona_newsletter_dismissed', Date.now().toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      // Burada email API'ye gönderilecek
      console.log('Newsletter email:', email);
      setIsSubmitted(true);
      
      // 2 saniye sonra kapat
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={handleClose}
      />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white max-w-md w-full shadow-2xl pointer-events-auto animate-scale-in overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSubmitted ? (
            <>
              {/* Header with Icon */}
              <div className="bg-gradient-to-br from-amber-50 to-neutral-50 p-8 text-center border-b border-neutral-200">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
                  <Gift className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-3xl font-light uppercase tracking-wider mb-2">
                  Özel Fırsat!
                </h2>
                <p className="text-neutral-600 text-sm tracking-wide">
                  İlk alışverişinizde %15 indirim kazanın
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-center text-neutral-700 mb-6 leading-relaxed">
                  Bültenimize abone olun, yeni koleksiyonlarımızdan ve özel kampanyalarımızdan ilk siz haberdar olun.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      placeholder="Email adresiniz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 border border-neutral-300 focus:border-black focus:outline-none transition-colors text-sm tracking-wide"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-black text-white py-4 hover:bg-neutral-800 transition-all duration-300 text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-95"
                  >
                    %15 İndirim Kodunu Al
                  </button>
                </form>

                <p className="text-xs text-neutral-500 text-center mt-4">
                  İstediğiniz zaman abonelikten çıkabilirsiniz.
                </p>
              </div>
            </>
          ) : (
            // Success State
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-light uppercase tracking-wider mb-2">
                Teşekkürler!
              </h3>
              <p className="text-neutral-600 mb-4">
                İndirim kodunuz email adresinize gönderildi.
              </p>
              <div className="bg-amber-50 border-2 border-dashed border-amber-300 px-6 py-3 inline-block">
                <code className="text-lg font-mono font-semibold text-amber-900">VIONA15</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NewsletterPopup;

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Admin panelden düzenlenebilir olması için settings'den alınabilir
  const phoneNumber = '905551234567'; // +90 555 123 45 67
  const message = 'Merhaba, ürünleriniz hakkında bilgi almak istiyorum.';

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 left-6 z-50">
        {isOpen && (
          <div className="mb-4 bg-white shadow-2xl rounded-lg p-4 w-64 animate-slide-in-up border border-neutral-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">VIONA</h4>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-neutral-100 p-1 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-sm text-neutral-600 mb-3">
              Merhaba! 👋<br />
              Size nasıl yardımcı olabiliriz?
            </p>
            
            <button
              onClick={handleClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp'ta Sohbet Başlat
            </button>
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 group relative"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          )}
          
          {/* Pulse Animation */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></span>
          )}
        </button>
      </div>
    </>
  );
};

export default WhatsAppButton;

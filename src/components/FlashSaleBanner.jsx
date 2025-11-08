import React, { useState, useEffect } from 'react';
import { useFlashSale } from '../contexts/FlashSaleContext';
import { Zap, X } from 'lucide-react';

const FlashSaleBanner = () => {
  const { getActiveFlashSales } = useFlashSale();
  const [activeSales, setActiveSales] = useState([]);
  const [currentSaleIndex, setCurrentSaleIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({});
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const sales = getActiveFlashSales();
    setActiveSales(sales);
  }, []);

  useEffect(() => {
    if (activeSales.length === 0) return;

    const timer = setInterval(() => {
      const sale = activeSales[currentSaleIndex];
      if (!sale) return;

      const now = new Date();
      const end = new Date(sale.endDate);
      const diff = end - now;

      if (diff <= 0) {
        // Kampanya bitti, yeni aktif kampanyaları kontrol et
        const sales = getActiveFlashSales();
        setActiveSales(sales);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSales, currentSaleIndex]);

  useEffect(() => {
    if (activeSales.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSaleIndex((prev) => (prev + 1) % activeSales.length);
    }, 10000); // Her 10 saniyede bir kampanya değiştir

    return () => clearInterval(interval);
  }, [activeSales.length]);

  if (!isVisible || activeSales.length === 0) return null;

  const currentSale = activeSales[currentSaleIndex];

  return (
    <div className="bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 animate-pulse bg-white/10"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Zap size={24} className="animate-pulse" fill="currentColor" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-lg uppercase">{currentSale.name}</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                  %{currentSale.discount} İNDİRİM
                </span>
              </div>
              <p className="text-sm opacity-90">Sınırlı süreli fırsat!</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown Timer */}
            {timeLeft.hours !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-80">Kalan Süre:</span>
                <div className="flex gap-1">
                  <div className="bg-white/20 px-2 py-1 rounded min-w-[40px] text-center">
                    <div className="font-bold text-lg">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-[10px] opacity-80">Saat</div>
                  </div>
                  <div className="flex items-center text-xl font-bold">:</div>
                  <div className="bg-white/20 px-2 py-1 rounded min-w-[40px] text-center">
                    <div className="font-bold text-lg">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-[10px] opacity-80">Dak</div>
                  </div>
                  <div className="flex items-center text-xl font-bold">:</div>
                  <div className="bg-white/20 px-2 py-1 rounded min-w-[40px] text-center">
                    <div className="font-bold text-lg">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-[10px] opacity-80">San</div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Multiple Sales Indicator */}
        {activeSales.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {activeSales.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSaleIndex(index)}
                className={`h-1 rounded-full transition-all ${
                  index === currentSaleIndex ? 'w-8 bg-white' : 'w-2 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashSaleBanner;

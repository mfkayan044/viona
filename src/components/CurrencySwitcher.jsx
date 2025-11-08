import React from 'react';
import { DollarSign } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const currencies = [
  { code: 'TRY', name: 'Türk Lirası', symbol: '₺', flag: '🇹🇷' },
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' }
];

export default function CurrencySwitcher() {
  const { currency, changeCurrency } = useCurrency();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentCurrency = currencies.find(c => c.code === currency);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-neutral-100 rounded-lg transition"
      >
        <DollarSign size={18} />
        <span className="hidden md:inline">{currentCurrency?.symbol} {currentCurrency?.code}</span>
        <span className="md:hidden">{currentCurrency?.symbol}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
            {currencies.map((curr) => (
              <button
                key={curr.code}
                onClick={() => {
                  changeCurrency(curr.code);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-neutral-50 transition ${
                  currency === curr.code ? 'bg-neutral-100 font-medium' : ''
                }`}
              >
                <span className="text-2xl">{curr.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{curr.symbol} {curr.code}</div>
                  <div className="text-xs text-neutral-500">{curr.name}</div>
                </div>
                {currency === curr.code && (
                  <span className="text-green-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

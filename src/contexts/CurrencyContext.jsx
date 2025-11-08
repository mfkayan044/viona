import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

const exchangeRates = {
  TRY: 1,
  USD: 0.032, // 1 TL = 0.032 USD (örnek kur)
  EUR: 0.030  // 1 TL = 0.030 EUR (örnek kur)
};

const currencySymbols = {
  TRY: '₺',
  USD: '$',
  EUR: '€'
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'TRY';
  });

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const convert = (amount, from = 'TRY', to = currency) => {
    // Convert to TRY first
    const inTRY = amount / exchangeRates[from];
    // Then convert to target currency
    const converted = inTRY * exchangeRates[to];
    return converted;
  };

  const formatPrice = (price, showSymbol = true) => {
    const converted = convert(price);
    const formatted = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(converted);
    
    return showSymbol ? `${currencySymbols[currency]}${formatted}` : formatted;
  };

  const changeCurrency = (newCurrency) => {
    if (exchangeRates[newCurrency]) {
      setCurrency(newCurrency);
    }
  };

  const value = {
    currency,
    changeCurrency,
    convert,
    formatPrice,
    symbol: currencySymbols[currency],
    rates: exchangeRates
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

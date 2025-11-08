import React, { createContext, useContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonList, setComparisonList] = useState(() => {
    const saved = localStorage.getItem('comparisonList');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('comparisonList', JSON.stringify(comparisonList));
  }, [comparisonList]);

  const addToComparison = (product) => {
    // Maksimum 4 ürün karşılaştırılabilir
    if (comparisonList.length >= 4) {
      return { success: false, message: 'En fazla 4 ürün karşılaştırabilirsiniz!' };
    }
    
    // Ürün zaten listede mi?
    if (comparisonList.find(p => p.id === product.id)) {
      return { success: false, message: 'Bu ürün zaten karşılaştırma listesinde!' };
    }

    setComparisonList([...comparisonList, product]);
    return { success: true, message: 'Ürün karşılaştırma listesine eklendi!' };
  };

  const removeFromComparison = (productId) => {
    setComparisonList(comparisonList.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (productId) => {
    return comparisonList.some(p => p.id === productId);
  };

  const value = {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    comparisonCount: comparisonList.length
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

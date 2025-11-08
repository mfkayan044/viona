import React, { Suspense } from 'react';

const LoadingFallback = ({ message = 'Yükleniyor...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
        <p className="text-neutral-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

export default LoadingFallback;

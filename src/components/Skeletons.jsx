import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-neutral-200 animate-pulse">
      <div className="aspect-square bg-neutral-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
        <div className="flex gap-2">
          <div className="h-8 bg-neutral-200 rounded flex-1"></div>
          <div className="h-8 w-8 bg-neutral-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ProductDetailSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="aspect-square bg-neutral-200 rounded"></div>
          <div className="grid grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>

          <div className="flex gap-4">
            <div className="h-12 bg-neutral-200 rounded flex-1"></div>
            <div className="h-12 w-12 bg-neutral-200 rounded"></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const HeaderSkeleton = () => {
  return (
    <div className="bg-white border-b border-neutral-200 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="h-8 bg-neutral-200 rounded w-32"></div>
        <div className="flex gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-6 bg-neutral-200 rounded w-16"></div>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-8 bg-neutral-200 rounded"></div>
          <div className="h-8 w-8 bg-neutral-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export const ImageSkeleton = ({ className = '' }) => {
  return (
    <div className={`bg-neutral-200 animate-pulse ${className}`}>
      <div className="w-full h-full flex items-center justify-center">
        <svg className="w-12 h-12 text-neutral-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
};

export const ListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="animate-pulse flex gap-4 p-4 bg-white border border-neutral-200">
          <div className="w-20 h-20 bg-neutral-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const TextSkeleton = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div 
          key={i} 
          className="h-4 bg-neutral-200 rounded" 
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        ></div>
      ))}
    </div>
  );
};

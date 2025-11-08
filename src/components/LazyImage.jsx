import React, { useState, useEffect, useRef } from 'react';

const LazyImage = ({ src, alt, className, placeholder = '/placeholder.jpg' }) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let observer;
    let didCancel = false;

    if (imageRef && imageSrc === placeholder) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          entries => {
            entries.forEach(entry => {
              if (
                !didCancel &&
                (entry.intersectionRatio > 0 || entry.isIntersecting)
              ) {
                setIsLoading(true);
                setImageSrc(src);
                observer.unobserve(imageRef);
              }
            });
          },
          {
            threshold: 0.01,
            rootMargin: '75px',
          }
        );
        observer.observe(imageRef);
      } else {
        // Fallback for browsers that don't support IntersectionObserver
        setImageSrc(src);
      }
    }
    return () => {
      didCancel = true;
      if (observer && observer.unobserve && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageSrc, imageRef, placeholder]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'blur-sm' : 'blur-0'} transition-all duration-300`}
      onLoad={() => setIsLoading(false)}
      loading="lazy"
    />
  );
};

export default LazyImage;

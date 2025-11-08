import { useEffect } from 'react';

export const useSmoothScroll = () => {
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();

      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80; // Header yüksekliği
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // URL'i güncelle (opsiyonel)
        if (window.history.pushState) {
          window.history.pushState(null, null, href);
        }
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);
};

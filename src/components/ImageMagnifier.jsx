import React, { useState, useRef } from 'react';

const ImageMagnifier = ({ src, alt, magnifierSize = 150, zoomLevel = 1.5 }) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const handleMouseEnter = () => {
    setShowMagnifier(true);
  };

  const handleMouseLeave = () => {
    setShowMagnifier(false);
  };

  const handleMouseMove = (e) => {
    const img = imgRef.current;
    if (!img) return;

    const { left, top, width, height } = img.getBoundingClientRect();
    
    // Cursor pozisyonu (image içinde)
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Cursor pozisyonunu yüzde olarak hesapla
    const xPercent = (x / width) * 100;
    const yPercent = (y / height) * 100;

    setCursorPosition({ x, y });
    setMagnifierPosition({ x: xPercent, y: yPercent });
  };

  return (
    <div 
      className="relative overflow-hidden cursor-crosshair"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <img 
        ref={imgRef}
        src={src} 
        alt={alt}
        className="w-full h-full object-cover"
      />

      {/* Magnifier Lens */}
      {showMagnifier && (
        <div
          className="absolute border-4 border-white shadow-2xl rounded-full pointer-events-none"
          style={{
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            left: `${cursorPosition.x - magnifierSize / 2}px`,
            top: `${cursorPosition.y - magnifierSize / 2}px`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${imgRef.current?.width * zoomLevel}px ${imgRef.current?.height * zoomLevel}px`,
            backgroundPosition: `-${(cursorPosition.x * zoomLevel) - (magnifierSize / 2)}px -${(cursorPosition.y * zoomLevel) - (magnifierSize / 2)}px`,
            backgroundRepeat: 'no-repeat',
            zIndex: 10,
          }}
        />
      )}

      {/* Zoom Hint */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Yakınlaştırmak için fareyi hareket ettirin
      </div>
    </div>
  );
};

export default ImageMagnifier;

// Dosyayı base64'e çevirme fonksiyonu
export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Görsel boyutunu kontrol etme
export const validateImageSize = (file, maxSizeMB = 5) => {
  const maxSize = maxSizeMB * 1024 * 1024; // MB to bytes
  return file.size <= maxSize;
};

// Görsel formatını kontrol etme
export const validateImageFormat = (file) => {
  const validFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validFormats.includes(file.type);
};

// Görseli yeniden boyutlandırma (opsiyonel)
export const resizeImage = (file, maxWidth = 1920, maxHeight = 1080) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Oranı koruyarak boyutlandır
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => {
            resolve(reader.result);
          };
        }, file.type, 0.9); // 90% kalite
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

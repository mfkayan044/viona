export const formatPrice = (price) => {
  return price.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^(\+90|0)?[0-9]{10}$/;
  return re.test(phone.replace(/\s/g, ''));
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

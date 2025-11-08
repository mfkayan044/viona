export const ADMIN_PASSWORD = 'viona2024';

export const CURRENCY = '₺';

export const ROUTES = {
  HOME: '/',
  ADMIN_LOGIN: '/admin-login',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_SETTINGS: '/admin/settings'
};

export const DEFAULT_SETTINGS = {
  siteName: 'VIONA',
  logo: '✨',
  slogan: 'Handcrafted Beaded Elegance',
  about: 'Her biri özenle, tek tek boncuk dizilerek hazırlanan benzersiz çantalar. Geleneksel el sanatlarını modern tasarımla buluşturuyoruz.',
  phone: '+90 555 123 45 67',
  email: 'info@viona.com',
  instagram: '@viona_bags',
  address: 'İstanbul, Türkiye'
};

export const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: 'Kristal Akşam Çantası',
    price: 2500,
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=500',
    description: 'Şeffaf kristal boncuklarla süslenmiş zarif akşam çantası',
    stock: 3,
    featured: true
  },
  {
    id: 2,
    name: 'Vintage İnci Clutch',
    price: 1850,
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
    description: 'Vintage tarzı inci boncuklu özel tasarım clutch',
    stock: 5,
    featured: true
  },
  {
    id: 3,
    name: 'Geometrik Mini Çanta',
    price: 1950,
    image: 'https://images.unsplash.com/photo-1564422167509-4f3a6833fb41?w=500',
    description: 'Modern geometrik desenli mini el çantası',
    stock: 4,
    featured: false
  }
];

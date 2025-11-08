import { productService } from '../services/supabase.service';

// Demo products verisi
const demoProducts = [
  {
    name: 'Kristal Akşam Çantası',
    description: 'Zarif kristal taşlarla süslenmiş lüks akşam çantası',
    price: 2499,
    category: 'Akşam Çantası',
    color: 'gümüş',
    image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80',
    stock: 15,
    is_new: true,
    is_featured: true
  },
  {
    name: 'Vintage Deri Sırt Çantası',
    description: 'Klasik tasarımlı hakiki deri sırt çantası',
    price: 1899,
    category: 'Sırt Çantası',
    color: 'kahverengi',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
    stock: 20,
    is_new: false,
    is_featured: true
  },
  {
    name: 'Modern Laptop Çantası',
    description: 'İş kadınları için şık ve fonksiyonel laptop çantası',
    price: 1599,
    category: 'İş Çantası',
    color: 'siyah',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    stock: 12,
    is_new: true,
    is_featured: false
  },
  {
    name: 'Yaz Hasır Çanta',
    description: 'El yapımı hasır plaj çantası',
    price: 899,
    category: 'Plaj Çantası',
    color: 'bej',
    image: 'https://images.unsplash.com/photo-1564422167509-4f3a6833fb41?w=800&q=80',
    stock: 25,
    is_new: false,
    is_featured: false
  },
  {
    name: 'Premium Deri El Çantası',
    description: 'İtalyan deriden üretilmiş lüks el çantası',
    price: 3299,
    category: 'El Çantası',
    color: 'kırmızı',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    stock: 8,
    is_new: true,
    is_featured: true
  },
  {
    name: 'Spor Duffle Çanta',
    description: 'Geniş hacimli spor salonu çantası',
    price: 1299,
    category: 'Spor Çantası',
    color: 'lacivert',
    image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&q=80',
    stock: 18,
    is_new: false,
    is_featured: false
  },
  {
    name: 'Çapraz Askılı Mini Çanta',
    description: 'Günlük kullanım için pratik mini çanta',
    price: 799,
    category: 'Çapraz Çanta',
    color: 'pembe',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80',
    stock: 30,
    is_new: false,
    is_featured: false
  },
  {
    name: 'Boho Tarzı Kol Çantası',
    description: 'Bohem tarzında püsküllü kol çantası',
    price: 1199,
    category: 'Kol Çantası',
    color: 'kahverengi',
    image: 'https://images.unsplash.com/photo-1590739225017-e5774c67e0f4?w=800&q=80',
    stock: 14,
    is_new: false,
    is_featured: false
  },
  {
    name: 'Luxury Tote Çanta',
    description: 'Geniş ve şık alışveriş çantası',
    price: 1799,
    category: 'Tote Çanta',
    color: 'siyah',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80',
    stock: 16,
    is_new: true,
    is_featured: true
  },
  {
    name: 'Vintage Postacı Çantası',
    description: 'Retro tarzda omuz çantası',
    price: 1399,
    category: 'Omuz Çantası',
    color: 'yeşil',
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=80',
    stock: 11,
    is_new: false,
    is_featured: false
  }
];

export async function seedProducts() {
  try {
    console.log('🌱 Supabase\'e demo ürünler ekleniyor...');
    
    let successCount = 0;
    let errorCount = 0;

    for (const product of demoProducts) {
      try {
        await productService.create(product);
        successCount++;
        console.log(`✅ ${product.name} eklendi`);
      } catch (error) {
        errorCount++;
        console.error(`❌ ${product.name} eklenemedi:`, error.message);
      }
    }

    console.log(`\n📊 Sonuç: ${successCount} başarılı, ${errorCount} hata`);
    
    if (successCount === demoProducts.length) {
      console.log('🎉 Tüm ürünler başarıyla eklendi!');
      return true;
    } else {
      console.warn('⚠️ Bazı ürünler eklenemedi');
      return false;
    }
  } catch (error) {
    console.error('❌ Seed işlemi başarısız:', error);
    return false;
  }
}

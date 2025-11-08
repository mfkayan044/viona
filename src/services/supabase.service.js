import { supabase } from '../lib/supabase';

// =====================================================
// PRODUCTS
// =====================================================

export const productService = {
  // Tüm ürünleri getir
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // ID'ye göre ürün getir
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni ürün ekle
  async create(product) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ürün güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ürün sil
  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// ORDERS
// =====================================================

export const orderService = {
  // Tüm siparişleri getir
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Kullanıcının siparişlerini getir
  async getByUser(userId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Sipariş oluştur
  async create(order) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sipariş durumu güncelle
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sipariş sil
  async delete(id) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// =====================================================
// HERO IMAGES
// =====================================================

export const heroImageService = {
  // Aktif hero görsellerini getir
  async getAll() {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Hero görsel ekle
  async create(imageUrl, orderIndex = 0) {
    const { data, error } = await supabase
      .from('hero_images')
      .insert([{ image_url: imageUrl, order_index: orderIndex }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Hero görsel güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('hero_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Hero görsel sil
  async delete(id) {
    const { error } = await supabase
      .from('hero_images')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// SITE SETTINGS
// =====================================================

export const siteSettingsService = {
  // Site ayarlarını getir
  async get() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      // Eğer kayıt yoksa null dön
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    
    return data;
  },

  // Site ayarlarını güncelle
  async update(settings) {
    // Önce mevcut kaydı al
    const existing = await this.get();
    
    if (existing) {
      // Varsa güncelle
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          logo: settings.logo,
          site_name: settings.siteName,
          slogan: settings.slogan,
          about: settings.about,
          phone: settings.phone,
          email: settings.email,
          instagram: settings.instagram,
          address: settings.address,
          updated_at: new Date()
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      // Yoksa yeni kayıt oluştur
      const { data, error } = await supabase
        .from('site_settings')
        .insert([{
          logo: settings.logo,
          site_name: settings.siteName,
          slogan: settings.slogan,
          about: settings.about,
          phone: settings.phone,
          email: settings.email,
          instagram: settings.instagram,
          address: settings.address
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

// =====================================================
// CATEGORIES
// =====================================================

export const categoryService = {
  // Tüm kategorileri getir
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Kategori ekle
  async create(name) {
    // Son sıra numarasını al
    const { data: lastCategory } = await supabase
      .from('categories')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    const nextOrder = lastCategory ? lastCategory.order_index + 1 : 1;
    
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: name,
        order_index: nextOrder,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kategori sil (soft delete - is_active = false)
  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Kategori güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// COLORS
// =====================================================

export const colorService = {
  // Tüm renkleri getir
  async getAll() {
    const { data, error } = await supabase
      .from('colors')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Renk ekle
  async create(name, hexCode = null) {
    // Son sıra numarasını al
    const { data: lastColor } = await supabase
      .from('colors')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();
    
    const nextOrder = lastColor ? lastColor.order_index + 1 : 1;
    
    const { data, error } = await supabase
      .from('colors')
      .insert([{
        name: name,
        hex_code: hexCode,
        order_index: nextOrder,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Renk sil (soft delete - is_active = false)
  async delete(id) {
    const { error } = await supabase
      .from('colors')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Renk güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('colors')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// REVIEWS
// =====================================================

export const reviewService = {
  // Tüm yorumları getir
  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Ürüne göre yorumları getir
  async getByProduct(productId) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false});
    
    if (error) throw error;
    return data;
  },

  // Yorum ekle
  async create(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        product_id: review.productId,
        user_name: review.userName,
        user_email: review.userEmail,
        rating: review.rating,
        comment: review.comment
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yorum güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yorum sil
  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// BLOG POSTS
// =====================================================

export const blogService = {
  // Tüm blog yazılarını getir
  async getAll() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Blog yazısı ekle
  async create(post) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        image: post.image,
        category: post.category,
        tags: post.tags,
        author: post.author
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Blog yazısı güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Blog yazısı sil
  async delete(id) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// CONTACT MESSAGES
// =====================================================

export const contactService = {
  // Tüm mesajları getir
  async getAll() {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Mesaj ekle
  async create(message) {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Mesaj sil
  async delete(id) {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// FAQS
// =====================================================

export const faqService = {
  // Tüm SSS'leri getir
  async getAll() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // SSS ekle
  async create(faq) {
    const { data, error } = await supabase
      .from('faqs')
      .insert([{
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        order_index: faq.order || 0
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // SSS güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('faqs')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // SSS sil
  async delete(id) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// COUPONS
// =====================================================

export const couponService = {
  // Tüm kuponları getir
  async getAll() {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Kod ile kupon bul
  async getByCode(code) {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Kupon ekle
  async create(coupon) {
    const { data, error } = await supabase
      .from('coupons')
      .insert([{
        code: coupon.code,
        discount_type: coupon.type,
        discount_value: coupon.value,
        min_purchase: coupon.minPurchase || 0,
        max_discount: coupon.maxDiscount || null,
        expires_at: coupon.expiresAt || null,
        usage_limit: coupon.usageLimit || null,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kupon kullan (usage_count artır)
  async use(id) {
    // Usage count artırmak için mevcut değeri al ve +1 ekle
    const { data: current } = await supabase
      .from('coupons')
      .select('usage_count')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('coupons')
      .update({ 
        usage_count: (current?.usage_count || 0) + 1,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kupon sil
  async delete(id) {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// FLASH SALES
// =====================================================

export const flashSaleService = {
  // Tüm flaş satışları getir
  async getAll() {
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Aktif flaş satışları getir
  async getActive() {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('flash_sales')
      .select('*')
      .eq('is_active', true)
      .lte('start_time', now)
      .gte('end_time', now);
    
    if (error) throw error;
    return data;
  },

  // Flaş satış ekle
  async create(sale) {
    const { data, error } = await supabase
      .from('flash_sales')
      .insert([{
        product_id: sale.productId,
        discount_percentage: sale.discount,
        start_time: sale.startTime,
        end_time: sale.endTime,
        stock_limit: sale.stockLimit || null,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Flaş satış güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('flash_sales')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Flaş satış sil
  async delete(id) {
    const { error } = await supabase
      .from('flash_sales')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
};

// =====================================================
// PAYMENT METHODS
// =====================================================

export const paymentMethodService = {
  // Tüm ödeme yöntemlerini getir
  async getAll() {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Aktif ödeme yöntemlerini getir
  async getActive() {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Code ile ödeme yöntemi getir
  async getByCode(code) {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('code', code)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Ödeme yöntemi güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('payment_methods')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Aktif/Pasif durumunu değiştir
  async toggleActive(id, isActive) {
    return await this.update(id, { is_active: isActive });
  }
};

// =====================================================
// SEO SETTINGS
// =====================================================

export const seoService = {
  // Tüm SEO ayarlarını getir
  async getAll() {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('page', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Sayfa bazlı SEO ayarı getir
  async getByPage(page) {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page', page)
      .single();
    
    if (error) throw error;
    return data;
  },

  // SEO ayarı güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('seo_settings')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni SEO ayarı ekle
  async create(seoData) {
    const { data, error } = await supabase
      .from('seo_settings')
      .insert([seoData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// =====================================================
// USERS
// =====================================================

export const userService = {
  // Tüm kullanıcıları getir
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // ID'ye göre kullanıcı getir
  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle(); // single() yerine maybeSingle() - profil yoksa null döner, hata vermez
    
    if (error) throw error;
    return data;
  },

  // Email'e göre kullanıcı getir
  async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Yeni kullanıcı ekle
  async create(user) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kullanıcı güncelle
  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Kullanıcı sil
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Son giriş zamanını güncelle
  async updateLastLogin(id) {
    return await this.update(id, { last_login: new Date() });
  }
};

// =====================================================
// ANALYTICS
// =====================================================

export const analyticsService = {
  // Event ekle
  async trackEvent(eventType, eventData = {}, userId = null) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        event_data: eventData,
        user_id: userId,
        session_id: sessionStorage.getItem('session_id') || crypto.randomUUID()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Dashboard istatistikleri
  async getDashboardStats() {
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Satış analitiği (son 30 gün)
  async getSalesAnalytics() {
    const { data, error } = await supabase
      .from('sales_analytics')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Ürün performansı
  async getProductPerformance() {
    const { data, error } = await supabase
      .from('product_performance')
      .select('*')
      .limit(10);
    
    if (error) throw error;
    return data;
  },

  // Belirli tarih aralığında eventler
  async getEventsByDateRange(startDate, endDate, eventType = null) {
    let query = supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// ====================================
// Notification Service
// ====================================
export const notificationService = {
  // Tüm bildirimleri getir
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Okunmamış bildirimleri getir
  async getUnread() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Bildirim oluştur
  async create(notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data || null,
        priority: notification.priority || 'normal'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Bildirimi okundu olarak işaretle
  async markAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Tümünü okundu olarak işaretle
  async markAllAsRead() {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);
    
    if (error) throw error;
  },

  // Bildirimi sil
  async delete(id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Tüm okunmuş bildirimleri sil
  async deleteRead() {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('is_read', true);
    
    if (error) throw error;
  }
};

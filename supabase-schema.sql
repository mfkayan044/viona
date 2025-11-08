-- =====================================================
-- VIONA E-COMMERCE DATABASE SCHEMA
-- =====================================================

-- Products Tablosu
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  color TEXT,
  image TEXT,
  stock INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Tablosu
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer', -- customer, admin
  status TEXT DEFAULT 'active', -- active, blocked
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Tablosu
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL, -- [{productId, name, price, quantity, image}]
  total DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, processing, shipped, completed, cancelled
  payment_method TEXT DEFAULT 'Kredi Kartı',
  shipping_address JSONB, -- {street, city, zip, country}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews Tablosu
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  user_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Tablosu
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  image TEXT,
  author TEXT DEFAULT 'Admin',
  category TEXT DEFAULT 'fashion',
  tags TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Tablosu
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- unread, read, replied
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Tablosu
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coupons Tablosu
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount INTEGER NOT NULL CHECK (discount >= 0 AND discount <= 100),
  type TEXT DEFAULT 'percentage', -- percentage, fixed
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flash Sales Tablosu
CREATE TABLE flash_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  discount INTEGER NOT NULL CHECK (discount >= 0 AND discount <= 100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Tablosu
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'order', -- order, message, inventory, system
  priority TEXT DEFAULT 'medium', -- low, medium, high
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_flash_sales_product_id ON flash_sales(product_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) Policies
-- =====================================================

-- Products - Herkes okuyabilir, sadece admin yazabilir
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Products are editable by admins only" ON products FOR ALL USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Users - Kullanıcılar sadece kendi bilgilerini görebilir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (
  auth.uid()::text = id::text
);

-- Orders - Kullanıcılar kendi siparişlerini görebilir
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  auth.uid()::text = user_id::text
);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (true);

-- Reviews - Herkes okuyabilir, kullanıcılar yazabilir
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON reviews FOR INSERT WITH CHECK (
  auth.role() = 'authenticated'
);

-- Blog Posts - Herkes okuyabilir
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Blog posts are viewable by everyone" ON blog_posts FOR SELECT USING (published = true);

-- Contact Messages - Herkes gönderebilir
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- FAQ - Herkes okuyabilir
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "FAQs are viewable by everyone" ON faqs FOR SELECT USING (true);

-- Coupons - Herkes okuyabilir
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Coupons are viewable by everyone" ON coupons FOR SELECT USING (is_active = true);

-- Flash Sales - Herkes okuyabilir
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flash sales are viewable by everyone" ON flash_sales FOR SELECT USING (is_active = true);

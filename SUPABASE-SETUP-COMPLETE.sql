-- ====================================
-- VIONA E-TİCARET - SUPABASE COMPLETE SETUP
-- Bu SQL dosyasını Supabase Dashboard'da çalıştırın
-- ====================================

-- ====================================
-- 1. SEO Settings Table
-- ====================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(200),
  description TEXT,
  keywords TEXT,
  og_image VARCHAR(500),
  canonical_url VARCHAR(500),
  robots VARCHAR(50) DEFAULT 'index,follow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO seo_settings (page, title, description, keywords, og_image, canonical_url) VALUES
('home', 'Viona Çanta - Kaliteli ve Şık Çantalar', 'En yeni çanta modelleri ve trendleri ile tanışın.', 'çanta, kadın çantası, erkek çantası', NULL, NULL),
('products', 'Ürünler - Viona Çanta', 'Kaliteli çanta koleksiyonumuzu keşfedin.', 'çanta koleksiyonu', NULL, NULL),
('about', 'Hakkımızda - Viona Çanta', 'Viona Çanta hikayesi.', 'hakkımızda', NULL, NULL),
('contact', 'İletişim - Viona Çanta', 'Bizimle iletişime geçin.', 'iletişim', NULL, NULL)
ON CONFLICT (page) DO NOTHING;

-- ====================================
-- 2. Users Table (Supabase Auth ile uyumlu)
-- ====================================
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY, -- Supabase Auth ID buraya gelecek
  user_number SERIAL UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  status VARCHAR(20) DEFAULT 'active',
  avatar VARCHAR(500),
  addresses JSONB DEFAULT '[]'::jsonb,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 3. Analytics Events Table
-- ====================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 4. Admin Notifications Table
-- ====================================
DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- 'new_order', 'low_stock', 'new_user', 'payment_received', 'return_request'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Ek bilgiler (order_id, product_id, vb.)
  is_read BOOLEAN DEFAULT false,
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- 5. Dashboard Stats VIEW
-- ====================================
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'delivered') as completed_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE stock > 0) as in_stock_products,
  (SELECT COUNT(*) FROM products WHERE stock = 0) as out_of_stock_products,
  (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered') as total_revenue,
  (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue,
  (SELECT COALESCE(AVG(total), 0) FROM orders WHERE status = 'delivered') as average_order_value;

-- ====================================
-- 6. Sales Analytics VIEW
-- ====================================
CREATE OR REPLACE VIEW sales_analytics AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as order_count,
  SUM(total) as revenue,
  AVG(total) as avg_order_value
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- ====================================
-- 7. Product Performance VIEW
-- ====================================
CREATE OR REPLACE VIEW product_performance AS
SELECT
  p.id,
  p.name,
  p.category,
  p.price,
  p.stock,
  COUNT(DISTINCT o.id) as times_ordered,
  COALESCE(SUM((oi->>'quantity')::int), 0) as total_quantity_sold,
  COALESCE(SUM((oi->>'quantity')::int * p.price), 0) as total_revenue
FROM products p
LEFT JOIN orders o ON o.status = 'delivered'
LEFT JOIN LATERAL jsonb_array_elements(o.items) oi ON (oi->>'id')::uuid = p.id
GROUP BY p.id, p.name, p.category, p.price, p.stock
ORDER BY total_revenue DESC;

-- ====================================
-- 8. RLS Policies
-- ====================================

-- SEO Settings
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view SEO settings" ON seo_settings;
DROP POLICY IF EXISTS "Anyone can update SEO settings" ON seo_settings;
DROP POLICY IF EXISTS "Anyone can insert SEO settings" ON seo_settings;

CREATE POLICY "Anyone can view SEO settings" ON seo_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update SEO settings" ON seo_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert SEO settings" ON seo_settings FOR INSERT WITH CHECK (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Anyone can update users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;
DROP POLICY IF EXISTS "Anyone can delete users" ON users;

CREATE POLICY "Anyone can view users" ON users FOR SELECT USING (true);
CREATE POLICY "Anyone can update users" ON users FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete users" ON users FOR DELETE USING (true);

-- Analytics Events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view analytics" ON analytics_events;
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;

CREATE POLICY "Anyone can view analytics" ON analytics_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can update notifications" ON notifications;
DROP POLICY IF EXISTS "Anyone can delete notifications" ON notifications;

CREATE POLICY "Anyone can view notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete notifications" ON notifications FOR DELETE USING (true);

-- ====================================
-- 9. Indexes
-- ====================================
CREATE INDEX IF NOT EXISTS idx_seo_settings_page ON seo_settings(page);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- ====================================
-- TAMAMLANDI! ✅
-- ====================================

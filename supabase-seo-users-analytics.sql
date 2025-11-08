-- ====================================
-- SEO Settings Table
-- ====================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page VARCHAR(100) UNIQUE NOT NULL, -- 'home', 'products', 'about', 'contact', etc.
  title VARCHAR(200),
  description TEXT,
  keywords TEXT,
  og_image VARCHAR(500),
  canonical_url VARCHAR(500),
  robots VARCHAR(50) DEFAULT 'index,follow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default SEO Settings
INSERT INTO seo_settings (page, title, description, keywords, og_image, canonical_url) VALUES
('home', 'Viona Çanta - Kaliteli ve Şık Çantalar', 'En yeni çanta modelleri ve trendleri ile tanışın. Kadın çantaları, erkek çantaları ve daha fazlası.', 'çanta, kadın çantası, erkek çantası, sırt çantası, el çantası', 'https://your-domain.com/og-home.jpg', 'https://your-domain.com'),
('products', 'Ürünler - Viona Çanta', 'Kaliteli çanta koleksiyonumuzu keşfedin. Her tarza uygun çeşitler.', 'çanta koleksiyonu, çanta modelleri, online çanta', NULL, 'https://your-domain.com/products'),
('about', 'Hakkımızda - Viona Çanta', 'Viona Çanta hikayesi, vizyonumuz ve kalite anlayışımız.', 'hakkımızda, viona çanta, marka hikayesi', NULL, 'https://your-domain.com/about'),
('contact', 'İletişim - Viona Çanta', 'Bizimle iletişime geçin. Sorularınız için buradayız.', 'iletişim, müşteri hizmetleri, destek', NULL, 'https://your-domain.com/contact');

-- ====================================
-- Users Table
-- ====================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY, -- Supabase Auth ID - DEFAULT YOK!
  user_number SERIAL UNIQUE NOT NULL, -- Otomatik artan sayı ID
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer', -- 'admin', 'customer', 'manager'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'suspended'
  avatar VARCHAR(500),
  addresses JSONB DEFAULT '[]'::jsonb, -- Kullanıcı adresleri
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- Analytics Events Table
-- ====================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'product_view', 'add_to_cart', 'purchase', 'search'
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  session_id VARCHAR(100),
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================
-- Dashboard Stats View
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
-- Sales Analytics View (Last 30 Days)
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
-- Product Performance View
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
-- RLS Policies
-- ====================================

-- SEO Settings
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view SEO settings"
ON seo_settings FOR SELECT
USING (true);

CREATE POLICY "Anyone can update SEO settings"
ON seo_settings FOR UPDATE
USING (true);

CREATE POLICY "Anyone can insert SEO settings"
ON seo_settings FOR INSERT
WITH CHECK (true);

-- Users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view users"
ON users FOR SELECT
USING (true);

CREATE POLICY "Anyone can update users"
ON users FOR UPDATE
USING (true);

CREATE POLICY "Anyone can insert users"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can delete users"
ON users FOR DELETE
USING (true);

-- Analytics Events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view analytics"
ON analytics_events FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert analytics"
ON analytics_events FOR INSERT
WITH CHECK (true);

-- ====================================
-- Indexes
-- ====================================
CREATE INDEX idx_seo_settings_page ON seo_settings(page);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);

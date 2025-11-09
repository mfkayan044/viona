-- Notifications (Bildirimler) Tablosu - Mevcut tabloyu güncelle veya yeniden oluştur

-- Önce mevcut tabloyu sil (sadece ilk kurulumda)
-- DROP TABLE IF EXISTS notifications CASCADE;

-- Tabloyu oluştur
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- order, review, contact, low_stock
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB, -- Ek bilgiler (link, order_id, vb.)
  priority TEXT DEFAULT 'normal', -- urgent, high, normal, low
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Eski policy'leri temizle
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON notifications;

-- Yeni policy'ler
CREATE POLICY "Anyone can view notifications" ON notifications
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update notifications" ON notifications
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete notifications" ON notifications
  FOR DELETE
  USING (true);

-- Örnek bildirimler ekle
INSERT INTO notifications (type, title, message, data, priority) VALUES
  ('order', 'Yeni Sipariş', 'VN12345678 numaralı sipariş alındı', '{"link": "/admin/orders"}'::jsonb, 'high'),
  ('review', 'Yeni Yorum', 'Bir ürüne yeni yorum yapıldı', '{"link": "/admin/reviews"}'::jsonb, 'normal')
ON CONFLICT DO NOTHING;

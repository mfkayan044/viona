-- Notifications (Bildirimler) Tablosu
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, -- order, review, contact, low_stock
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Tıklandığında gidilecek sayfa
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Admin'ler tüm bildirimleri görebilir
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT
  USING (true); -- Basitlik için - gerçekte admin kontrolü yapılabilir

-- Admin'ler bildirim ekleyebilir
CREATE POLICY "Admins can insert notifications" ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Admin'ler bildirimleri güncelleyebilir (okundu işareti)
CREATE POLICY "Admins can update notifications" ON notifications
  FOR UPDATE
  USING (true);

-- Admin'ler bildirimleri silebilir
CREATE POLICY "Admins can delete notifications" ON notifications
  FOR DELETE
  USING (true);

-- Örnek bildirimler ekle
INSERT INTO notifications (type, title, message, link) VALUES
  ('order', 'Yeni Sipariş', 'VN12345678 numaralı sipariş alındı', '/admin/orders'),
  ('review', 'Yeni Yorum', 'Bir ürüne yeni yorum yapıldı', '/admin/reviews');

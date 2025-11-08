-- Payment Methods Table
-- Ödeme yöntemlerini yönetmek için tablo

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'credit-card', 'bank-transfer', 'cash-on-delivery'
  name VARCHAR(100) NOT NULL, -- 'Kredi/Banka Kartı', 'Banka Havalesi/EFT', 'Kapıda Ödeme'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Banka havalesi için IBAN bilgileri
  bank_name VARCHAR(100),
  iban VARCHAR(50),
  account_holder VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Default ödeme yöntemlerini ekle
INSERT INTO payment_methods (code, name, description, is_active, order_index, bank_name, iban, account_holder) VALUES
('credit-card', 'Kredi/Banka Kartı', 'Güvenli online ödeme ile kartınızdan hemen tahsilat yapılır.', true, 1, NULL, NULL, NULL),
('bank-transfer', 'Banka Havalesi/EFT', 'Banka hesabımıza havale/EFT yaparak ödeme yapabilirsiniz.', true, 2, 'Ziraat Bankası', 'TR00 0000 0000 0000 0000 0000 00', 'VIONA ÇANTA'),
('cash-on-delivery', 'Kapıda Ödeme', 'Siparişiniz kapınıza geldiğinde kargo görevlisine ödeme yapın.', true, 3, NULL, NULL, NULL);

-- RLS Policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Herkes aktif ödeme yöntemlerini görebilir
CREATE POLICY "Anyone can view active payment methods"
ON payment_methods FOR SELECT
USING (is_active = true);

-- Herkes tüm ödeme yöntemlerini görebilir (admin için)
CREATE POLICY "Anyone can view all payment methods"
ON payment_methods FOR SELECT
USING (true);

-- Herkes ödeme yöntemlerini güncelleyebilir (GEÇİCİ - production'da admin-only yapın)
CREATE POLICY "Anyone can update payment methods"
ON payment_methods FOR UPDATE
USING (true);

-- Index'ler
CREATE INDEX idx_payment_methods_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_order ON payment_methods(order_index);

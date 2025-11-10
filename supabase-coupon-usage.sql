-- ====================================
-- KUPON KULLANIM TAKİP SİSTEMİ
-- ====================================
-- Her müşteri her kuponu sadece 1 kere kullanabilir

-- 1. Kupon kullanım tablosu oluştur
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_code TEXT NOT NULL,
  user_email TEXT NOT NULL, -- Kullanıcı email'i (guest için)
  user_id UUID REFERENCES users(id), -- Kayıtlı kullanıcı için
  order_id UUID REFERENCES orders(id), -- Hangi siparişte kullanıldı
  discount_amount DECIMAL(10, 2) NOT NULL, -- İndirim tutarı
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Her email için her kupon sadece 1 kere kullanılabilir
  UNIQUE(coupon_code, user_email)
);

-- 2. Index'ler (performans için)
CREATE INDEX IF NOT EXISTS idx_coupon_usage_email ON coupon_usage(user_email);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_code ON coupon_usage(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- 3. RLS aktif et
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- 4. Policy: Herkes kendi kullanımlarını görebilir
CREATE POLICY "Users can view own coupon usage"
ON coupon_usage FOR SELECT
USING (
  auth.email() = user_email 
  OR auth.uid() = user_id 
  OR auth.jwt() ->> 'role' = 'admin'
);

-- 5. Policy: Herkes kupon kullanımı kaydedebilir (checkout sırasında)
CREATE POLICY "Anyone can insert coupon usage"
ON coupon_usage FOR INSERT
WITH CHECK (true);

-- 6. Kupon kontrolü fonksiyonu
CREATE OR REPLACE FUNCTION check_coupon_usage(
  p_coupon_code TEXT,
  p_user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  -- Bu kullanıcı bu kuponu daha önce kullanmış mı?
  SELECT COUNT(*) INTO usage_count
  FROM coupon_usage
  WHERE coupon_code = p_coupon_code
    AND user_email = p_user_email;
  
  -- 0 ise kullanılmamış (true), >0 ise kullanılmış (false)
  RETURN usage_count = 0;
END;
$$;

COMMENT ON TABLE coupon_usage IS 'Müşterilerin kupon kullanım geçmişi - her kupon müşteri başına 1 kere kullanılabilir';
COMMENT ON FUNCTION check_coupon_usage IS 'Kullanıcının kuponu daha önce kullanıp kullanmadığını kontrol eder';

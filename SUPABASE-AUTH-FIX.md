# 🔧 SUPABASE AUTH HATA DÜZELTMESİ

## ⚠️ Sorun
```
POST https://mkcezxulniwcyjitnyzi.supabase.co/auth/v1/signup 500 (Internal Server Error)
AuthApiError: Database error saving new user
```

## 🔍 Neden Oluştu?
`users` tablosundaki `id` sütunu `DEFAULT gen_random_uuid()` ile tanımlıydı. Bu, Supabase Auth'un verdiği UUID ile çakışıyordu.

## ✅ Çözüm

### 1. Supabase Dashboard → SQL Editor → Aşağıdaki SQL'i çalıştırın:

```sql
-- Users tablosunu yeniden oluştur (Supabase Auth entegrasyonu için)

-- Önce eski tabloyu sil (dikkatli!)
DROP TABLE IF EXISTS users CASCADE;

-- Yeni users tablosu - ID varsayılan değer OLMADAN (Supabase Auth ID'si kullanılacak)
CREATE TABLE users (
  id UUID PRIMARY KEY, -- Supabase Auth user ID buraya gelecek
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

-- RLS Policies
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

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Comment
COMMENT ON COLUMN users.id IS 'Supabase Auth user ID - manually set, not auto-generated';
COMMENT ON COLUMN users.addresses IS 'User addresses stored as JSON array';
```

### 2. AuthContext.jsx Güncellendi
- ✅ `userService.create()` yerine doğrudan `supabase.from('users').insert()` kullanımı
- ✅ Hata durumunda Auth kullanıcısını silme mekanizması eklendi
- ✅ Daha detaylı hata mesajları

## 🧪 Test Et

1. SQL'i çalıştırdıktan sonra siteye git: http://localhost:3001
2. "Kayıt Ol" butonuna tıkla
3. Formu doldur ve kayıt ol
4. ✅ Başarılı olmalı!

## 📝 Değişiklikler

### Önce (Hatalı):
```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY, -- ❌ Supabase Auth ile çakışıyor!
  ...
);
```

### Sonra (Düzeltildi):
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY, -- ✅ Manuel ID, varsayılan değer YOK
  ...
  addresses JSONB DEFAULT '[]'::jsonb, -- ✅ Adresler de eklendi
  ...
);
```

## 🎯 Nasıl Çalışıyor?

1. **Kullanıcı Kayıt Olur:**
   - Supabase Auth → UUID oluşturur (örn: `abc-123-def`)
   
2. **users Tablosuna Eklenir:**
   - `id: 'abc-123-def'` (Auth'dan gelen ID)
   - `name`, `email`, `phone` vs.
   
3. **Tek ID Sistemi:**
   - `auth.users.id` = `public.users.id` ✅
   - İki tablo senkron!

## ⚡ Önemli Notlar

- **Eski veriler silinecek!** `DROP TABLE IF EXISTS users CASCADE;` komutu mevcut kullanıcıları siler
- Test ortamında sorun değil
- Production'daysa dikkatli ol!

**SQL'i çalıştırdıktan sonra test et! 🚀**

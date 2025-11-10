# 🔧 SUPABASE KURULUM TALİMATLARI

## ⚠️ ÖNEMLİ: Aşağıdaki SQL'leri Supabase SQL Editor'da çalıştırın!

### 1️⃣ Stok Otomatik Düşürme Trigger
```bash
supabase-stock-trigger.sql
```
**Ne yapar?** Sipariş oluşturulduğunda otomatik olarak ürün stoklarını düşürür.

**Test:**
1. Bir ürünün stok miktarını not et (örn: 10 adet)
2. O üründen 2 adet sipariş ver
3. Admin panelde stoğun 8'e düştüğünü kontrol et

---

### 2️⃣ Kupon Kullanım Takibi
```bash
supabase-coupon-usage.sql
```
**Ne yapar?** Her müşteri her kuponu sadece 1 kere kullanabilir (email bazlı).

**Test:**
1. Email: test@test.com ile kupon kullan (VIONA15)
2. Sipariş tamamla
3. Aynı email ile tekrar aynı kuponu dene
4. **Beklenen:** "Bu kuponu daha önce kullandınız" mesajı

---

### 3️⃣ Kurulum Kontrolü
```bash
supabase-check-setup.sql
```
**Ne yapar?** Tüm trigger ve tabloların doğru kurulduğunu kontrol eder.

**Nasıl kullanılır:**
1. Supabase SQL Editor'da çalıştır
2. Sonuçları kontrol et:
   - `update_product_stock` fonksiyonu var mı?
   - `auto_update_stock` trigger var mı?
   - `coupon_usage` tablosu var mı?
   - Unique constraint var mı?

---

## 📊 Realtime Güncellemeler

### Orders Realtime
- Yeni sipariş gelince admin panelinde **F5'siz** görünür
- Console: `📡 Realtime bağlantı durumu: SUBSCRIBED`
- Console: `🔔 Sipariş güncellendi:` mesajı gelecek

### Products Realtime
- Stok değişince anasayfada **F5'siz** güncellenir
- Console: `📡 Products Realtime bağlantı durumu: SUBSCRIBED`
- Console: `🔔 Ürün güncellendi (stok):` mesajı gelecek

---

## 🐛 Sorun Giderme

### Stok Düşmüyor ise:
1. ✅ `supabase-stock-trigger.sql` çalıştırıldı mı?
2. ✅ Console'da `RAISE NOTICE` mesajları görünüyor mu?
3. ✅ Supabase Dashboard > Database > Functions > `update_product_stock` var mı?

### Kupon 2 Kere Kullanılıyor ise:
1. ✅ `supabase-coupon-usage.sql` çalıştırıldı mı?
2. ✅ Checkout'ta email girilmeden kupon uygulanmaya çalışılıyor mu?
3. ✅ Console'da "Bu kuponu daha önce kullandınız" mesajı görünüyor mu?

### Realtime Çalışmıyor ise:
1. ✅ Console'da `📡 Realtime bağlantı durumu: SUBSCRIBED` yazıyor mu?
2. ✅ Supabase Dashboard > Settings > API > Realtime enabled mı?
3. ✅ F5 yap ve tekrar test et

---

## 🔍 Test Adımları

### 1. Stok Test:
```
1. Ürün stoğu: 10 adet (örnek)
2. Sipariş ver: 2 adet
3. Beklenen: Stok 8'e düşmeli
4. Kontrol: Admin Panel > Ürünler > Stok kolonu
```

### 2. Kupon Test:
```
1. Email: furkan@test.com
2. Kupon: VIONA15
3. İlk sipariş: ✅ Kupon çalışmalı
4. İkinci sipariş (aynı email): ❌ "Daha önce kullandınız"
```

### 3. Realtime Test:
```
1. Admin paneli aç (1. sekme)
2. Yeni sekmede sipariş ver
3. Admin panelde F5 YAPMADAN sipariş görünmeli
4. Console'da 🔔 mesajı gelecek
```

---

## 📝 Notlar

- **Email Zorunlu:** Kupon kullanmak için checkout'ta email girilmeli
- **Stok 0'dan aşağı düşmez:** `GREATEST(0, stock - quantity)` ile korunur
- **RLS Bypass:** Trigger `SECURITY DEFINER` ile admin yetkisiyle çalışır
- **Unique Constraint:** `(coupon_code, user_email)` - Aynı email aynı kuponu 2 kere kullanamaz

---

## 🚀 Son Kontrol

Tüm SQL'ler çalıştırıldıktan sonra:
```sql
-- Trigger kontrolü
SELECT * FROM pg_trigger WHERE tgname = 'auto_update_stock';

-- Tablo kontrolü
SELECT * FROM coupon_usage LIMIT 1;
```

Eğer hata alıyorsan:
1. Supabase Dashboard > SQL Editor > Query history'yi kontrol et
2. Hata mesajlarını oku
3. Foreign key hatası alıyorsan önce `users` ve `orders` tablolarını kontrol et

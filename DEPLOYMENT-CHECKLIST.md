# 🚀 VIONA E-TİCARET - PRODUCTION DEPLOYMENT CHECKLIST

## ✅ 1. SUPABASE AYARLARI

### Database
- [ ] `SUPABASE-SETUP-COMPLETE.sql` çalıştırıldı
- [ ] `supabase-storage-setup.sql` çalıştırıldı
- [ ] `PRODUCTION-SECURITY.sql` çalıştırıldı ⚠️ **KRİTİK**

### Authentication
- [ ] Email confirmation: **PRODUCTION'DA AÇIK** (development'ta kapalı)
- [ ] Email templates özelleştirildi (Supabase Dashboard > Auth > Email Templates)
- [ ] Site URL eklendi: `https://yourdomain.com` (Auth > URL Configuration)
- [ ] Redirect URLs eklendi

### Storage
- [ ] `avatars` bucket oluşturuldu (Public, 2MB limit)
- [ ] `product-images` bucket oluşturuldu (Public)
- [ ] Storage policies güncellendi

### Realtime
- [ ] Realtime enabled: `orders`, `products`, `notifications` tabloları
  - Supabase Dashboard > Database > Replication
  - `orders`, `products`, `notifications` tablolarını seç
  - Enable Realtime

### Admin Kullanıcı
- [ ] Admin email oluşturuldu: `admin@viona.com` (veya sizin email)
- [ ] SQL ile admin yapıldı: `UPDATE users SET role = 'admin' WHERE email = '...'`

---

## ✅ 2. ENVIRONMENT VARIABLES

### Production .env
```env
VITE_SUPABASE_URL=https://mkcezxulniwcyjitnyzi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

⚠️ **GİZLİ TUTULAN KEYS:**
- Service Role Key (asla frontend'de kullanmayın!)
- Database Password

---

## ✅ 3. BUILD & DEPLOY

### Build
```bash
npm run build
```

### Test Build Locally
```bash
npm run preview
```

### Deploy Seçenekleri

#### A. Vercel (Önerilen)
1. GitHub'a push
2. Vercel'de import
3. Environment variables ekle
4. Deploy

#### B. Netlify
1. GitHub'a push
2. Netlify'da import
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Environment variables ekle

#### C. Kendi Sunucu
```bash
# Build
npm run build

# dist/ klasörünü sunucuya upload et
# Nginx/Apache ile serve et
```

---

## ✅ 4. DOMAIN & SSL

- [ ] Domain satın alındı
- [ ] DNS ayarları yapıldı
- [ ] SSL sertifikası aktif (Vercel/Netlify otomatik)
- [ ] Supabase'de site URL güncellendi

---

## ✅ 5. TEST (PRODUCTION'DA)

### Müşteri Akışı
- [ ] Ürün listeleme çalışıyor
- [ ] Sepete ekleme çalışıyor
- [ ] Checkout (üye olmadan) çalışıyor
- [ ] Post-checkout modal açılıyor
- [ ] Kayıt olma çalışıyor
- [ ] Login çalışıyor
- [ ] Sipariş geçmişi görünüyor
- [ ] Avatar upload çalışıyor

### Admin Akışı
- [ ] Admin panele giriş (sadece admin rolü)
- [ ] Dashboard istatistikler yükleniyor
- [ ] Bildirimler gelıyor (realtime)
- [ ] Sipariş durumu güncelleme çalışıyor
- [ ] Sipariş değişikliği müşteriye yansıyor (realtime)
- [ ] Ürün ekleme/güncelleme çalışıyor

### Güvenlik Testleri
- [ ] Normal kullanıcı başka kullanıcı profilini değiştiremiyor
- [ ] Normal kullanıcı admin panele erişemiyor
- [ ] Normal kullanıcı başka kullanıcı siparişini göremiyor
- [ ] Email confirmation çalışıyor (production'da)

---

## ✅ 6. SEO & ANALYTICS

- [ ] Google Analytics eklendi (opsiyonel)
- [ ] Meta tags kontrol edildi (SEO)
- [ ] Sitemap oluşturuldu
- [ ] robots.txt eklendi
- [ ] Favicon eklendi

---

## ✅ 7. PERFORMANS

- [ ] Images optimize edildi (WebP, lazy loading)
- [ ] Bundle size kontrol edildi
- [ ] Lighthouse score kontrol edildi (>90)
- [ ] Mobile responsive test

---

## ✅ 8. BACKUP & MONİTORİNG

- [ ] Supabase otomatik backup aktif
- [ ] Error tracking (Sentry opsiyonel)
- [ ] Uptime monitoring (UptimeRobot opsiyonel)

---

## 🎯 DEPLOYMENT ADIMLARI

1. **Test Everything Locally**
   ```bash
   npm run dev
   # Tüm özellikleri test et
   ```

2. **Run Production Security SQL**
   ```bash
   # Supabase Dashboard > SQL Editor
   # PRODUCTION-SECURITY.sql'i çalıştır
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Deploy**
   - Vercel/Netlify'a push
   - Environment variables ekle
   - Deploy

5. **Post-Deploy Test**
   - Tüm müşteri akışını test et
   - Tüm admin akışını test et
   - Güvenlik testleri yap

6. **Go Live!** 🚀

---

## 📞 DESTEK

Sorun olursa:
1. Browser console'u kontrol et
2. Supabase logs kontrol et (Dashboard > Logs)
3. Network tab kontrol et (401/403 hataları)

---

## 🎉 TAMAMLANDI!

Production'a hazırsınız! Başarılar! 🚀

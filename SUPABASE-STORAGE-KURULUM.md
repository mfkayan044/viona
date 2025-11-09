# 📦 Supabase Storage Kurulum Rehberi

## 🚨 Problem
Resim yüklerken şu hatayı alıyorsunuz:
```
StorageApiError: new row violates row-level security policy
```

## ✅ Çözüm: Manuel Kurulum (ÖNERİLEN)

### Adım 1: Bucket'ları Oluştur

1. Supabase Dashboard'a git: https://supabase.com/dashboard
2. Projenizi seçin
3. Sol menüden **Storage** tıklayın
4. **Create a new bucket** butonuna tıklayın

**4 tane bucket oluşturun:**

| Bucket Adı | Public | Açıklama |
|------------|--------|----------|
| `product-images` | ✅ ON | Ürün fotoğrafları |
| `hero-images` | ✅ ON | Ana sayfa görselleri |
| `site-assets` | ✅ ON | Logo, favicon vb. |
| `avatars` | ✅ ON | Kullanıcı profil fotoğrafları |

---

### Adım 2: Policy Ekle (Basit Yöntem)

Her bucket için aynı işlemi yapın:

1. Bucket'a tıklayın
2. **Configuration** > **Policies** tab'ine gidin
3. **New Policy** butonuna tıklayın
4. **Get started quickly** bölümünde şu seçeneği seçin:
   - ✅ **"Allow all operations for authenticated users only"**
5. **Review** butonuna tıklayın
6. **Save policy** ile kaydedin

Bu işlemi **4 bucket için de tekrarlayın**.

---

### Adım 3: Test Et

1. Admin paneline giriş yapın
2. Ürün Yönetimi > Yeni Ürün
3. Resim yüklemeyi deneyin
4. Hata almazsanız ✅ BAŞARILI!

---

## 🔧 Alternatif: Manuel Policy Ekleme

Daha detaylı kontrol istiyorsanız:

### Product-Images Bucket Policies

1. Bucket: `product-images` > Configuration > Policies > New Policy
2. "Create a policy from scratch" seçin
3. Policy ekleyin:

**Policy 1: Public Read**
- Policy name: `public-read`
- Allowed operation: `SELECT`
- Target roles: `public` (checkbox işaretle)
- USING expression: `true`

**Policy 2: Authenticated Upload**
- Policy name: `authenticated-upload`
- Allowed operation: `INSERT`
- Target roles: `authenticated` (checkbox işaretle)
- WITH CHECK expression: `true`

**Policy 3: Authenticated Update**
- Policy name: `authenticated-update`
- Allowed operation: `UPDATE`
- Target roles: `authenticated` (checkbox işaretle)
- USING expression: `true`

**Policy 4: Authenticated Delete**
- Policy name: `authenticated-delete`
- Allowed operation: `DELETE`
- Target roles: `authenticated` (checkbox işaretle)
- USING expression: `true`

### Diğer Bucket'lar

Aynı policy'leri diğer 3 bucket için de tekrarlayın:
- `hero-images`
- `site-assets`
- `avatars`

---

## 📝 Özet Kontrol Listesi

- [ ] `product-images` bucket oluşturuldu (Public: ON)
- [ ] `product-images` için policy eklendi
- [ ] `hero-images` bucket oluşturuldu (Public: ON)
- [ ] `hero-images` için policy eklendi
- [ ] `site-assets` bucket oluşturuldu (Public: ON)
- [ ] `site-assets` için policy eklendi
- [ ] `avatars` bucket oluşturuldu (Public: ON)
- [ ] `avatars` için policy eklendi
- [ ] Resim yükleme test edildi ✅

---

## 🎯 Hızlı Test

Terminal'de:
```bash
# Projeyi çalıştır
npm run dev

# Admin'e giriş yap
# http://localhost:5173/admin-login

# Ürün ekle ve resim yükle
# Hata almazsanız başarılı! ✅
```

---

## ❓ Sorun Yaşarsanız

1. **Bucket'lar Public mi?** Her bucket'ın "Public" özelliği ON olmalı
2. **Policy var mı?** Her bucket'ta en az 1 policy olmalı
3. **Authenticated misiniz?** Admin olarak giriş yaptığınızdan emin olun
4. **Console hatası?** Browser console'da tam hata mesajını kontrol edin

---

## ✨ Başarılı Kurulum Sonrası

Artık:
- ✅ Admin panelden ürün fotoğrafı yükleyebilirsiniz
- ✅ Site ayarlarından logo yükleyebilirsiniz
- ✅ Kullanıcılar profil fotoğrafı yükleyebilir
- ✅ Tüm resimler herkes tarafından görülebilir

---

**İyi çalışmalar! 🚀**

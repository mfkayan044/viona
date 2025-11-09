# Vercel + Zoho Mail Kurulum Rehberi

## 📋 Hazırlık

Zoho Mail bilgilerin:
- Email: `noreply@yourdomain.com` (Zoho'daki email adresiniz)
- App Password: `mRAUwScPX3Mv`
- SMTP: `smtp.zoho.com`
- Port: `587`

---

## 🚀 Kurulum Adımları

### 1️⃣ Vercel'e Deploy Et

```bash
git add .
git commit -m "Add Vercel email API"
git push origin main
```

Vercel otomatik deploy edecek.

---

### 2️⃣ Vercel Dashboard'da Environment Variables Ekle

1. **Vercel Dashboard'a git**: https://vercel.com/dashboard
2. **Projeyi seç**: `viona` projesine tıkla
3. **Settings** → **Environment Variables** git
4. **Şu 4 değişkeni ekle**:

| Key | Value |
|-----|-------|
| `ZOHO_EMAIL` | `noreply@yourdomain.com` (Zoho email adresiniz) |
| `ZOHO_PASSWORD` | `mRAUwScPX3Mv` |
| `ZOHO_SMTP_HOST` | `smtp.zoho.com` |
| `ZOHO_SMTP_PORT` | `587` |

> **ÖNEMLİ**: Her değişkeni eklerken **Production**, **Preview**, ve **Development** ortamlarını seçmeyi unutma!

5. **Save** butonuna tıkla

---

### 3️⃣ Vercel'i Redeploy Et

Environment variables ekledikten sonra:

1. **Deployments** sekmesine git
2. **En son deployment'ın** yanındaki **⋮** (üç nokta) menüsüne tıkla
3. **Redeploy** → **Use existing Build Cache** seç
4. **Redeploy** butonuna bas

Veya terminalden:

```bash
# Boş commit ile redeploy tetikle
git commit --allow-empty -m "Trigger redeploy for env vars"
git push origin main
```

---

## ✅ Test Et

Redeploy tamamlandıktan sonra:

1. **Admin Panel** → **Mail Gönder** sayfasına git
2. **Tek bir kullanıcı seç**
3. **Konu**: `Test Email`
4. **Mesaj**: `Bu bir test emailidir`
5. **Gönder** butonuna tıkla

Başarılı olursa:
- ✅ Yeşil başarı mesajı görürsün
- ✅ Seçtiğin kullanıcının email'ine mail gelecek
- ✅ Email History'de kayıt oluşur

---

## 🔍 Sorun Giderme

### Email gitmiyor?

1. **Vercel Logs kontrol et**:
   - Dashboard → Deployments → En son deployment → Runtime Logs
   - Hataları kontrol et

2. **Environment Variables doğru mu?**:
   - Settings → Environment Variables
   - 4 değişken de var mı?
   - Typo yok mu?

3. **Zoho email doğru mu?**:
   - Zoho Mail'de kullandığın email adresi `ZOHO_EMAIL` ile aynı mı?
   - App Password doğru kopyalandı mı?

4. **Browser Console kontrol et**:
   - F12 → Console
   - Network sekmesinde `/api/send-email` request'ini kontrol et

---

## 📊 API Endpoint

**URL**: `https://yourdomain.vercel.app/api/send-email`

**Method**: POST

**Body**:
```json
{
  "to": "user@example.com",
  "subject": "Email Subject",
  "html": "<h1>Email Content</h1>"
}
```

**Response** (Success):
```json
{
  "success": true,
  "messageId": "<unique-message-id>",
  "message": "Email sent successfully"
}
```

**Response** (Error):
```json
{
  "error": "Failed to send email",
  "details": "Error message"
}
```

---

## 🎯 Özellikler

✅ **Tek Email**: Bir kullanıcıya mail gönder
✅ **Toplu Email**: 50'şer batch'lerle gönderim
✅ **4 Recipient Mode**: All, Customers, Subscribers, Selected
✅ **Email Templates**: Campaign, New Product, Newsletter
✅ **Email History**: LocalStorage'da kayıt
✅ **Search & Filter**: Kullanıcı arama
✅ **Batch Processing**: Rate limit koruması (500ms delay)

---

## 🔒 Güvenlik

- ✅ Environment variables Vercel'de şifrelenmiş
- ✅ CORS koruması
- ✅ Method validation (sadece POST)
- ✅ Input validation (to, subject, html required)
- ✅ TLS encryption (587 port)

---

## 📝 Notlar

- Zoho Mail free plan: **500 email/gün** limiti var
- Batch size: 50 email per batch (rate limit için)
- Delay: 500ms between batches
- Email history LocalStorage'da saklanıyor (tarayıcı bazlı)

Başarılar! 🚀

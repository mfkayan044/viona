# Zoho Mail Entegrasyonu - Kurulum Rehberi

## 📧 Zoho Mail SMTP Kurulumu

### 1. Zoho Mail Hesabı Hazırlığı

**A. Zoho Mail App Password Oluştur:**
1. Zoho Mail'e giriş yap: https://mail.zoho.com
2. **Settings** → **Security** → **App Passwords**
3. **Generate New Password** tıkla
4. App Name: "VIONA E-commerce"
5. Oluşturulan şifreyi kopyala (tek kullanımlık gösterilir!)

**B. SMTP Ayarları:**
- **Host**: smtp.zoho.com
- **Port**: 587 (TLS) veya 465 (SSL)
- **Security**: TLS/STARTTLS
- **Username**: Zoho email adresiniz (örn: noreply@yourdomain.com)
- **Password**: App Password (yukarıda oluşturduğunuz)

---

## 🚀 Supabase Edge Function Kurulumu

### 1. Supabase CLI Kurulumu

```bash
# NPM ile kur
npm install -g supabase

# Veya Homebrew (Mac)
brew install supabase/tap/supabase

# Supabase'e login ol
supabase login
```

### 2. Project'i Linke Et

```bash
# Proje klasöründe
cd c:\Users\PC1\Desktop\viona

# Supabase project'i linke et
supabase link --project-ref YOUR_PROJECT_ID
```

### 3. Edge Function Deploy

```bash
# Önce functions klasörünü oluştur
mkdir -p supabase/functions

# send-email function dosyasını kopyala
# supabase-functions/send-email.ts -> supabase/functions/send-email/index.ts

# Environment variables ayarla
supabase secrets set ZOHO_SMTP_HOST=smtp.zoho.com
supabase secrets set ZOHO_SMTP_PORT=587
supabase secrets set ZOHO_EMAIL=noreply@yourdomain.com
supabase secrets set ZOHO_PASSWORD=YOUR_APP_PASSWORD

# Function'ı deploy et
supabase functions deploy send-email

# Test et
supabase functions invoke send-email --data '{
  "to": "test@example.com",
  "subject": "Test Mail",
  "message": "Merhaba, bu bir test mailidir."
}'
```

### 4. CORS Ayarları

Supabase Dashboard'da:
1. **Settings** → **API**
2. **CORS allowed origins** kısmına production domain'ini ekle:
   ```
   https://viona-woad.vercel.app
   ```

---

## ⚙️ Frontend Konfigürasyonu

### 1. .env Dosyası Oluştur

`.env` dosyasını oluştur ve Zoho bilgilerini ekle:

```env
# Zoho Mail SMTP Configuration
VITE_ZOHO_SMTP_HOST=smtp.zoho.com
VITE_ZOHO_SMTP_PORT=587
VITE_ZOHO_EMAIL=noreply@yourdomain.com
VITE_ZOHO_PASSWORD=YOUR_APP_PASSWORD

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_FUNCTIONS_URL=https://your-project.supabase.co/functions/v1
```

### 2. .gitignore Kontrol

`.env` dosyasının `.gitignore`'da olduğundan emin ol:

```
.env
.env.local
```

---

## 📝 Kullanım

### Admin Panelden Mail Gönderme

1. **Admin Panel** → **Mail Gönder**
2. **Alıcı Seç**:
   - Tümü (tüm kullanıcılar)
   - Sadece Müşteriler (sipariş verenler)
   - Sadece Aboneler (newsletter)
   - Seçili Kullanıcılar (manuel seçim)
3. **Konu ve Mesaj Yaz** (veya hazır şablon kullan)
4. **Gönder**

### Programatik Kullanım

```javascript
import emailService from './services/email.service';

// Tek mail gönder
await emailService.sendEmail({
  recipients: 'customer@example.com',
  subject: 'Siparişiniz Onaylandı',
  message: 'Merhaba, siparişiniz hazırlanıyor...'
});

// Toplu mail gönder
await emailService.sendBulkEmail({
  recipients: ['user1@example.com', 'user2@example.com'],
  subject: 'Yeni Kampanya',
  message: 'Özel indirim fırsatını kaçırmayın!'
});

// Şablon kullan
const template = emailService.getTemplate('campaign', {
  campaignName: 'Yaz İndirimi',
  discount: '%40',
  code: 'YAZ40',
  validity: 'Bu hafta',
  link: 'https://viona.com'
});

await emailService.sendEmail({
  recipients: emailList,
  subject: template.subject,
  message: template.message
});
```

---

## 🔧 Alternatif: Vercel Serverless Function (Supabase Edge Function yerine)

Eğer Vercel kullanıyorsan:

### 1. API Route Oluştur

`/api/send-email.js`:

```javascript
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, message } = req.body;

  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port: process.env.ZOHO_SMTP_PORT,
    secure: false, // TLS
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.ZOHO_EMAIL,
      to: Array.isArray(to) ? to.join(',') : to,
      subject,
      text: message,
      html: message.replace(/\n/g, '<br>')
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 2. Vercel Environment Variables

Vercel Dashboard:
1. **Settings** → **Environment Variables**
2. Ekle:
   - `ZOHO_SMTP_HOST` = smtp.zoho.com
   - `ZOHO_SMTP_PORT` = 587
   - `ZOHO_EMAIL` = noreply@yourdomain.com
   - `ZOHO_PASSWORD` = YOUR_APP_PASSWORD

### 3. email.service.js Güncelle

```javascript
async sendEmail(emailData) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  });
  
  if (!response.ok) throw new Error('Email send failed');
  return response.json();
}
```

---

## ✅ Test Checklist

- [ ] Zoho Mail App Password oluşturuldu
- [ ] Supabase Edge Function deploy edildi (veya Vercel API route)
- [ ] Environment variables ayarlandı
- [ ] Test mail gönderildi ve alındı
- [ ] Toplu mail (5-10 kişi) test edildi
- [ ] Mail geçmişi kaydediliyor
- [ ] Hata durumları handle ediliyor

---

## 📊 Rate Limits

**Zoho Mail Free:**
- 500 mail/gün
- 50 alıcı/mail

**Zoho Mail Paid:**
- 5000+ mail/gün
- 250 alıcı/mail

**Öneri**: Büyük listeler için batch gönderim (50'şer) kullan.

---

## 🐛 Troubleshooting

**Hata: Authentication failed**
- App Password'u kontrol et (normal şifre değil!)
- Zoho hesabında 2FA açık mı?

**Hata: Connection timeout**
- Port 587 kullanıldığından emin ol
- Firewall ayarlarını kontrol et

**Hata: Too many recipients**
- Batch size'ı küçült (50 yerine 25)
- Rate limit beklemesi ekle (500ms → 1000ms)

---

## 📞 Destek

Zoho Mail Support: https://help.zoho.com/portal/en/kb/mail
Supabase Docs: https://supabase.com/docs/guides/functions

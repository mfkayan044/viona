import { Resend } from 'resend';

const resend = new Resend('re_A4dv3Vu7_5PaSsbZD7Nw5NsXjp8xyvohp');

// 1. Hoşgeldin maili
export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Viona <onboarding@resend.dev>', // Resend test domain (production'da info@viona.com.tr olacak)
      to: [userEmail],
      subject: 'Viona\'ya Hoş Geldiniz! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ VIONA</h1>
              <p>Handcrafted Beaded Elegance</p>
            </div>
            <div class="content">
              <h2>Hoş Geldiniz ${userName}!</h2>
              <p>Viona ailesine katıldığınız için çok mutluyuz! 🎉</p>
              <p>Her biri özenle, tek tek boncuk dizilerek hazırlanan benzersiz çantalarımızı keşfetmeye hazır mısınız?</p>
              <p>Sizin için özel olarak tasarlanmış koleksiyonlarımıza göz atabilirsiniz.</p>
              <a href="http://localhost:3000" class="button">Alışverişe Başla</a>
              <p><strong>İlk siparişinizde %10 indirim!</strong></p>
              <p>Kod: <strong>HOSGELDIN10</strong></p>
            </div>
            <div class="footer">
              <p>© 2024 Viona - Handcrafted Beaded Elegance</p>
              <p>Instagram: @viona_bags | Email: info@viona.com.tr</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend mail hatası:', error);
      return { success: false, error };
    }

    console.log('✅ Hoşgeldin maili gönderildi:', userEmail, data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Mail gönderme hatası:', error);
    return { success: false, error };
  }
};

// 2. Sipariş onay maili
export const sendOrderConfirmationEmail = async (orderData) => {
  const { customerEmail, customerName, orderId, items, total, shippingAddress } = orderData;
  
  const itemsHTML = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price} ₺</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)} ₺</td>
    </tr>
  `).join('');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Viona <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Siparişiniz Alındı! #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .order-info { background: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .total { font-size: 18px; font-weight: bold; text-align: right; padding: 20px 0; border-top: 2px solid #000; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ VIONA</h1>
              <p>Sipariş Onayı</p>
            </div>
            <div class="content">
              <h2>Teşekkürler ${customerName}!</h2>
              <p>Siparişiniz başarıyla alındı ve en kısa sürede hazırlanacak.</p>
              
              <div class="order-info">
                <h3>Sipariş Detayları</h3>
                <p><strong>Sipariş No:</strong> #${orderId}</p>
                <p><strong>Tarih:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
                
                <table>
                  <thead>
                    <tr style="background: #f5f5f5;">
                      <th style="padding: 10px; text-align: left;">Ürün</th>
                      <th style="padding: 10px; text-align: center;">Adet</th>
                      <th style="padding: 10px; text-align: right;">Fiyat</th>
                      <th style="padding: 10px; text-align: right;">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHTML}
                  </tbody>
                </table>
                
                <div class="total">
                  TOPLAM: ${total.toFixed(2)} ₺
                </div>
                
                <h3>Teslimat Adresi</h3>
                <p>${shippingAddress}</p>
              </div>
              
              <p>Siparişinizin durumunu "Siparişlerim" sayfasından takip edebilirsiniz.</p>
              <p>Herhangi bir sorunuz olursa bizimle iletişime geçmekten çekinmeyin!</p>
            </div>
            <div class="footer">
              <p>© 2024 Viona - Handcrafted Beaded Elegance</p>
              <p>Instagram: @viona_bags | Email: info@viona.com.tr</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend mail hatası:', error);
      return { success: false, error };
    }

    console.log('✅ Sipariş onay maili gönderildi:', customerEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Mail gönderme hatası:', error);
    return { success: false, error };
  }
};

// 3. Sipariş durumu güncelleme maili
export const sendOrderStatusEmail = async (orderData) => {
  const { customerEmail, customerName, orderId, status, trackingNumber } = orderData;
  
  const statusMessages = {
    pending: { title: 'Siparişiniz Alındı', message: 'Siparişiniz hazırlanıyor...' },
    processing: { title: 'Siparişiniz Hazırlanıyor', message: 'Ürünleriniz özenle paketleniyor.' },
    shipped: { title: 'Siparişiniz Kargoya Verildi! 📦', message: `Kargo takip numarası: ${trackingNumber || 'Yakında eklenecek'}` },
    delivered: { title: 'Siparişiniz Teslim Edildi! 🎉', message: 'İyi günlerde kullanın!' },
    cancelled: { title: 'Sipariş İptal Edildi', message: 'Siparişiniz iptal edildi.' }
  };

  const statusInfo = statusMessages[status] || statusMessages.pending;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Viona <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `${statusInfo.title} - Sipariş #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #000; color: #fff; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f9f9f9; }
            .status-box { background: #fff; padding: 30px; margin: 20px 0; border: 2px solid #000; text-align: center; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ VIONA</h1>
              <p>Sipariş Güncelleme</p>
            </div>
            <div class="content">
              <h2>Merhaba ${customerName},</h2>
              
              <div class="status-box">
                <h2>${statusInfo.title}</h2>
                <p style="font-size: 16px; color: #666;">${statusInfo.message}</p>
                <p><strong>Sipariş No:</strong> #${orderId}</p>
                ${trackingNumber ? `<p><strong>Takip No:</strong> ${trackingNumber}</p>` : ''}
              </div>
              
              <p>Sipariş detaylarınızı "Siparişlerim" sayfasından görüntüleyebilirsiniz.</p>
            </div>
            <div class="footer">
              <p>© 2024 Viona - Handcrafted Beaded Elegance</p>
              <p>Instagram: @viona_bags | Email: info@viona.com.tr</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend mail hatası:', error);
      return { success: false, error };
    }

    console.log('✅ Durum güncelleme maili gönderildi:', customerEmail);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Mail gönderme hatası:', error);
    return { success: false, error };
  }
};

export default {
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusEmail
};

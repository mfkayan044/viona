import { supabase } from '../lib/supabase';

export const emailService = {
  // Email log'u database'e kaydet
  async logEmail(emailData, status = 'sent', errorMessage = null) {
    try {
      const { error } = await supabase
        .from('email_logs')
        .insert({
          recipient_email: Array.isArray(emailData.recipients) 
            ? emailData.recipients[0] 
            : emailData.recipients,
          recipient_name: emailData.recipientName || null,
          subject: emailData.subject,
          template_type: emailData.templateType || 'custom',
          email_data: emailData.data || null,
          status,
          error_message: errorMessage
        });

      if (error) console.error('Email log error:', error);
    } catch (error) {
      console.error('Failed to log email:', error);
    }
  },

  // Zoho Mail ile mail gönder (Vercel Serverless Function kullanarak)
  async sendEmail(emailData) {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: emailData.recipients, // Array veya string
          subject: emailData.subject,
          html: emailData.message,
        })
      });

      if (!response.ok) {
        const error = await response.json();
        await this.logEmail(emailData, 'failed', error.error);
        throw new Error(error.error || 'Email sending failed');
      }

      const data = await response.json();
      
      // Başarılı gönderimde log kaydet
      await this.logEmail(emailData, 'sent');
      
      return data;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  },

  // Toplu mail gönder (batch ile)
  async sendBulkEmail(emailData) {
    const { recipients, subject, message } = emailData;
    
    try {
      // Büyük listeler için batch'lere böl (50'şer)
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
      }

      // Her batch'i gönder
      for (const batch of batches) {
        await this.sendEmail({
          recipients: batch,
          subject,
          message
        });
        
        // Rate limit için bekle (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { success: true, count: recipients.length };
    } catch (error) {
      console.error('Bulk email error:', error);
      throw error;
    }
  },

  // Hoşgeldiniz maili gönder (yeni üye)
  async sendWelcomeEmail(user) {
    try {
      const template = this.getTemplate('welcome', {
        userName: user.full_name || user.email.split('@')[0]
      });

      await this.sendEmail({
        recipients: user.email,
        recipientName: user.full_name,
        subject: template.subject,
        message: template.message,
        templateType: 'welcome',
        data: { userName: user.full_name }
      });

      return { success: true };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error };
    }
  },

  // Sipariş onay maili gönder (müşteriye)
  async sendOrderConfirmation(order, user) {
    try {
      const template = this.getTemplate('orderConfirmation', {
        userName: user.full_name || user.email.split('@')[0],
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('tr-TR'),
        items: order.items,
        total: order.total_amount,
        address: order.shipping_address
      });

      await this.sendEmail({
        recipients: user.email,
        recipientName: user.full_name,
        subject: template.subject.replace('${data.orderNumber}', order.order_number),
        message: template.message,
        templateType: 'orderConfirmation',
        data: { orderNumber: order.order_number, total: order.total_amount }
      });

      return { success: true };
    } catch (error) {
      console.error('Order confirmation email error:', error);
      return { success: false, error };
    }
  },

  // Admin'e yeni sipariş bildirimi gönder
  async sendAdminOrderNotification(order, user) {
    try {
      const template = this.getTemplate('adminOrderNotification', {
        userName: user.full_name || user.email.split('@')[0],
        userEmail: user.email,
        userPhone: user.phone || '-',
        orderNumber: order.order_number,
        orderDate: new Date(order.created_at).toLocaleDateString('tr-TR'),
        items: order.items,
        total: order.total_amount,
        address: order.shipping_address
      });

      await this.sendEmail({
        recipients: 'info@viona.com.tr',
        recipientName: 'VIONA Admin',
        subject: template.subject.replace('${data.orderNumber}', order.order_number),
        message: template.message,
        templateType: 'adminOrderNotification',
        data: { orderNumber: order.order_number, userName: user.full_name }
      });

      return { success: true };
    } catch (error) {
      console.error('Admin order notification error:', error);
      return { success: false, error };
    }
  },


  // Mail template'leri (HTML formatında)
  getTemplate(type, data = {}) {
    const templates = {
      campaign: {
        subject: '🎉 Özel İndirim Fırsatı!',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .code { background: #f5f5f5; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; font-size: 18px; font-weight: bold; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Özel İndirim Fırsatı!</h1>
    </div>
    <div class="content">
      <p>Merhaba,</p>
      <p><strong>${data.campaignName || 'Size özel indirim'}</strong> fırsatını kaçırmayın!</p>
      <p>${data.discount || '%30'} indirim ile tüm ürünlerimizde geçerlidir.</p>
      <div class="code">
        İndirim Kodu: ${data.code || 'OZEL30'}
      </div>
      <p><strong>Geçerlilik:</strong> ${data.validity || 'Bu hafta sonu'}</p>
      <p style="text-align: center;">
        <a href="${data.link || 'https://viona-woad.vercel.app'}" class="button">Alışverişe Başla</a>
      </p>
    </div>
    <div class="footer">
      <p>İyi alışverişler dileriz!</p>
      <p><strong>VIONA</strong> | Moda & Stil</p>
    </div>
  </div>
</body>
</html>`
      },
      newProduct: {
        subject: '✨ Yeni Koleksiyon Geldi!',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Yeni Koleksiyon!</h1>
    </div>
    <div class="content">
      <p>Merhaba,</p>
      <p><strong>${data.productName || 'Yeni koleksiyonumuz'}</strong> şimdi mağazamızda!</p>
      <p>${data.description || 'Şık ve modern tasarımlarımızı keşfedin.'}</p>
      <p style="text-align: center;">
        <a href="${data.link || 'https://viona-woad.vercel.app'}" class="button">Hemen İncele</a>
      </p>
    </div>
    <div class="footer">
      <p>Sevgilerle,</p>
      <p><strong>VIONA Ekibi</strong></p>
    </div>
  </div>
</body>
</html>`
      },
      newsletter: {
        subject: '📰 VIONA Bülteni',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
    ul { padding-left: 20px; }
    li { margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 VIONA Bülteni</h1>
    </div>
    <div class="content">
      <p>Merhaba,</p>
      <p>Bu ayki bültenimizde:</p>
      <ul>
        ${data.items?.map(item => `<li>${item}</li>`).join('') || '<li>Yeni ürünler</li><li>Kampanyalar</li><li>Moda trendleri</li>'}
      </ul>
    </div>
    <div class="footer">
      <p><strong>VIONA</strong> | Moda & Stil</p>
    </div>
  </div>
</body>
</html>`
      },
      welcome: {
        subject: '🎉 VIONA\'ya Hoş Geldiniz!',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
    .highlight { background: #f0f4ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Hoş Geldiniz!</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.userName || 'Değerli Müşterimiz'}</strong>,</p>
      <p>VIONA ailesine katıldığınız için çok mutluyuz! 🌟</p>
      <div class="highlight">
        <p><strong>İlk Alışverişinize Özel:</strong></p>
        <p style="font-size: 20px; color: #667eea; margin: 0;">%15 İndirim!</p>
      </div>
      <p>Şık ve kaliteli ürünlerimizi keşfetmeye hemen başlayabilirsiniz.</p>
      <p style="text-align: center;">
        <a href="https://viona-woad.vercel.app" class="button">Alışverişe Başla</a>
      </p>
    </div>
    <div class="footer">
      <p>Sevgilerle,</p>
      <p><strong>VIONA Ekibi</strong></p>
    </div>
  </div>
</body>
</html>`
      },
      orderConfirmation: {
        subject: '✅ Siparişiniz Alındı - #${data.orderNumber}',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .order-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .product-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
    .product-item:last-child { border-bottom: none; }
    .total { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Siparişiniz Alındı!</h1>
    </div>
    <div class="content">
      <p>Merhaba <strong>${data.userName || 'Değerli Müşterimiz'}</strong>,</p>
      <p>Siparişiniz başarıyla alınmıştır. Teşekkür ederiz! 🎉</p>
      
      <div class="order-box">
        <p><strong>Sipariş Numarası:</strong> #${data.orderNumber}</p>
        <p><strong>Tarih:</strong> ${data.orderDate || new Date().toLocaleDateString('tr-TR')}</p>
      </div>

      <h3>Sipariş Detayları:</h3>
      ${data.items?.map(item => `
        <div class="product-item">
          <strong>${item.name}</strong><br>
          Adet: ${item.quantity} × ${item.price} TL
        </div>
      `).join('') || ''}

      <div class="total">
        Toplam: ${data.total} TL
      </div>

      <p><strong>Teslimat Adresi:</strong><br>
      ${data.address || 'Kayıtlı adresiniz'}</p>

      <p>Siparişiniz en kısa sürede hazırlanacak ve kargoya verilecektir.</p>
    </div>
    <div class="footer">
      <p>Sorunuz mu var? <a href="mailto:info@viona.com.tr">info@viona.com.tr</a></p>
      <p><strong>VIONA</strong> | Moda & Stil</p>
    </div>
  </div>
</body>
</html>`
      },
      adminOrderNotification: {
        subject: '🔔 Yeni Sipariş Alındı - #${data.orderNumber}',
        message: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .product-item { border-bottom: 1px solid #e5e7eb; padding: 15px 0; }
    .total { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Yeni Sipariş!</h1>
    </div>
    <div class="content">
      <div class="alert-box">
        <strong>Yeni bir sipariş alındı!</strong><br>
        Sipariş #${data.orderNumber} - ${data.orderDate || new Date().toLocaleDateString('tr-TR')}
      </div>

      <p><strong>Müşteri:</strong> ${data.userName}<br>
      <strong>Email:</strong> ${data.userEmail}<br>
      <strong>Telefon:</strong> ${data.userPhone || '-'}</p>

      <h3>Sipariş Detayları:</h3>
      ${data.items?.map(item => `
        <div class="product-item">
          <strong>${item.name}</strong><br>
          Adet: ${item.quantity} × ${item.price} TL = ${item.quantity * item.price} TL
        </div>
      `).join('') || ''}

      <div class="total">
        Toplam: ${data.total} TL
      </div>

      <p><strong>Teslimat Adresi:</strong><br>
      ${data.address}</p>

      <p style="text-align: center;">
        <a href="https://viona-woad.vercel.app/admin/orders" class="button">Siparişi Görüntüle</a>
      </p>
    </div>
  </div>
</body>
</html>`
      }
    };

    return templates[type] || templates.campaign;
  }
};

export default emailService;

import { supabase } from '../lib/supabase';

export const emailService = {
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
        throw new Error(error.error || 'Email sending failed');
      }

      const data = await response.json();
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

  // Mail template'leri
  getTemplate(type, data = {}) {
    const templates = {
      campaign: {
        subject: '🎉 Özel İndirim Fırsatı!',
        message: `Merhaba,

${data.campaignName || 'Size özel indirim'} fırsatını kaçırmayın!

${data.discount || '%30'} indirim ile tüm ürünlerimizde geçerlidir.

İndirim Kodu: ${data.code || 'OZEL30'}
Geçerlilik: ${data.validity || 'Bu hafta sonu'}

Alışverişe başlamak için sitemizi ziyaret edin: ${data.link || 'https://viona.com'}

İyi alışverişler!
VIONA`
      },
      newProduct: {
        subject: '✨ Yeni Koleksiyon Geldi!',
        message: `Merhaba,

${data.productName || 'Yeni koleksiyonumuz'} şimdi mağazamızda!

${data.description || 'Şık ve modern tasarımlarımızı keşfedin.'}

Hemen göz atmak için: ${data.link || 'https://viona.com'}

Sevgilerle,
VIONA Ekibi`
      },
      newsletter: {
        subject: '📰 VIONA Bülteni',
        message: `Merhaba,

Bu ayki bültenimizde:
${data.items?.join('\n') || '- Yeni ürünler\n- Kampanyalar\n- Moda trendleri'}

Detaylar için sitemizi ziyaret edin: ${data.link || 'https://viona.com'}

VIONA`
      }
    };

    return templates[type] || templates.campaign;
  }
};

export default emailService;

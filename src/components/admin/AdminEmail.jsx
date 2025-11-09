import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, FileText, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { useToast } from '../../contexts/ToastContext';

const AdminEmail = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const toast = useToast();

  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipientType: 'all', // all, customers, subscribers
    recipients: []
  });

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalSubscribers: 0
  });

  const [sending, setSending] = useState(false);
  const [sentHistory, setSentHistory] = useState([]);

  useEffect(() => {
    loadStats();
    loadHistory();
  }, [orders]);

  const loadStats = () => {
    // Müşteri listesi (siparişlerden)
    const uniqueCustomers = new Set(orders.map(o => o.customer_email).filter(Boolean));
    
    // Newsletter aboneleri (localStorage'dan - gerçekte Supabase'den gelecek)
    const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');

    setStats({
      totalUsers: uniqueCustomers.size,
      totalCustomers: uniqueCustomers.size,
      totalSubscribers: subscribers.length
    });
  };

  const loadHistory = () => {
    const history = JSON.parse(localStorage.getItem('emailHistory') || '[]');
    setSentHistory(history);
  };

  const getRecipients = () => {
    switch (emailData.recipientType) {
      case 'all':
        // Tüm müşteriler + aboneler
        const customers = orders.map(o => o.customer_email).filter(Boolean);
        const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        return [...new Set([...customers, ...subscribers])];
      
      case 'customers':
        // Sadece sipariş vermiş müşteriler
        return [...new Set(orders.map(o => o.customer_email).filter(Boolean))];
      
      case 'subscribers':
        // Sadece newsletter aboneleri
        return JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      
      default:
        return [];
    }
  };

  const handleSendEmail = async () => {
    if (!emailData.subject.trim() || !emailData.message.trim()) {
      toast.error('Konu ve mesaj alanları zorunludur!');
      return;
    }

    const recipients = getRecipients();
    
    if (recipients.length === 0) {
      toast.error('Alıcı bulunamadı!');
      return;
    }

    if (!window.confirm(`${recipients.length} kişiye mail göndermek istediğinize emin misiniz?`)) {
      return;
    }

    setSending(true);

    try {
      // Simülasyon (Gerçekte email service kullanılacak)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mail geçmişine kaydet
      const newRecord = {
        id: Date.now(),
        subject: emailData.subject,
        message: emailData.message,
        recipientType: emailData.recipientType,
        recipientCount: recipients.length,
        sentBy: user?.email || 'admin',
        sentAt: new Date().toISOString()
      };

      const history = [...sentHistory, newRecord];
      localStorage.setItem('emailHistory', JSON.stringify(history));
      setSentHistory(history);

      toast.success(`${recipients.length} kişiye mail gönderildi!`);
      
      // Formu temizle
      setEmailData({
        subject: '',
        message: '',
        recipientType: 'all',
        recipients: []
      });
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('Mail gönderilirken hata oluştu!');
    } finally {
      setSending(false);
    }
  };

  // Hızlı şablonlar
  const templates = [
    {
      name: 'Kampanya Duyurusu',
      subject: '🎉 Özel İndirim Fırsatı!',
      message: `Merhaba,

Size özel %30 indirim fırsatını kaçırmayın!

Tüm ürünlerde geçerli bu kampanya sadece bu hafta sonu için geçerlidir.

İndirim Kodu: OZEL30

Alışverişe başlamak için sitemizi ziyaret edin.

İyi alışverişler!
VIONA`
    },
    {
      name: 'Yeni Ürün Duyurusu',
      subject: '✨ Yeni Koleksiyon Geldi!',
      message: `Merhaba,

Merakla beklenen yeni koleksiyonumuz yayında!

Şık ve modern tasarımlarımızı keşfetmek için hemen göz atın.

VIONA ile tarzınızı yansıtın.

Sevgilerle,
VIONA Ekibi`
    },
    {
      name: 'Bülten',
      subject: '📰 VIONA Bülteni',
      message: `Merhaba,

Bu ayki bültenimizde:
- Yeni ürünler
- Kampanyalar
- Moda trendleri
- Müşteri yorumları

Daha fazlası için sitemizi ziyaret edin.

VIONA`
    }
  ];

  const applyTemplate = (template) => {
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message
    }));
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light uppercase tracking-wider mb-2">
          Mail Gönderimi
        </h1>
        <p className="text-neutral-600">
          Kampanya, bülten ve duyuru maillerini gönderin
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-neutral-300">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} className="text-blue-600" />
            <p className="text-sm text-neutral-500 uppercase tracking-wider">Toplam Müşteri</p>
          </div>
          <p className="text-3xl font-light">{stats.totalCustomers}</p>
        </div>
        
        <div className="bg-white p-6 border border-neutral-300">
          <div className="flex items-center gap-3 mb-2">
            <Mail size={24} className="text-green-600" />
            <p className="text-sm text-neutral-500 uppercase tracking-wider">Bülten Abonesi</p>
          </div>
          <p className="text-3xl font-light">{stats.totalSubscribers}</p>
        </div>
        
        <div className="bg-white p-6 border border-neutral-300">
          <div className="flex items-center gap-3 mb-2">
            <Send size={24} className="text-purple-600" />
            <p className="text-sm text-neutral-500 uppercase tracking-wider">Gönderilen Mail</p>
          </div>
          <p className="text-3xl font-light">{sentHistory.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mail Formu */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 border border-neutral-300">
            <h2 className="text-xl font-light uppercase tracking-wider mb-6">Yeni Mail</h2>

            {/* Alıcı Tipi */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Alıcılar</label>
              <select
                value={emailData.recipientType}
                onChange={(e) => setEmailData({ ...emailData, recipientType: e.target.value })}
                className="input-field w-full"
              >
                <option value="all">Tümü ({getRecipients().length} kişi)</option>
                <option value="customers">Sadece Müşteriler ({stats.totalCustomers} kişi)</option>
                <option value="subscribers">Sadece Aboneler ({stats.totalSubscribers} kişi)</option>
              </select>
            </div>

            {/* Konu */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Konu *</label>
              <input
                type="text"
                value={emailData.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                placeholder="Mail konusu"
                className="input-field w-full"
              />
            </div>

            {/* Mesaj */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mesaj *</label>
              <textarea
                value={emailData.message}
                onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                placeholder="Mail içeriği..."
                className="input-field w-full"
                rows="12"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {emailData.message.length} karakter
              </p>
            </div>

            {/* Gönder Butonu */}
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Mail Gönder ({getRecipients().length} kişi)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Şablonlar ve Geçmiş */}
        <div className="space-y-6">
          {/* Hızlı Şablonlar */}
          <div className="bg-white p-6 border border-neutral-300">
            <h3 className="text-lg font-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText size={18} />
              Hızlı Şablonlar
            </h3>
            <div className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="w-full text-left p-3 border border-neutral-200 hover:bg-neutral-50 transition text-sm"
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

          {/* Son Gönderilen Mailler */}
          <div className="bg-white p-6 border border-neutral-300">
            <h3 className="text-lg font-light uppercase tracking-wider mb-4">
              Son Gönderiler
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sentHistory.slice(-5).reverse().map((record) => (
                <div key={record.id} className="p-3 bg-neutral-50 border border-neutral-200">
                  <p className="font-medium text-sm mb-1">{record.subject}</p>
                  <p className="text-xs text-neutral-500">
                    {record.recipientCount} kişi · {new Date(record.sentAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))}
              {sentHistory.length === 0 && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  Henüz mail gönderilmedi
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmail;

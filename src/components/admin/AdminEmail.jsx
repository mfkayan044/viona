import React, { useState, useEffect } from 'react';
import { Send, Users, Mail, FileText, Check, X, Loader, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { useToast } from '../../contexts/ToastContext';
import { supabase } from '../../lib/supabase';
import emailService from '../../services/email.service';

const AdminEmail = () => {
  const { user } = useAuth();
  const { orders } = useOrders();
  const toast = useToast();

  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    recipientType: 'all', // all, customers, subscribers, selected
    recipients: []
  });

  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCustomers: 0,
    totalSubscribers: 0
  });

  const [sending, setSending] = useState(false);
  const [sentHistory, setSentHistory] = useState([]);

  useEffect(() => {
    loadUsers();
    loadStats();
    loadHistory();
  }, [orders]);

  const loadUsers = async () => {
    try {
      // Supabase'den tüm kullanıcıları çek
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Sipariş vermiş müşterileri ekle
      const orderEmails = orders.map(o => ({
        id: o.id,
        name: o.customer_name || 'Misafir',
        email: o.customer_email
      }));

      // Newsletter aboneleri
      const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]')
        .map(email => ({ id: email, name: email, email }));

      // Tümünü birleştir ve unique yap
      const allEmails = [...usersData, ...orderEmails, ...subscribers];
      const uniqueUsers = Array.from(
        new Map(allEmails.filter(u => u.email).map(u => [u.email, u])).values()
      );

      setAllUsers(uniqueUsers);
    } catch (error) {
      console.error('Users load error:', error);
    }
  };

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
        return allUsers.map(u => u.email);
      
      case 'customers':
        // Sadece sipariş vermiş müşteriler
        const customerEmails = [...new Set(orders.map(o => o.customer_email).filter(Boolean))];
        return customerEmails;
      
      case 'subscribers':
        // Sadece newsletter aboneleri
        return JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
      
      case 'selected':
        // Seçili kullanıcılar
        return selectedUsers;
      
      default:
        return [];
    }
  };

  const toggleUserSelection = (email) => {
    setSelectedUsers(prev => {
      if (prev.includes(email)) {
        return prev.filter(e => e !== email);
      } else {
        return [...prev, email];
      }
    });
  };

  const toggleSelectAll = () => {
    const filtered = getFilteredUsers();
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map(u => u.email));
    }
  };

  const getFilteredUsers = () => {
    return allUsers.filter(u => 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
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
      // Mesajı HTML formatına çevir (paragraflar için)
      const htmlMessage = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; white-space: pre-wrap; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>VIONA</h1>
    </div>
    <div class="content">
${emailData.message}
    </div>
    <div class="footer">
      <p><strong>VIONA</strong> | Moda & Stil</p>
      <p>Bu maili almak istemiyorsanız, <a href="mailto:info@viona.com.tr">info@viona.com.tr</a> adresine yazabilirsiniz.</p>
    </div>
  </div>
</body>
</html>`;

      // Gerçek mail gönderimi (Brevo SMTP + Vercel API)
      await emailService.sendBulkEmail({
        recipients,
        subject: emailData.subject,
        message: htmlMessage
      });

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

      toast.success(`✅ ${recipients.length} kişiye mail gönderildi!`);
      
      // Formu temizle
      setEmailData({
        subject: '',
        message: '',
        recipientType: 'all',
        recipients: []
      });
      setSelectedUsers([]);
    } catch (error) {
      console.error('Email send error:', error);
      toast.error('❌ Mail gönderilirken hata oluştu: ' + error.message);
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
                onChange={(e) => {
                  setEmailData({ ...emailData, recipientType: e.target.value });
                  if (e.target.value !== 'selected') {
                    setSelectedUsers([]);
                  }
                }}
                className="input-field w-full"
              >
                <option value="all">Tümü ({allUsers.length} kişi)</option>
                <option value="customers">Sadece Müşteriler ({stats.totalCustomers} kişi)</option>
                <option value="subscribers">Sadece Aboneler ({stats.totalSubscribers} kişi)</option>
                <option value="selected">Seçili Kullanıcılar ({selectedUsers.length} kişi)</option>
              </select>
            </div>

            {/* Kullanıcı Seçim Listesi */}
            {emailData.recipientType === 'selected' && (
              <div className="mb-4 border border-neutral-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Kullanıcı Seç</label>
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {selectedUsers.length === getFilteredUsers().length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </button>
                </div>
                
                {/* Arama */}
                <div className="mb-3 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Kullanıcı ara..."
                    className="input-field w-full pl-10 text-sm"
                  />
                </div>

                {/* Kullanıcı Listesi */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {getFilteredUsers().map((u) => (
                    <label
                      key={u.email}
                      className="flex items-center gap-2 p-2 hover:bg-neutral-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.email)}
                        onChange={() => toggleUserSelection(u.email)}
                        className="w-4 h-4 accent-black"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                      </div>
                    </label>
                  ))}
                  {getFilteredUsers().length === 0 && (
                    <p className="text-sm text-neutral-500 text-center py-4">Kullanıcı bulunamadı</p>
                  )}
                </div>
              </div>
            )}

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

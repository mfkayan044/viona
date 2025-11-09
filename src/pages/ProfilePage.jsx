import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useReviews } from '../contexts/ReviewContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Phone, Lock, MapPin, Trash2, Plus, Camera, Upload, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateProfile, addAddress, removeAddress, changePassword } = useAuth();
  const { getUserReviews, deleteReview } = useReviews();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('info'); // info, addresses, password, reviews
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newAddress, setNewAddress] = useState({
    title: '',
    address: '',
    city: '',
    district: '',
    postalCode: ''
  });

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, isAuthenticated, navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profil bilgileriniz güncellendi!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı!');
      return;
    }

    try {
      await changePassword(passwordData.newPassword);
      toast.success('Şifreniz değiştirildi!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    if (!newAddress.title || !newAddress.address || !newAddress.city) {
      toast.error('Lütfen tüm alanları doldurun!');
      return;
    }

    try {
      await addAddress(newAddress);
      toast.success('Adres eklendi!');
      setNewAddress({
        title: '',
        address: '',
        city: '',
        district: '',
        postalCode: ''
      });
      setShowAddressForm(false);
    } catch (error) {
      toast.error('Adres eklenirken hata oluştu!');
    }
  };

  const handleRemoveAddress = async (addressId) => {
    if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      try {
        await removeAddress(addressId);
        toast.success('Adres silindi!');
      } catch (error) {
        toast.error('Adres silinirken hata oluştu!');
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dosya boyutu 2MB\'dan küçük olmalıdır');
      return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Sadece resim dosyaları yüklenebilir (JPG, PNG, WEBP, GIF)');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Supabase Storage'a yükle
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`public/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(`public/${fileName}`);

      // users tablosunu güncelle
      await updateProfile({ avatar: publicUrl });
      toast.success('✅ Profil fotoğrafınız güncellendi!');
    } catch (error) {
      console.error('Avatar yükleme hatası:', error);
      toast.error('Profil fotoğrafı yüklenirken hata oluştu!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light uppercase tracking-wider mb-2">Profilim</h1>
          <p className="text-neutral-600">Hesap bilgilerinizi yönetin</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white border border-neutral-200 p-4">
              <div className="text-center mb-6 pb-6 border-b border-neutral-200">
                <div className="relative inline-block">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=000&color=fff&size=128`} 
                    alt={user.name} 
                    className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-2 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition disabled:opacity-50"
                    title="Profil fotoğrafını değiştir"
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
                <h3 className="font-medium">{user.name}</h3>
                <p className="text-sm text-neutral-500">{user.email}</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition ${
                    activeTab === 'info' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                >
                  <User size={16} />
                  Bilgilerim
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition ${
                    activeTab === 'addresses' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                >
                  <MapPin size={16} />
                  Adreslerim
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition ${
                    activeTab === 'reviews' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                >
                  <Star size={16} />
                  Yorumlarım
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 transition ${
                    activeTab === 'password' ? 'bg-black text-white' : 'hover:bg-neutral-100'
                  }`}
                >
                  <Lock size={16} />
                  Şifre Değiştir
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <div className="bg-white border border-neutral-200 p-8">
              {/* Personal Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-2xl font-light uppercase tracking-wider mb-6">
                    Kişisel Bilgiler
                  </h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">E-posta</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Bilgileri Güncelle
                    </button>
                  </form>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-light uppercase tracking-wider">
                      Adreslerim
                    </h2>
                    <button
                      onClick={() => setShowAddressForm(!showAddressForm)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Yeni Adres
                    </button>
                  </div>

                  {/* Add Address Form */}
                  {showAddressForm && (
                    <form onSubmit={handleAddAddress} className="mb-6 p-6 bg-neutral-50 border border-neutral-200">
                      <h3 className="font-medium mb-4">Yeni Adres Ekle</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm mb-2">Adres Başlığı</label>
                          <input
                            type="text"
                            value={newAddress.title}
                            onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                            placeholder="Ev, İş, vb."
                            className="input-field w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm mb-2">Adres</label>
                          <textarea
                            value={newAddress.address}
                            onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                            placeholder="Tam adres..."
                            className="input-field w-full"
                            rows="3"
                          />
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm mb-2">Şehir</label>
                            <input
                              type="text"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                              className="input-field w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-2">İlçe</label>
                            <input
                              type="text"
                              value={newAddress.district}
                              onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                              className="input-field w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm mb-2">Posta Kodu</label>
                            <input
                              type="text"
                              value={newAddress.postalCode}
                              onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})}
                              className="input-field w-full"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary">
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="btn-outline"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Address List */}
                  <div className="space-y-4">
                    {user.addresses && user.addresses.length > 0 ? (
                      user.addresses.map(address => (
                        <div key={address.id} className="border border-neutral-200 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium mb-2">{address.title}</h3>
                              <p className="text-sm text-neutral-600">{address.address}</p>
                              <p className="text-sm text-neutral-600">
                                {address.district}, {address.city} {address.postalCode}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveAddress(address.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-neutral-500">
                        Henüz kayıtlı adres yok
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <h2 className="text-2xl font-light uppercase tracking-wider mb-6">
                    Şifre Değiştir
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm mb-2">Mevcut Şifre</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Yeni Şifre (Tekrar)</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="input-field w-full"
                      />
                    </div>
                    <button type="submit" className="btn-primary">
                      Şifreyi Değiştir
                    </button>
                  </form>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <h2 className="text-2xl font-light uppercase tracking-wider mb-6">
                    Yorumlarım
                  </h2>
                  <div className="space-y-4">
                    {getUserReviews(user.email).length > 0 ? (
                      getUserReviews(user.email).map(review => (
                        <div key={review.id} className="border border-neutral-200 p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map(star => (
                                    <Star
                                      key={star}
                                      size={16}
                                      className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-neutral-500">
                                  {new Date(review.created_at).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-neutral-700">{review.comment}</p>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                                  try {
                                    await deleteReview(review.id);
                                    toast.success('Yorum silindi');
                                  } catch (error) {
                                    toast.error('Yorum silinemedi');
                                  }
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-neutral-500">
                        Henüz yorum yapmadınız
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;

import React, { useState } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Upload, Link as LinkIcon, Database } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { convertFileToBase64, validateImageSize, validateImageFormat, resizeImage } from '../../utils/imageUtils';
import { seedProducts } from '../../utils/seedData';
import { testSupabaseConnection } from '../../utils/testSupabase';
import { storageService } from '../../services/storage.service';
import { heroImageService, siteSettingsService } from '../../services/supabase.service';

const AdminSettings = () => {
  const { 
    siteSettings, 
    setSiteSettings, 
    heroGallery, 
    setHeroGallery,
    categories,
    addCategory,
    deleteCategory,
    colors,
    addColor,
    deleteColor
  } = useApp();
  const [editingSettings, setEditingSettings] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' veya 'file'
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newColor, setNewColor] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      
      // Site ayarlarını Supabase'e kaydet
      await siteSettingsService.update(siteSettings);
      
      setEditingSettings(false);
      alert('✅ Site ayarları başarıyla kaydedildi!');
    } catch (error) {
      console.error('❌ Site ayarları kaydedilirken hata:', error);
      alert('❌ Ayarlar kaydedilirken bir hata oluştu.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Format kontrolü
    if (!validateImageFormat(file)) {
      alert('Lütfen geçerli bir görsel formatı seçin (JPG, PNG, WebP, GIF)');
      return;
    }

    // Boyut kontrolü (2MB - Logo için daha küçük)
    if (!validateImageSize(file, 2)) {
      alert('Logo boyutu 2MB\'dan küçük olmalıdır.');
      return;
    }

    try {
      setIsUploadingLogo(true);
      
      // Eski logoyu Storage'dan sil (eğer Supabase URL'si ise)
      if (siteSettings.logo && siteSettings.logo.includes('supabase')) {
        await storageService.deleteImage(siteSettings.logo, 'site-assets');
      }
      
      // Yeni logoyu Supabase Storage'a yükle
      const logoUrl = await storageService.uploadImage(file, 'logos', 'site-assets');
      
      // State'i güncelle
      setSiteSettings({...siteSettings, logo: logoUrl});
      
      // Input'u temizle
      event.target.value = '';
      
      alert('✅ Logo başarıyla yüklendi!');
    } catch (error) {
      console.error('Logo yükleme hatası:', error);
      alert('❌ Logo yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    await testSupabaseConnection();
    setIsTesting(false);
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Demo ürünleri Supabase veritabanına eklemek istediğinize emin misiniz?')) {
      return;
    }

    setIsSeeding(true);
    const success = await seedProducts();
    setIsSeeding(false);

    if (success) {
      alert('✅ Demo ürünler başarıyla eklendi! Sayfa yenilenecek...');
      window.location.reload();
    } else {
      alert('❌ Bazı ürünler eklenemedi. Console\'u kontrol edin.');
    }
  };

  const addGalleryImage = () => {
    if (!newImageUrl.trim()) {
      alert('Lütfen bir görsel URL\'si girin.');
      return;
    }
    setHeroGallery([...heroGallery, newImageUrl]);
    setNewImageUrl('');
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Format kontrolü
    if (!validateImageFormat(file)) {
      alert('Lütfen geçerli bir görsel formatı seçin (JPG, PNG, WebP, GIF)');
      return;
    }

    // Boyut kontrolü (10MB)
    if (!validateImageSize(file, 10)) {
      alert('Görsel boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Supabase Storage'a yükle
      const imageUrl = await storageService.uploadHeroImage(file);
      
      // Veritabanına kaydet
      const nextOrderIndex = heroGallery.length + 1;
      await heroImageService.create(imageUrl, nextOrderIndex);
      
      // State'i güncelle
      setHeroGallery([...heroGallery, imageUrl]);
      
      // Input'u temizle
      event.target.value = '';
      
      alert('✅ Görsel başarıyla yüklendi ve kaydedildi!');
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('❌ Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeGalleryImage = async (index) => {
    if (!window.confirm('Bu görseli silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const imageUrl = heroGallery[index];
      
      // Storage'dan sil
      await storageService.deleteHeroImage(imageUrl);
      
      // Veritabanından sil
      // Not: URL ile silmek için tüm kayıtları çekip eşleşeni bulmalıyız
      const allImages = await heroImageService.getAll();
      const imageToDelete = allImages.find(img => img.image_url === imageUrl);
      if (imageToDelete) {
        await heroImageService.delete(imageToDelete.id);
      }
      
      // State'i güncelle
      setHeroGallery(heroGallery.filter((_, i) => i !== index));
      
      alert('✅ Görsel başarıyla silindi!');
    } catch (error) {
      console.error('Görsel silme hatası:', error);
      alert('❌ Görsel silinirken bir hata oluştu.');
    }
  };

  const moveImage = (fromIndex, toIndex) => {
    const newGallery = [...heroGallery];
    const [movedItem] = newGallery.splice(fromIndex, 1);
    newGallery.splice(toIndex, 0, movedItem);
    setHeroGallery(newGallery);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Lütfen görsel dosyası sürükleyin.');
      return;
    }

    // İlk görseli al
    const file = imageFiles[0];

    if (!validateImageFormat(file)) {
      alert('Lütfen geçerli bir görsel formatı seçin (JPG, PNG, WebP, GIF)');
      return;
    }

    if (!validateImageSize(file, 10)) {
      alert('Görsel boyutu 10MB\'dan küçük olmalıdır.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Supabase Storage'a yükle
      const imageUrl = await storageService.uploadHeroImage(file);
      
      // Veritabanına kaydet
      const nextOrderIndex = heroGallery.length + 1;
      await heroImageService.create(imageUrl, nextOrderIndex);
      
      // State'i güncelle
      setHeroGallery([...heroGallery, imageUrl]);
      
      alert('✅ Görsel başarıyla yüklendi!');
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('❌ Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 p-8 bg-neutral-50">
      <h1 className="text-3xl font-light tracking-wider mb-8 uppercase">Site Ayarları</h1>
      
      {/* Supabase Database Section */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
          <Database size={20} />
          Veritabanı Yönetimi
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Database size={18} />
              {isTesting ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}
            </button>
            
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Upload size={18} />
              {isSeeding ? 'Ekleniyor...' : 'Demo Ürünleri Ekle'}
            </button>
          </div>
          
          <p className="text-sm text-neutral-600">
            <strong>Not:</strong> "Demo Ürünleri Ekle" butonu, Supabase veritabanınıza örnek ürünleri ekler. 
            Bu işlem sonrası sayfa otomatik yenilenecek ve ürünler veritabanından gelecektir.
          </p>
        </div>
      </div>
      
      {/* Hero Gallery Section */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon size={20} />
          Ana Sayfa Galeri
        </h2>
        
        <div className="mb-6">
          <p className="text-sm text-neutral-600 mb-4">
            Ana sayfadaki arka plan için görseller. Görseller otomatik olarak değişecektir.
          </p>
          
          {/* Upload Method Selector */}
          <div className="flex gap-2 mb-4 border-b border-neutral-200 pb-4">
            <button
              onClick={() => setUploadMethod('url')}
              className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${
                uploadMethod === 'url'
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              <LinkIcon size={18} />
              URL ile Ekle
            </button>
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex items-center gap-2 px-4 py-2 transition-all duration-300 ${
                uploadMethod === 'file'
                  ? 'bg-black text-white'
                  : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              <Upload size={18} />
              Dosya Yükle
            </button>
          </div>
          
          {/* URL Upload */}
          {uploadMethod === 'url' && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Görsel URL'si girin (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGalleryImage()}
                className="input-field flex-1"
              />
              <button
                onClick={addGalleryImage}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                Ekle
              </button>
            </div>
          )}
          
          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div className="mb-4">
              <label className="block">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                    isDragging 
                      ? 'border-black bg-black/5 scale-105' 
                      : 'border-neutral-300 hover:border-black hover:bg-neutral-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                      <p className="text-sm text-neutral-600">Yükleniyor ve optimize ediliyor...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload size={48} className="text-neutral-400" />
                      <p className="text-sm font-medium">
                        {isDragging ? 'Bırakın...' : 'Tıklayın veya sürükleyin'}
                      </p>
                      <p className="text-xs text-neutral-500">
                        JPG, PNG, WebP, GIF (Max 5MB)
                      </p>
                      <p className="text-xs text-neutral-400 mt-2">
                        Görsel otomatik olarak 1920px'e optimize edilecek
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {heroGallery.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover border border-neutral-200 rounded hover:shadow-lg transition-shadow duration-300"
                />
                
                {/* Navigation Arrows */}
                <div className="absolute inset-0 flex items-center justify-between px-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {index > 0 && (
                    <button
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-black/70 text-white p-1 rounded hover:bg-black transition-colors"
                      title="Sola taşı"
                    >
                      ←
                    </button>
                  )}
                  <div className="flex-1"></div>
                  {index < heroGallery.length - 1 && (
                    <button
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-black/70 text-white p-1 rounded hover:bg-black transition-colors"
                      title="Sağa taşı"
                    >
                      →
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => removeGalleryImage(index)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          
          {heroGallery.length === 0 && (
            <div className="text-center py-8 text-neutral-400 border-2 border-dashed border-neutral-300 rounded">
              <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Henüz görsel eklenmemiş</p>
            </div>
          )}
        </div>
      </div>

      {/* Site Settings */}
      <div className="bg-white border border-neutral-200 p-6">
        {editingSettings ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-light mb-2 uppercase tracking-wider">Logo</label>
              
              {/* Mevcut Logo Önizleme */}
              {siteSettings.logo && (
                <div className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded">
                  <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Mevcut Logo</p>
                  {siteSettings.logo.startsWith('http') ? (
                    <img 
                      src={siteSettings.logo} 
                      alt="Logo" 
                      className="h-16 object-contain bg-white p-2 border border-neutral-200 rounded"
                    />
                  ) : (
                    <div className="text-6xl">{siteSettings.logo}</div>
                  )}
                </div>
              )}
              
              {/* Logo Yükleme */}
              <div className="flex gap-2">
                <label className="flex-1 btn-primary cursor-pointer flex items-center justify-center gap-2">
                  <Upload size={18} />
                  {isUploadingLogo ? 'Yükleniyor...' : 'Logo Yükle'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                PNG veya SVG formatında, şeffaf arka planlı logo önerilir. Max 2MB.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-light mb-2 uppercase tracking-wider">Site Adı</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-light mb-2 uppercase tracking-wider">Slogan</label>
              <input
                type="text"
                value={siteSettings.slogan}
                onChange={(e) => setSiteSettings({...siteSettings, slogan: e.target.value})}
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-light mb-2 uppercase tracking-wider">Hakkımızda</label>
              <textarea
                value={siteSettings.about}
                onChange={(e) => setSiteSettings({...siteSettings, about: e.target.value})}
                className="input-field"
                rows="4"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-light mb-2 uppercase tracking-wider">Telefon</label>
                <input
                  type="text"
                  value={siteSettings.phone}
                  onChange={(e) => setSiteSettings({...siteSettings, phone: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light mb-2 uppercase tracking-wider">E-posta</label>
                <input
                  type="email"
                  value={siteSettings.email}
                  onChange={(e) => setSiteSettings({...siteSettings, email: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light mb-2 uppercase tracking-wider">Instagram</label>
                <input
                  type="text"
                  value={siteSettings.instagram}
                  onChange={(e) => setSiteSettings({...siteSettings, instagram: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-light mb-2 uppercase tracking-wider">Adres</label>
                <input
                  type="text"
                  value={siteSettings.address}
                  onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                  className="input-field"
                />
              </div>
            </div>
            
            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {isSavingSettings ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {siteSettings.logo && siteSettings.logo.startsWith('http') ? (
                <img 
                  src={siteSettings.logo} 
                  alt={siteSettings.siteName}
                  className="h-12 object-contain"
                />
              ) : (
                <h2 className="text-4xl">{siteSettings.logo}</h2>
              )}
              <button
                onClick={() => setEditingSettings(true)}
                className="btn-outline"
              >
                Düzenle
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-light text-2xl tracking-widest uppercase">{siteSettings.siteName}</h3>
                <p className="text-neutral-600 text-sm mt-1">{siteSettings.slogan}</p>
              </div>
              
              <div>
                <h4 className="font-light mb-2 uppercase tracking-wider text-sm">Hakkımızda</h4>
                <p className="text-neutral-700">{siteSettings.about}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Telefon</p>
                  <p className="font-light mt-1">{siteSettings.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">E-posta</p>
                  <p className="font-light mt-1">{siteSettings.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Instagram</p>
                  <p className="font-light mt-1">{siteSettings.instagram}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wider">Adres</p>
                  <p className="font-light mt-1">{siteSettings.address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kategori Yönetimi */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-light mb-6 uppercase tracking-wider">Kategori Yönetimi</h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Yeni kategori adı..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addCategory(newCategory);
                setNewCategory('');
              }
            }}
            className="input-field flex-1"
          />
          <button
            onClick={() => {
              addCategory(newCategory);
              setNewCategory('');
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Ekle
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center justify-between bg-neutral-50 border border-neutral-200 px-4 py-3 group hover:border-black transition-all"
            >
              <span className="font-light">{category}</span>
              <button
                onClick={() => {
                  if (window.confirm(`"${category}" kategorisini silmek istediğinize emin misiniz?`)) {
                    deleteCategory(category);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-neutral-500 mt-4">
          {categories.length} kategori mevcut
        </p>
      </div>

      {/* Renk Yönetimi */}
      <div className="bg-white border border-neutral-200 p-6 mb-8">
        <h2 className="text-xl font-light mb-6 uppercase tracking-wider">Renk Yönetimi</h2>
        
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Yeni renk adı..."
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addColor(newColor);
                setNewColor('');
              }
            }}
            className="input-field flex-1"
          />
          <button
            onClick={() => {
              addColor(newColor);
              setNewColor('');
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Ekle
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {colors.map((color) => (
            <div
              key={color}
              className="flex items-center justify-between bg-neutral-50 border border-neutral-200 px-4 py-3 group hover:border-black transition-all"
            >
              <span className="font-light capitalize">{color}</span>
              <button
                onClick={() => {
                  if (window.confirm(`"${color}" rengini silmek istediğinize emin misiniz?`)) {
                    deleteColor(color);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:scale-110"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        
        <p className="text-xs text-neutral-500 mt-4">
          {colors.length} renk mevcut
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { resizeImage, validateImageSize, validateImageFormat } from '../../utils/imageUtils';
import { storageService } from '../../services/storage.service';

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct, categories, colors } = useApp();
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '',
    images: [],
    description: '',
    stock: '',
    featured: false,
    category: '',
    color: '',
    variants: []
  });
  const [imageUploadMethod, setImageUploadMethod] = useState('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    color: '',
    sizes: '',
    stock: '',
    priceModifier: 0
  });
  const [editVariantForm, setEditVariantForm] = useState(false);
  const [editNewVariant, setEditNewVariant] = useState({
    color: '',
    sizes: '',
    stock: '',
    priceModifier: 0
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert('Lütfen ürün adı ve fiyatını giriniz.');
      return;
    }
    addProduct(newProduct);
    setNewProduct({ 
      name: '', 
      price: '', 
      image: '', 
      images: [],
      description: '', 
      stock: '', 
      featured: false,
      category: '',
      color: '',
      variants: []
    });
    setShowVariantForm(false);
  };

  const handleAddVariant = () => {
    if (!newVariant.color) {
      alert('Lütfen renk giriniz.');
      return;
    }
    
    const variant = {
      color: newVariant.color,
      sizes: newVariant.sizes ? newVariant.sizes.split(',').map(s => s.trim()) : [],
      stock: parseInt(newVariant.stock) || 0,
      priceModifier: parseFloat(newVariant.priceModifier) || 0
    };

    setNewProduct({
      ...newProduct,
      variants: [...(newProduct.variants || []), variant]
    });

    setNewVariant({
      color: '',
      sizes: '',
      stock: '',
      priceModifier: 0
    });
  };

  const handleRemoveVariant = (index) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter((_, i) => i !== index)
    });
  };

  const handleAddEditVariant = (productId) => {
    if (!editNewVariant.color) {
      alert('Lütfen renk giriniz.');
      return;
    }
    
    const variant = {
      color: editNewVariant.color,
      sizes: editNewVariant.sizes ? editNewVariant.sizes.split(',').map(s => s.trim()) : [],
      stock: parseInt(editNewVariant.stock) || 0,
      priceModifier: parseFloat(editNewVariant.priceModifier) || 0
    };

    const product = products.find(p => p.id === productId);
    const updatedVariants = [...(product.variants || []), variant];
    
    updateProduct(productId, { variants: updatedVariants });

    setEditNewVariant({
      color: '',
      sizes: '',
      stock: '',
      priceModifier: 0
    });
    setEditVariantForm(false);
  };

  const handleRemoveEditVariant = (productId, index) => {
    const product = products.find(p => p.id === productId);
    const updatedVariants = product.variants.filter((_, i) => i !== index);
    updateProduct(productId, { variants: updatedVariants });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      deleteProduct(id);
    }
  };

  const handleProductImageUpload = async (event) => {
    const files = Array.from(event.target.files); // Tüm dosyaları al
    if (files.length === 0) return;

    // Tüm dosyaları kontrol et
    for (const file of files) {
      if (!validateImageFormat(file)) {
        alert(`${file.name} geçerli bir görsel formatı değil (JPG, PNG, WebP, GIF)`);
        return;
      }

      if (!validateImageSize(file, 5)) {
        alert(`${file.name} boyutu 5MB'dan büyük.`);
        return;
      }
    }

    try {
      setIsUploadingImage(true);
      
      // ✅ Tüm dosyaları Supabase Storage'a yükle
      console.log(`📤 ${files.length} fotoğraf yükleniyor...`);
      const imageUrls = await storageService.uploadMultipleImages(files, 'products');
      console.log('✅ Fotoğraflar Supabase Storage\'a yüklendi:', imageUrls);
      
      // Ana görsel ve galeriye ekle
      const currentImages = newProduct.images || [];
      const allImages = [...currentImages, ...imageUrls];
      
      setNewProduct({ 
        ...newProduct, 
        image: newProduct.image || imageUrls[0], // İlk fotoğraf ana görsel
        images: allImages
      });
      
      alert(`✅ ${imageUrls.length} fotoğraf başarıyla yüklendi!`);
      event.target.value = '';
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('❌ Görseller yüklenirken bir hata oluştu: ' + error.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    const updatedImages = newProduct.images.filter((_, i) => i !== index);
    setNewProduct({
      ...newProduct,
      images: updatedImages,
      image: updatedImages[0] || '' // İlk görseli ana görsel yap
    });
  };

  const handleSetMainImage = (index) => {
    const newImages = [...newProduct.images];
    const mainImage = newImages[index];
    newImages.splice(index, 1);
    newImages.unshift(mainImage);
    
    setNewProduct({
      ...newProduct,
      images: newImages,
      image: mainImage
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-8 bg-neutral-50">
      <h1 className="text-2xl sm:text-3xl font-light tracking-wider mb-6 sm:mb-8 uppercase">Ürün Yönetimi</h1>
      
      <div className="bg-white border border-neutral-200 p-4 sm:p-6 mb-8">
        <h2 className="text-lg sm:text-xl font-light mb-4 sm:mb-6 uppercase tracking-wider">Yeni Ürün</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ürün Adı"
            value={newProduct.name}
            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Fiyat (₺)"
            value={newProduct.price}
            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            className="input-field"
          />
          
          {/* Kategori Seçimi */}
          <select
            value={newProduct.category}
            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
            className="input-field"
          >
            <option value="">Kategori Seçin</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          {/* Renk Seçimi */}
          <select
            value={newProduct.color}
            onChange={(e) => setNewProduct({...newProduct, color: e.target.value})}
            className="input-field"
          >
            <option value="">Renk Seçin</option>
            {colors.map(color => (
              <option key={color} value={color} className="capitalize">{color}</option>
            ))}
          </select>
          
          {/* Image Upload Section */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-light mb-2 uppercase tracking-wider">Ürün Görselleri</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setImageUploadMethod('url')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs transition-all touch-manipulation ${
                  imageUploadMethod === 'url'
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <LinkIcon size={16} className="sm:w-3.5 sm:h-3.5" />
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageUploadMethod('file')}
                className={`flex items-center gap-2 px-4 py-2 sm:px-3 sm:py-1 text-sm sm:text-xs transition-all touch-manipulation ${
                  imageUploadMethod === 'file'
                    ? 'bg-black text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                }`}
              >
                <Upload size={16} className="sm:w-3.5 sm:h-3.5" />
                Dosya
              </button>
            </div>
            
            {imageUploadMethod === 'url' ? (
              <input
                type="text"
                placeholder="Görsel URL (Enter'a basın)"
                value={newProduct.image}
                onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && newProduct.image) {
                    const images = newProduct.images || [];
                    setNewProduct({
                      ...newProduct,
                      images: [...images, newProduct.image],
                      image: ''
                    });
                  }
                }}
                className="input-field w-full"
              />
            ) : (
              <div>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProductImageUpload}
                    className="hidden"
                    disabled={isUploadingImage}
                    multiple
                  />
                  <div className="border-2 border-dashed border-neutral-300 rounded p-4 text-center cursor-pointer hover:border-black transition-all">
                    {isUploadingImage ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                        <span className="text-sm">Yükleniyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Upload size={20} className="text-neutral-400" />
                        <span className="text-sm">Görsel Seç (Çoklu)</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            )}
            
            {/* Image Gallery */}
            {newProduct.images && newProduct.images.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-neutral-500 mb-2">{newProduct.images.length} görsel yüklendi</p>
                <div className="grid grid-cols-4 gap-2">
                  {newProduct.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={img} 
                        alt={`Ürün ${index + 1}`} 
                        className={`w-full h-24 object-cover rounded ${index === 0 ? 'ring-2 ring-green-500' : ''}`}
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">Ana</span>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-1">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(index)}
                            className="bg-white text-black px-2 py-1 text-xs rounded hover:bg-neutral-200"
                          >
                            Ana Yap
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <input
            type="number"
            placeholder="Stok Adedi"
            value={newProduct.stock}
            onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
            className="input-field sm:col-span-1 col-span-1"
          />
          <textarea
            placeholder="Açıklama"
            value={newProduct.description}
            onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            className="input-field col-span-1 sm:col-span-2"
            rows="3"
          />
          <label className="flex items-center gap-2 col-span-1 sm:col-span-2 touch-manipulation py-2">
            <input
              type="checkbox"
              checked={newProduct.featured}
              onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
              className="w-5 h-5 sm:w-4 sm:h-4"
            />
            <span className="text-base sm:text-sm">Öne Çıkan Ürün</span>
          </label>
        </div>

        {/* Varyant Yönetimi */}
        <div className="mt-6 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-light uppercase tracking-wider">Ürün Varyantları</h3>
            <button
              type="button"
              onClick={() => setShowVariantForm(!showVariantForm)}
              className="btn-secondary text-xs sm:text-sm touch-manipulation"
            >
              {showVariantForm ? 'Formu Gizle' : '+ Varyant Ekle'}
            </button>
          </div>

          {showVariantForm && (
            <div className="bg-neutral-50 p-4 rounded mb-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Renk (örn: Gümüş, Altın)"
                  value={newVariant.color}
                  onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Bedenler (örn: S, M, L veya Küçük, Orta)"
                  value={newVariant.sizes}
                  onChange={(e) => setNewVariant({...newVariant, sizes: e.target.value})}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Stok Adedi"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Fiyat Farkı (₺) (+/-)"
                  value={newVariant.priceModifier}
                  onChange={(e) => setNewVariant({...newVariant, priceModifier: e.target.value})}
                  className="input-field"
                />
              </div>
              <button
                type="button"
                onClick={handleAddVariant}
                className="btn-primary mt-3 text-sm"
              >
                Varyant Ekle
              </button>
            </div>
          )}

          {/* Mevcut Varyantlar */}
          {newProduct.variants && newProduct.variants.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-neutral-600 mb-2">{newProduct.variants.length} varyant eklendi</p>
              {newProduct.variants.map((variant, index) => (
                <div key={index} className="flex items-center justify-between bg-white border p-3 rounded">
                  <div className="flex-1 grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-neutral-500">Renk:</span>
                      <span className="ml-1 font-medium">{variant.color}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Bedenler:</span>
                      <span className="ml-1 font-medium">
                        {variant.sizes.length > 0 ? variant.sizes.join(', ') : 'Yok'}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Stok:</span>
                      <span className="ml-1 font-medium">{variant.stock}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Fiyat Farkı:</span>
                      <span className={`ml-1 font-medium ${variant.priceModifier > 0 ? 'text-green-600' : variant.priceModifier < 0 ? 'text-red-600' : ''}`}>
                        {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier} ₺
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleAddProduct}
          className="mt-4 w-full sm:w-auto btn-primary flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-base sm:text-sm py-4 sm:py-2 touch-manipulation"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          Ürün Ekle
        </button>
      </div>

      <div className="bg-white border border-neutral-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-light mb-4 sm:mb-6 uppercase tracking-wider">
          Mevcut Ürünler ({products.length})
        </h2>
        <div className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="border border-neutral-200 p-3 sm:p-4 flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              {/* Galeri Görselleri */}
              {product.images && product.images.length > 0 ? (
                <div className="flex gap-2 w-full sm:w-auto">
                  <img src={product.images[0]} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded" />
                  {product.images.length > 1 && (
                    <div className="text-xs text-neutral-500 self-center">
                      +{product.images.length - 1} görsel
                    </div>
                  )}
                </div>
              ) : product.image && (
                <img src={product.image} alt={product.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded" />
              )}
              
              {editingProduct === product.id ? (
                <div className="flex-1 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                    <input
                      type="text"
                      defaultValue={product.name}
                      onBlur={(e) => updateProduct(product.id, {name: e.target.value})}
                      className="input-field"
                      placeholder="Ürün Adı"
                    />
                    <input
                      type="number"
                      defaultValue={product.price}
                      onBlur={(e) => updateProduct(product.id, {price: parseFloat(e.target.value)})}
                      className="input-field"
                      placeholder="Fiyat"
                    />
                    <select
                      defaultValue={product.category || ''}
                      onChange={(e) => updateProduct(product.id, {category: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Kategori Seçin</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <select
                      defaultValue={product.color || ''}
                      onChange={(e) => updateProduct(product.id, {color: e.target.value})}
                      className="input-field"
                    >
                      <option value="">Renk Seçin</option>
                      {colors.map(color => (
                        <option key={color} value={color} className="capitalize">{color}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      defaultValue={product.stock}
                      onBlur={(e) => updateProduct(product.id, {stock: parseInt(e.target.value)})}
                      className="input-field"
                      placeholder="Stok"
                    />
                    <label className="flex items-center gap-2 col-span-1 touch-manipulation py-2">
                      <input
                        type="checkbox"
                        defaultChecked={product.featured}
                        onChange={(e) => updateProduct(product.id, {featured: e.target.checked})}
                        className="w-5 h-5 sm:w-4 sm:h-4"
                      />
                      <span className="text-base sm:text-sm">Öne Çıkan</span>
                    </label>
                    <textarea
                      defaultValue={product.description}
                      onBlur={(e) => updateProduct(product.id, {description: e.target.value})}
                      className="input-field col-span-1 sm:col-span-2"
                      placeholder="Açıklama"
                      rows="2"
                    />
                  </div>

                  {/* Varyant Yönetimi - Düzenleme Modunda */}
                  <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-medium uppercase tracking-wider">Ürün Varyantları</h4>
                      <button
                        type="button"
                        onClick={() => setEditVariantForm(!editVariantForm)}
                        className="text-xs bg-neutral-800 text-white px-3 py-2 sm:py-1 hover:bg-black touch-manipulation"
                      >
                        {editVariantForm ? 'Formu Gizle' : '+ Varyant Ekle'}
                      </button>
                    </div>

                    {editVariantForm && (
                      <div className="bg-neutral-50 p-3 rounded mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                          <input
                            type="text"
                            placeholder="Renk"
                            value={editNewVariant.color}
                            onChange={(e) => setEditNewVariant({...editNewVariant, color: e.target.value})}
                            className="input-field"
                          />
                          <input
                            type="text"
                            placeholder="Bedenler (virgülle ayırın)"
                            value={editNewVariant.sizes}
                            onChange={(e) => setEditNewVariant({...editNewVariant, sizes: e.target.value})}
                            className="border border-neutral-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Stok"
                            value={editNewVariant.stock}
                            onChange={(e) => setEditNewVariant({...editNewVariant, stock: e.target.value})}
                            className="border border-neutral-300 px-2 py-1 text-sm"
                          />
                          <input
                            type="number"
                            placeholder="Fiyat Farkı (₺)"
                            value={editNewVariant.priceModifier}
                            onChange={(e) => setEditNewVariant({...editNewVariant, priceModifier: e.target.value})}
                            className="border border-neutral-300 px-2 py-1 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddEditVariant(product.id)}
                          className="mt-2 bg-black text-white px-3 py-1 text-sm hover:bg-neutral-800"
                        >
                          Varyant Ekle
                        </button>
                      </div>
                    )}

                    {/* Mevcut Varyantlar */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs text-neutral-600 mb-1">{product.variants.length} varyant</p>
                        {product.variants.map((variant, index) => (
                          <div key={index} className="flex items-center justify-between bg-white border p-2 rounded text-xs">
                            <div className="flex gap-3">
                              <span className="font-medium">{variant.color}</span>
                              {variant.sizes && variant.sizes.length > 0 && (
                                <span className="text-neutral-500">{variant.sizes.join(', ')}</span>
                              )}
                              <span className="text-neutral-500">Stok: {variant.stock}</span>
                              {variant.priceModifier !== 0 && (
                                <span className={variant.priceModifier > 0 ? 'text-green-600' : 'text-red-600'}>
                                  {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier} ₺
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditVariant(product.id, index)}
                              className="text-red-500 hover:text-red-700 text-xs px-2"
                            >
                              Sil
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setEditVariantForm(false);
                      setEditNewVariant({ color: '', sizes: '', stock: '', priceModifier: 0 });
                    }}
                    className="mt-4 bg-black text-white px-4 py-3 sm:py-2 hover:bg-neutral-800 w-full touch-manipulation text-base sm:text-sm"
                  >
                    Düzenlemeyi Bitir
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 w-full">
                    <h3 className="font-light text-base sm:text-lg uppercase tracking-wider">{product.name}</h3>
                    <p className="text-neutral-600 text-sm mt-1 line-clamp-2 sm:line-clamp-none">{product.description}</p>
                    <div className="flex items-center gap-3 sm:gap-4 mt-2 flex-wrap text-sm sm:text-base">
                      <span className="font-light text-base">{product.price.toLocaleString('tr-TR')} ₺</span>
                      <span className="text-xs sm:text-sm text-neutral-500">Stok: {product.stock}</span>
                      {product.category && <span className="text-xs sm:text-sm text-neutral-500">Kategori: {product.category}</span>}
                      {product.color && <span className="text-xs sm:text-sm text-neutral-500">Renk: {product.color}</span>}
                      {product.featured && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Öne Çıkan</span>}
                      {product.variants && product.variants.length > 0 && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {product.variants.length} Varyant
                        </span>
                      )}
                    </div>

                    {/* Varyant Listesi */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-medium text-neutral-700 mb-1">Varyantlar:</p>
                        {product.variants.map((variant, index) => (
                          <div key={index} className="text-xs bg-neutral-50 px-2 py-1 rounded flex items-center gap-2 sm:gap-3 flex-wrap">
                            <span className="font-medium">{variant.color}</span>
                            {variant.sizes && variant.sizes.length > 0 && (
                              <span className="text-neutral-500">Beden: {variant.sizes.join(', ')}</span>
                            )}
                            <span className="text-neutral-500">Stok: {variant.stock}</span>
                            {variant.priceModifier !== 0 && (
                              <span className={variant.priceModifier > 0 ? 'text-green-600' : 'text-red-600'}>
                                {variant.priceModifier > 0 ? '+' : ''}{variant.priceModifier} ₺
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setEditingProduct(product.id)}
                      className="flex-1 sm:flex-none p-3 sm:p-2 border border-neutral-300 hover:border-black hover:scale-110 transition-all duration-300 touch-manipulation"
                    >
                      <Edit2 size={20} className="sm:w-[18px] sm:h-[18px] mx-auto" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="flex-1 sm:flex-none p-3 sm:p-2 border border-neutral-300 hover:border-red-600 hover:text-red-600 hover:scale-110 transition-all duration-300 touch-manipulation"
                    >
                      <Trash2 size={20} className="sm:w-[18px] sm:h-[18px] mx-auto" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;

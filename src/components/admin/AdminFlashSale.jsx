import React, { useState } from 'react';
import { useFlashSale } from '../../contexts/FlashSaleContext';
import { useApp } from '../../contexts/AppContext';
import { Plus, Trash2, Edit2, Calendar, Percent, Clock, Power } from 'lucide-react';

const AdminFlashSale = () => {
  const { flashSales, addFlashSale, updateFlashSale, deleteFlashSale, toggleFlashSale } = useFlashSale();
  const { products } = useApp();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [newSale, setNewSale] = useState({
    name: '',
    discount: '',
    startDate: '',
    endDate: '',
    productIds: []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newSale.name || !newSale.discount || !newSale.startDate || !newSale.endDate) {
      alert('Lütfen tüm alanları doldurun');
      return;
    }

    const saleData = {
      ...newSale,
      discount: parseFloat(newSale.discount),
      productIds: newSale.productIds.map(id => parseInt(id))
    };

    if (editingSale) {
      updateFlashSale(editingSale.id, saleData);
      setEditingSale(null);
    } else {
      addFlashSale(saleData);
    }

    setNewSale({
      name: '',
      discount: '',
      startDate: '',
      endDate: '',
      productIds: []
    });
    setIsAdding(false);
  };

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setNewSale({
      name: sale.name,
      discount: sale.discount,
      startDate: sale.startDate.split('T')[0] + 'T' + sale.startDate.split('T')[1].substring(0, 5),
      endDate: sale.endDate.split('T')[0] + 'T' + sale.endDate.split('T')[1].substring(0, 5),
      productIds: sale.productIds
    });
    setIsAdding(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu kampanyayı silmek istediğinize emin misiniz?')) {
      deleteFlashSale(id);
    }
  };

  const handleProductToggle = (productId) => {
    setNewSale(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const isActive = (sale) => {
    const now = new Date();
    const start = new Date(sale.startDate);
    const end = new Date(sale.endDate);
    return sale.isActive && now >= start && now <= end;
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Sona erdi';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    return `${hours} saat`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light uppercase tracking-wider">Flash Sale Yönetimi</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingSale(null);
            setNewSale({
              name: '',
              discount: '',
              startDate: '',
              endDate: '',
              productIds: []
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          {isAdding ? 'İptal' : 'Yeni Kampanya'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingSale ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Kampanya Adı *</label>
                <input
                  type="text"
                  value={newSale.name}
                  onChange={(e) => setNewSale({ ...newSale, name: e.target.value })}
                  className="input-field w-full"
                  placeholder="örn: Kış İndirimi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">İndirim Oranı (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newSale.discount}
                  onChange={(e) => setNewSale({ ...newSale, discount: e.target.value })}
                  className="input-field w-full"
                  placeholder="örn: 30"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Başlangıç Tarihi *</label>
                <input
                  type="datetime-local"
                  value={newSale.startDate}
                  onChange={(e) => setNewSale({ ...newSale, startDate: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Bitiş Tarihi *</label>
                <input
                  type="datetime-local"
                  value={newSale.endDate}
                  onChange={(e) => setNewSale({ ...newSale, endDate: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2">Ürünler Seçin</label>
              <div className="grid md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-neutral-200 p-4 rounded">
                {products.map(product => (
                  <label key={product.id} className="flex items-center gap-2 p-2 hover:bg-neutral-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSale.productIds.includes(product.id)}
                      onChange={() => handleProductToggle(product.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                {editingSale ? 'Güncelle' : 'Kampanya Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingSale(null);
                }}
                className="btn-outline"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Flash Sales List */}
      <div className="bg-white border border-neutral-200">
        <div className="p-4 border-b bg-neutral-50">
          <h3 className="font-medium">Kampanyalar ({flashSales.length})</h3>
        </div>
        
        <div className="divide-y">
          {flashSales.length === 0 ? (
            <div className="p-8 text-center text-neutral-500">
              Henüz kampanya eklenmemiş
            </div>
          ) : (
            flashSales.map(sale => (
              <div key={sale.id} className="p-4 hover:bg-neutral-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-lg">{sale.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        isActive(sale) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {isActive(sale) ? 'Aktif' : 'Pasif'}
                      </span>
                      <span className="text-lg font-semibold text-red-600">
                        %{sale.discount} İNDİRİM
                      </span>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 text-sm text-neutral-600 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Başlangıç: {new Date(sale.startDate).toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Bitiş: {new Date(sale.endDate).toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Kalan: {getTimeRemaining(sale.endDate)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-neutral-600">{sale.productIds.length} ürün</span>
                      {sale.productIds.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {sale.productIds.slice(0, 3).map(id => {
                            const product = products.find(p => p.id === id);
                            return product ? (
                              <span key={id} className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                {product.name}
                              </span>
                            ) : null;
                          })}
                          {sale.productIds.length > 3 && (
                            <span className="text-xs text-neutral-500">
                              +{sale.productIds.length - 3} daha
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFlashSale(sale.id)}
                      className={`p-2 rounded transition ${
                        sale.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                      title={sale.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                    >
                      <Power size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(sale)}
                      className="p-2 hover:bg-neutral-100 rounded transition"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFlashSale;

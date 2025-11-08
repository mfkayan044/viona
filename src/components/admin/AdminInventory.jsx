import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { useApp } from '../../contexts/AppContext';
import { Package, AlertTriangle, AlertCircle, TrendingUp, DollarSign, Settings } from 'lucide-react';

export default function AdminInventory() {
  const { products, updateProduct } = useApp();
  const {
    stockAlertThreshold,
    setStockAlertThreshold,
    criticalStockThreshold,
    setCriticalStockThreshold,
    lowStockProducts,
    criticalStockProducts,
    outOfStockProducts,
    getStockStatus,
    getStockColor,
    getStockLabel,
    getSuggestedRestock,
    getInventoryValue
  } = useInventory();

  const [showSettings, setShowSettings] = useState(false);
  const [tempAlertThreshold, setTempAlertThreshold] = useState(stockAlertThreshold);
  const [tempCriticalThreshold, setTempCriticalThreshold] = useState(criticalStockThreshold);

  const handleSaveSettings = () => {
    setStockAlertThreshold(tempAlertThreshold);
    setCriticalStockThreshold(tempCriticalThreshold);
    setShowSettings(false);
  };

  const handleQuickRestock = (productId, amount) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateProduct({ ...product, stock: product.stock + amount });
    }
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, textColor }) => (
    <div className="bg-white p-6 border border-neutral-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-light">{value}</p>
        </div>
        <div className={`p-3 ${bgColor}`}>
          <Icon size={24} className={textColor} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light uppercase tracking-wider">Envanter Yönetimi</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white hover:bg-neutral-800 transition-colors"
          >
            <Settings size={18} />
            Ayarlar
          </button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Toplam Ürün"
            value={products.length}
            icon={Package}
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <StatCard
            title="Stokta Yok"
            value={outOfStockProducts.length}
            icon={AlertCircle}
            bgColor="bg-red-50"
            textColor="text-red-600"
          />
          <StatCard
            title="Kritik Stok"
            value={criticalStockProducts.length}
            icon={AlertTriangle}
            bgColor="bg-orange-50"
            textColor="text-orange-600"
          />
          <StatCard
            title="Envanter Değeri"
            value={`${getInventoryValue().toLocaleString('tr-TR')} ₺`}
            icon={DollarSign}
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
        </div>

        {/* Stokta Yok Ürünler */}
        {outOfStockProducts.length > 0 && (
          <div className="bg-white border-2 border-red-200 mb-6">
            <div className="p-6 bg-red-50 border-b border-red-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-600" size={24} />
                <h2 className="text-xl font-light uppercase tracking-wider text-red-900">
                  Stokta Olmayan Ürünler ({outOfStockProducts.length})
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Fiyat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Önerilen Miktar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {outOfStockProducts.map((product) => {
                    const suggested = getSuggestedRestock(product.id);
                    return (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm">{product.price.toLocaleString('tr-TR')} ₺</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-blue-600" />
                            <span className="text-sm font-medium">{suggested > 0 ? suggested : 20} adet</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleQuickRestock(product.id, suggested > 0 ? suggested : 20)}
                            className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                          >
                            Stok Ekle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Kritik Stok Ürünler */}
        {criticalStockProducts.length > 0 && (
          <div className="bg-white border-2 border-orange-200 mb-6">
            <div className="p-6 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-orange-600" size={24} />
                <h2 className="text-xl font-light uppercase tracking-wider text-orange-900">
                  Kritik Stok Seviyesi ({criticalStockProducts.length})
                </h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Mevcut Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Kategori</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Önerilen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {criticalStockProducts.map((product) => {
                    const suggested = getSuggestedRestock(product.id);
                    return (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded">
                            {product.stock} adet
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600">{product.category}</td>
                        <td className="px-6 py-4 text-sm">
                          +{suggested > 0 ? suggested : 15} adet
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleQuickRestock(product.id, suggested > 0 ? suggested : 15)}
                            className="px-4 py-2 bg-orange-600 text-white text-sm hover:bg-orange-700 transition-colors"
                          >
                            Hemen Ekle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Düşük Stok Ürünler */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white border border-neutral-300">
            <div className="p-6 border-b border-neutral-300">
              <h2 className="text-xl font-light uppercase tracking-wider">
                Düşük Stok Seviyesi ({lowStockProducts.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Ürün</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Mevcut Stok</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {lowStockProducts.map((product) => {
                    const status = getStockStatus(product.id);
                    return (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{product.stock} adet</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs rounded ${getStockColor(status)}`}>
                            {getStockLabel(status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleQuickRestock(product.id, 10)}
                            className="px-4 py-2 border border-neutral-300 text-sm hover:bg-neutral-50 transition-colors"
                          >
                            +10 Ekle
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Ayarlar Modalı */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white max-w-md w-full p-8">
              <h3 className="text-2xl font-light uppercase tracking-wider mb-6">Envanter Ayarları</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">
                    Düşük Stok Eşiği
                  </label>
                  <input
                    type="number"
                    value={tempAlertThreshold}
                    onChange={(e) => setTempAlertThreshold(Number(e.target.value))}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                    min="1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Bu seviyenin altındaki ürünler uyarı verecek
                  </p>
                </div>

                <div>
                  <label className="block text-sm uppercase tracking-wider text-neutral-600 mb-2">
                    Kritik Stok Eşiği
                  </label>
                  <input
                    type="number"
                    value={tempCriticalThreshold}
                    onChange={(e) => setTempCriticalThreshold(Number(e.target.value))}
                    className="w-full border border-neutral-300 px-4 py-3 focus:outline-none focus:border-black"
                    min="1"
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    Bu seviyenin altındaki ürünler kritik uyarı verecek
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleSaveSettings}
                  className="flex-1 bg-black text-white px-6 py-3 hover:bg-neutral-800 transition-colors uppercase tracking-wider"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setTempAlertThreshold(stockAlertThreshold);
                    setTempCriticalThreshold(criticalStockThreshold);
                  }}
                  className="flex-1 border border-neutral-300 px-6 py-3 hover:bg-neutral-50 transition-colors uppercase tracking-wider"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

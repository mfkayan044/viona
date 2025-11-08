import React, { useState } from 'react';
import { useCoupon } from '../../contexts/CouponContext';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Calendar, TrendingUp, Percent } from 'lucide-react';

const AdminCoupons = () => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } = useCoupon();
  
  const [isAdding, setIsAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount: 0,
    type: 'percentage',
    minAmount: 0,
    maxDiscount: 0,
    validUntil: '',
    usageLimit: 100,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newCoupon.code || newCoupon.discount <= 0) {
      alert('Lütfen gerekli alanları doldurun');
      return;
    }
    addCoupon(newCoupon);
    setNewCoupon({
      code: '',
      discount: 0,
      type: 'percentage',
      minAmount: 0,
      maxDiscount: 0,
      validUntil: '',
      usageLimit: 100,
      description: ''
    });
    setIsAdding(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      deleteCoupon(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light uppercase tracking-wider">İndirim Kuponları</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Kupon
        </button>
      </div>

      {/* Add Coupon Form */}
      {isAdding && (
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-light mb-4">Yeni Kupon Ekle</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Kupon Kodu *</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="input-field w-full"
                  placeholder="ÖRNEK50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">İndirim Tipi *</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                  className="input-field w-full"
                >
                  <option value="percentage">Yüzde (%)</option>
                  <option value="fixed">Sabit Tutar (₺)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">İndirim Miktarı *</label>
                <input
                  type="number"
                  value={newCoupon.discount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, discount: parseFloat(e.target.value) })}
                  className="input-field w-full"
                  placeholder={newCoupon.type === 'percentage' ? '50' : '100'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  {newCoupon.type === 'percentage' ? 'Maksimum İndirim (₺)' : 'Minimum Sepet Tutarı (₺)'}
                </label>
                <input
                  type="number"
                  value={newCoupon.type === 'percentage' ? newCoupon.maxDiscount : newCoupon.minAmount}
                  onChange={(e) => setNewCoupon({ 
                    ...newCoupon, 
                    [newCoupon.type === 'percentage' ? 'maxDiscount' : 'minAmount']: parseFloat(e.target.value) 
                  })}
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Minimum Sepet Tutarı (₺)</label>
                <input
                  type="number"
                  value={newCoupon.minAmount}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minAmount: parseFloat(e.target.value) })}
                  className="input-field w-full"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Kullanım Limiti</label>
                <input
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) })}
                  className="input-field w-full"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Geçerlilik Tarihi *</label>
                <input
                  type="date"
                  value={newCoupon.validUntil}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                  className="input-field w-full"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-2">Açıklama</label>
              <input
                type="text"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="input-field w-full"
                placeholder="Kupon açıklaması"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                Kuponu Ekle
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="bg-white border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left p-4 font-light">Kod</th>
                <th className="text-left p-4 font-light">İndirim</th>
                <th className="text-left p-4 font-light">Min. Tutar</th>
                <th className="text-left p-4 font-light">Kullanım</th>
                <th className="text-left p-4 font-light">Geçerlilik</th>
                <th className="text-left p-4 font-light">Durum</th>
                <th className="text-left p-4 font-light">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-neutral-500">
                    Henüz kupon bulunmuyor
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const isExpired = new Date(coupon.validUntil) < new Date();
                  const isLimitReached = coupon.usedCount >= coupon.usageLimit;
                  
                  return (
                    <tr key={coupon.id} className="border-b border-neutral-100">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-neutral-400" />
                          <span className="font-medium">{coupon.code}</span>
                        </div>
                        {coupon.description && (
                          <p className="text-xs text-neutral-500 mt-1">{coupon.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {coupon.type === 'percentage' ? (
                            <>
                              <Percent size={14} className="text-neutral-400" />
                              <span>%{coupon.discount}</span>
                            </>
                          ) : (
                            <span>{coupon.discount} ₺</span>
                          )}
                        </div>
                        {coupon.type === 'percentage' && coupon.maxDiscount > 0 && (
                          <p className="text-xs text-neutral-500">Max: {coupon.maxDiscount} ₺</p>
                        )}
                      </td>
                      <td className="p-4 text-sm">
                        {coupon.minAmount > 0 ? `${coupon.minAmount} ₺` : '-'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp size={14} className="text-neutral-400" />
                          <span>{coupon.usedCount} / {coupon.usageLimit}</span>
                        </div>
                        {isLimitReached && (
                          <span className="text-xs text-red-600">Limit doldu</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar size={14} className="text-neutral-400" />
                          <span>{new Date(coupon.validUntil).toLocaleDateString('tr-TR')}</span>
                        </div>
                        {isExpired && (
                          <span className="text-xs text-red-600">Süresi dolmuş</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleCouponStatus(coupon.id)}
                          className={`flex items-center gap-1 text-sm ${
                            coupon.isActive ? 'text-green-600' : 'text-neutral-400'
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <ToggleRight size={20} />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={20} />
                              <span>Pasif</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Kupon</p>
          <p className="text-2xl font-light">{coupons.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Aktif Kupon</p>
          <p className="text-2xl font-light">{coupons.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Kullanım</p>
          <p className="text-2xl font-light">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;

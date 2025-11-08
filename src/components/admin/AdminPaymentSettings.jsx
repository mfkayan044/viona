import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import { usePayment } from '../../contexts/PaymentContext';

export default function AdminPaymentSettings() {
  const { paymentMethods, updatePaymentMethod, togglePaymentMethod, loading } = usePayment();
  const [editingMethod, setEditingMethod] = useState(null);
  const [formData, setFormData] = useState({});

  const handleEdit = (method) => {
    setEditingMethod(method.id);
    setFormData({
      name: method.name,
      description: method.description || '',
      bank_name: method.bank_name || '',
      iban: method.iban || '',
      account_holder: method.account_holder || ''
    });
  };

  const handleCancel = () => {
    setEditingMethod(null);
    setFormData({});
  };

  const handleSave = async (methodId) => {
    try {
      await updatePaymentMethod(methodId, formData);
      setEditingMethod(null);
      setFormData({});
      alert('Ödeme yöntemi güncellendi!');
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  const handleToggle = async (methodId, currentStatus) => {
    try {
      await togglePaymentMethod(methodId, !currentStatus);
    } catch (error) {
      alert('Hata: ' + error.message);
    }
  };

  if (loading) {
    return <div className="p-6">Yükleniyor...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-light uppercase tracking-wider mb-2 flex items-center gap-2">
          <CreditCard size={24} />
          Ödeme Yöntemleri
        </h1>
        <p className="text-neutral-600 font-light">
          Müşterilere sunulan ödeme seçeneklerini yönetin
        </p>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="border border-neutral-200 p-6 bg-white"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-medium">{method.name}</h3>
                  <button
                    onClick={() => handleToggle(method.id, method.is_active)}
                    className={`px-3 py-1 text-sm font-light ${
                      method.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    {method.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </div>
                <p className="text-neutral-600 font-light text-sm mb-2">
                  Kod: <span className="font-mono">{method.code}</span>
                </p>
              </div>
              
              {editingMethod === method.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(method.id)}
                    className="px-4 py-2 bg-black text-white font-light hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Check size={16} />
                    Kaydet
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-neutral-300 font-light hover:bg-neutral-50 flex items-center gap-2"
                  >
                    <X size={16} />
                    İptal
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEdit(method)}
                  className="px-4 py-2 border border-neutral-300 font-light hover:bg-neutral-50"
                >
                  Düzenle
                </button>
              )}
            </div>

            {editingMethod === method.id ? (
              <div className="space-y-4 mt-4 pt-4 border-t border-neutral-200">
                <div>
                  <label className="block text-sm font-light mb-2">Yöntem Adı</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-neutral-300 px-4 py-2 font-light"
                  />
                </div>

                <div>
                  <label className="block text-sm font-light mb-2">Açıklama</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border border-neutral-300 px-4 py-2 font-light"
                    rows="2"
                  />
                </div>

                {method.code === 'bank-transfer' && (
                  <>
                    <div>
                      <label className="block text-sm font-light mb-2">Banka Adı</label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full border border-neutral-300 px-4 py-2 font-light"
                        placeholder="Örn: Ziraat Bankası"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light mb-2">IBAN</label>
                      <input
                        type="text"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        className="w-full border border-neutral-300 px-4 py-2 font-light font-mono"
                        placeholder="TR00 0000 0000 0000 0000 0000 00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-light mb-2">Hesap Sahibi</label>
                      <input
                        type="text"
                        value={formData.account_holder}
                        onChange={(e) => setFormData({ ...formData, account_holder: e.target.value })}
                        className="w-full border border-neutral-300 px-4 py-2 font-light"
                        placeholder="Örn: VIONA ÇANTA"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-neutral-600 font-light">{method.description}</p>
                
                {method.code === 'bank-transfer' && method.bank_name && (
                  <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200">
                    <p className="font-light mb-1">
                      <span className="font-medium">Banka:</span> {method.bank_name}
                    </p>
                    <p className="font-light mb-1">
                      <span className="font-medium">IBAN:</span>{' '}
                      <span className="font-mono">{method.iban}</span>
                    </p>
                    <p className="font-light">
                      <span className="font-medium">Hesap Sahibi:</span> {method.account_holder}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200">
        <p className="text-sm font-light text-amber-900">
          <strong>Not:</strong> Ödeme yöntemini pasif hale getirdiğinizde, müşteriler bu yöntemi seçemez.
          Aktif olan en az bir ödeme yöntemi bulundurmanız önerilir.
        </p>
      </div>
    </div>
  );
}

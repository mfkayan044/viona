import React, { useState } from 'react';
import { X, Lock, UserPlus, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const PostCheckoutRegisterModal = ({ isOpen, onClose, orderData }) => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: orderData.email,
        password,
        firstName: orderData.firstName,
        lastName: orderData.lastName,
        phone: orderData.phone
      });

      toast.success('✅ Üyeliğiniz oluşturuldu! Siparişlerinizi görebilirsiniz.');
      navigate(`/order-success/${orderData.orderId}`);
    } catch (error) {
      console.error('Kayıt hatası:', error);
      toast.error(error.message || 'Kayıt olurken bir hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg max-w-md w-full p-8 relative animate-fadeIn">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-light uppercase tracking-wider mb-2">
            Siparişiniz Alındı! 🎉
          </h2>
          <p className="text-gray-600 text-sm">
            Üye olarak siparişlerinizi takip edebilir, özel fırsatlardan yararlanabilirsiniz!
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 font-medium">Email</label>
            <input
              type="email"
              value={orderData.email}
              disabled
              className="input-field w-full bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">
              Şifre <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="En az 6 karakter"
                className="input-field w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 font-medium">
              Şifre Tekrar <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Şifreyi tekrar girin"
                className="input-field w-full pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded hover:bg-gray-900 transition uppercase tracking-wider font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserPlus size={18} />
              {loading ? 'Kaydediliyor...' : 'Üye Ol ve Devam Et'}
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded hover:bg-gray-50 transition uppercase tracking-wider text-sm"
            >
              Şimdi Değil, Siparişimi Görüntüle
            </button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-sm mb-2 text-blue-900">✨ Üye Avantajları</h4>
          <ul className="text-xs space-y-1 text-blue-800">
            <li>• Siparişlerinizi takip edin</li>
            <li>• Hızlı alışveriş yapın</li>
            <li>• Özel kampanyalardan haberdar olun</li>
            <li>• Favori ürünlerinizi kaydedin</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PostCheckoutRegisterModal;

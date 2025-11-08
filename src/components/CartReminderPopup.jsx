import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCartReminder } from '../contexts/CartReminderContext';
import { useApp } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const CartReminderPopup = () => {
  const { showReminder, reminderCart, dismissReminder } = useCartReminder();
  const { addToCart } = useApp();
  const navigate = useNavigate();

  if (!showReminder || reminderCart.length === 0) return null;

  const handleRestoreCart = () => {
    reminderCart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart(item);
      }
    });
    dismissReminder();
  };

  const handleViewCart = () => {
    handleRestoreCart();
    navigate('/checkout');
  };

  const totalItems = reminderCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = reminderCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-md w-full rounded-lg shadow-2xl p-6 relative animate-slide-up">
        <button
          onClick={dismissReminder}
          className="absolute top-4 right-4 p-1 hover:bg-neutral-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 p-3 rounded-full">
            <ShoppingBag className="text-amber-600" size={24} />
          </div>
          <div>
            <h3 className="font-medium text-lg">Sepetinizi Unuttunuz mu?</h3>
            <p className="text-sm text-neutral-600">Daha önce eklediğiniz ürünler hala sizi bekliyor!</p>
          </div>
        </div>

        <div className="bg-neutral-50 p-4 rounded-lg mb-4 max-h-48 overflow-y-auto">
          {reminderCart.map((item, index) => (
            <div key={index} className="flex items-center gap-3 mb-3 last:mb-0">
              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-neutral-600">{item.quantity} adet × {item.price.toLocaleString('tr-TR')} ₺</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-neutral-600">{totalItems} Ürün</span>
          <span className="font-semibold text-lg">{totalPrice.toLocaleString('tr-TR')} ₺</span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={dismissReminder}
            className="flex-1 btn-outline"
          >
            Hayır, Teşekkürler
          </button>
          <button
            onClick={handleViewCart}
            className="flex-1 btn-primary"
          >
            Sepete Git
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartReminderPopup;

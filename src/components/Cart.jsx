import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useCurrency } from '../contexts/CurrencyContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, showCart, setShowCart, removeFromCart, updateCartQuantity, getTotalPrice } = useApp();
  const { formatPrice } = useCurrency();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Sepetiniz boş!');
      return;
    }
    setShowCart(false);
    navigate('/checkout');
  };

  if (!showCart) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300" 
      onClick={() => setShowCart(false)}
    >
      <div
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl p-8 overflow-y-auto transform transition-transform duration-500 ease-out"
        style={{ animation: 'slideInRight 0.5s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200">
          <h2 className="text-xl font-light tracking-widest uppercase">Shopping Bag</h2>
          <button onClick={() => setShowCart(false)} className="hover:bg-neutral-100 p-2 transition">
            <X size={20} />
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" strokeWidth={1} />
            <p className="text-sm uppercase tracking-wider">Your bag is empty</p>
          </div>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 pb-6 border-b border-neutral-200">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-light uppercase tracking-wider text-sm">{item.name}</h3>
                    <p className="text-sm mt-2 font-light">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 border border-neutral-300 flex items-center justify-center hover:border-black transition text-sm"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 border border-neutral-300 flex items-center justify-center hover:border-black transition text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-neutral-400 hover:text-black transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between mb-6">
                <span className="text-sm uppercase tracking-widest">Total</span>
                <span className="text-xl font-light">
                  {formatPrice(getTotalPrice())}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-black text-white py-4 hover:bg-neutral-800 transition text-sm uppercase tracking-widest"
              >
                Ödeme Yap
              </button>
              <p className="text-xs text-center text-neutral-400 mt-3 uppercase tracking-wider">
                Güvenli Ödeme
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

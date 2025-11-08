import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useOrders } from '../contexts/OrderContext';
import { CheckCircle, Package, Truck, MapPin, CreditCard, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostCheckoutRegisterModal from '../components/PostCheckoutRegisterModal';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getOrder } = useOrders();
  
  // Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // UUID string olarak karşılaştır
  const rawOrder = getOrder(orderId);
  
  // Supabase formatını eski formata dönüştür (geriye uyumluluk)
  const order = rawOrder ? {
    ...rawOrder,
    customer: {
      firstName: rawOrder.customer_name?.split(' ')[0] || '',
      lastName: rawOrder.customer_name?.split(' ').slice(1).join(' ') || '',
      email: rawOrder.customer_email || '',
      phone: rawOrder.customer_phone || ''
    },
    shipping: rawOrder.shipping_address || {
      address: '',
      city: '',
      district: '',
      postalCode: ''
    },
    payment: {
      method: rawOrder.payment_method || 'credit-card'
    },
    subtotal: rawOrder.total || 0,
    shippingCost: 0,
    discount: 0
  } : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // URL'den modal parametrelerini kontrol et
    const showRegister = searchParams.get('showRegister');
    const email = searchParams.get('email');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const phone = searchParams.get('phone');
    
    if (showRegister === 'true' && email) {
      setOrderData({
        email: decodeURIComponent(email),
        firstName: decodeURIComponent(firstName || ''),
        lastName: decodeURIComponent(lastName || ''),
        phone: decodeURIComponent(phone || ''),
        orderId
      });
      setShowRegisterModal(true);
    }
  }, [searchParams, orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-light mb-4">Sipariş Bulunamadı</h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Ana Sayfaya Dön
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'Beklemede', color: 'text-yellow-600', bg: 'bg-yellow-50' },
      processing: { label: 'Hazırlanıyor', color: 'text-blue-600', bg: 'bg-blue-50' },
      shipped: { label: 'Kargoda', color: 'text-purple-600', bg: 'bg-purple-50' },
      delivered: { label: 'Teslim Edildi', color: 'text-green-600', bg: 'bg-green-50' },
      cancelled: { label: 'İptal Edildi', color: 'text-red-600', bg: 'bg-red-50' }
    };
    return statuses[status] || statuses.pending;
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="text-center mb-12 animate-fade-in">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
          <h1 className="text-4xl font-light mb-4 uppercase tracking-wider">
            Siparişiniz Alındı!
          </h1>
          <p className="text-neutral-600 text-lg mb-2">
            Teşekkür ederiz, {order.customer.firstName}!
          </p>
          <p className="text-neutral-500">
            Sipariş numaranız: <span className="font-medium">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Status */}
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-light uppercase tracking-wider">Sipariş Durumu</h2>
            <span className={`px-4 py-2 text-sm ${statusInfo.bg} ${statusInfo.color} rounded`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Progress Timeline */}
          <div className="flex items-center justify-between">
            {[
              { icon: Package, label: 'Alındı', status: 'pending' },
              { icon: Package, label: 'Hazırlanıyor', status: 'processing' },
              { icon: Truck, label: 'Kargoda', status: 'shipped' },
              { icon: CheckCircle, label: 'Teslim Edildi', status: 'delivered' }
            ].map((item, index) => {
              const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index;
              return (
                <React.Fragment key={item.status}>
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400'
                    }`}>
                      <item.icon size={20} />
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-black font-medium' : 'text-neutral-400'}`}>
                      {item.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isActive ? 'bg-black' : 'bg-neutral-200'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Customer Info */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-lg font-light mb-4 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={20} />
              Teslimat Bilgileri
            </h3>
            <div className="text-sm text-neutral-600 space-y-1">
              <p className="font-medium text-black">{order.customer.firstName} {order.customer.lastName}</p>
              <p>{order.shipping.address}</p>
              <p>{order.shipping.district}, {order.shipping.city} {order.shipping.postalCode}</p>
              <p className="pt-2">{order.customer.phone}</p>
              <p>{order.customer.email}</p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-neutral-200 p-6">
            <h3 className="text-lg font-light mb-4 uppercase tracking-wider flex items-center gap-2">
              <CreditCard size={20} />
              Ödeme Bilgileri
            </h3>
            <div className="text-sm text-neutral-600 space-y-2">
              <div className="flex justify-between">
                <span>Ödeme Yöntemi:</span>
                <span className="font-medium text-black">
                  {order.payment.method === 'credit-card' && 'Kredi Kartı'}
                  {order.payment.method === 'bank-transfer' && 'Banka Havalesi'}
                  {order.payment.method === 'cash-on-delivery' && 'Kapıda Ödeme'}
                </span>
              </div>
              <div className="flex justify-between pt-4 border-t border-neutral-200">
                <span>Ara Toplam:</span>
                <span>{order.subtotal.toLocaleString('tr-TR')} ₺</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo:</span>
                <span>{order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost} ₺`}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200 text-lg font-medium text-black">
                <span>Toplam:</span>
                <span>{order.total.toLocaleString('tr-TR')} ₺</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-light mb-4 uppercase tracking-wider">Sipariş Detayları</h3>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
                <div className="flex-1">
                  <h4 className="font-light">{item.name}</h4>
                  <p className="text-sm text-neutral-500">{item.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.price.toLocaleString('tr-TR')} ₺</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/')}
            className="btn-outline flex items-center justify-center gap-2"
          >
            Alışverişe Devam Et
            <ArrowRight size={18} />
          </button>
          <button 
            onClick={() => window.print()}
            className="btn-primary"
          >
            Siparişi Yazdır
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-6 rounded">
          <h4 className="font-medium mb-2">📧 E-posta Gönderildi</h4>
          <p className="text-sm text-neutral-600">
            Sipariş onay e-postası <strong>{order.customer.email}</strong> adresine gönderildi. 
            E-postanızı kontrol ederek sipariş detaylarını görebilirsiniz.
          </p>
        </div>
      </div>

      <Footer />
      
      {/* Post-checkout üyelik modalı */}
      {showRegisterModal && orderData && (
        <PostCheckoutRegisterModal
          isOpen={showRegisterModal}
          onClose={() => {
            setShowRegisterModal(false);
            // Query params temizle
            navigate(`/order-success/${orderId}`, { replace: true });
          }}
          orderData={orderData}
        />
      )}
    </div>
  );
};

export default OrderSuccessPage;

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../contexts/OrderContext';
import { Package, Truck, CheckCircle, XCircle, Eye } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { orders } = useOrders();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Loading state - user henüz yüklenmemişse
  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <p className="text-neutral-600">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Kullanıcının siparişlerini filtrele
  const myOrders = orders.filter(order => 
    order.customer_email === user.email || order.user_id === user.id
  );

  const getStatusInfo = (status) => {
    const statuses = {
      pending: { label: 'Beklemede', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Package },
      processing: { label: 'Hazırlanıyor', color: 'text-blue-600', bg: 'bg-blue-50', icon: Package },
      shipped: { label: 'Kargoda', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck },
      delivered: { label: 'Teslim Edildi', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle },
      cancelled: { label: 'İptal Edildi', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle }
    };
    return statuses[status] || statuses.pending;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-light uppercase tracking-wider mb-2">Siparişlerim</h1>
          <p className="text-neutral-600">Sipariş geçmişinizi görüntüleyin</p>
        </div>

        {myOrders.length === 0 ? (
          <div className="bg-white border border-neutral-200 p-12 text-center">
            <Package size={64} className="mx-auto text-neutral-300 mb-4" />
            <h3 className="text-xl font-light mb-2">Henüz siparişiniz yok</h3>
            <p className="text-neutral-500 mb-6">
              Alışverişe başlayın ve ilk siparişinizi verin!
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map(order => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;

              return (
                <div key={order.id} className="bg-white border border-neutral-200">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-200">
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-medium">
                            Sipariş #{order.orderNumber}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs ${statusInfo.bg} ${statusInfo.color} rounded`}>
                            <StatusIcon size={14} />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {new Date(order.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-light">
                          {order.total.toLocaleString('tr-TR')} ₺
                        </p>
                        <p className="text-sm text-neutral-500">
                          {order.items.length} ürün
                        </p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-light mb-1">{item.name}</h4>
                            <p className="text-sm text-neutral-500">
                              {item.price.toLocaleString('tr-TR')} ₺
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/order-success/${order.id}`)}
                        className="btn-outline flex items-center gap-2"
                      >
                        <Eye size={16} />
                        Detayları Gör
                      </button>
                      
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => navigate(`/product/${order.items[0]?.id}`)}
                          className="btn-primary"
                        >
                          Değerlendir
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-neutral-50 p-6 border-t border-neutral-200">
                    <div className="flex items-center justify-between">
                      {[
                        { status: 'pending', label: 'Alındı' },
                        { status: 'processing', label: 'Hazırlanıyor' },
                        { status: 'shipped', label: 'Kargoda' },
                        { status: 'delivered', label: 'Teslim Edildi' }
                      ].map((step, index) => {
                        const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                        const isActive = index <= currentIndex;
                        const isCancelled = order.status === 'cancelled';

                        return (
                          <React.Fragment key={step.status}>
                            <div className="flex flex-col items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all ${
                                isCancelled 
                                  ? 'bg-neutral-200 text-neutral-400' 
                                  : isActive 
                                    ? 'bg-black text-white' 
                                    : 'bg-neutral-200 text-neutral-400'
                              }`}>
                                {index + 1}
                              </div>
                              <span className={`text-xs mt-2 ${
                                isCancelled 
                                  ? 'text-neutral-400' 
                                  : isActive 
                                    ? 'text-black font-medium' 
                                    : 'text-neutral-400'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                            {index < 3 && (
                              <div className={`flex-1 h-0.5 mx-2 mb-6 ${
                                isCancelled 
                                  ? 'bg-neutral-200' 
                                  : isActive && index < currentIndex 
                                    ? 'bg-black' 
                                    : 'bg-neutral-200'
                              }`}></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {order.status === 'cancelled' && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-center">
                        <p className="text-sm text-red-600 font-medium">
                          Bu sipariş iptal edildi
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyOrdersPage;

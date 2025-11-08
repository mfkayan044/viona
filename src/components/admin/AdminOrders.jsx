import React, { useState } from 'react';
import { useOrders } from '../../contexts/OrderContext';
import { sendOrderStatusEmail } from '../../services/emailService';
import { Package, Eye, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const AdminOrders = () => {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Supabase formatını eski formata dönüştür
  const formattedOrders = orders.map(order => ({
    ...order,
    customer: {
      firstName: order.customer_name?.split(' ')[0] || '',
      lastName: order.customer_name?.split(' ').slice(1).join(' ') || '',
      email: order.customer_email || '',
      phone: order.customer_phone || ''
    },
    shipping: order.shipping_address || {
      address: '',
      city: '',
      district: '',
      postalCode: ''
    },
    payment: {
      method: order.payment_method || 'credit-card'
    },
    subtotal: order.total || 0,
    discount: 0,
    shippingCost: 0,
    coupon: null
  }));

  const filteredOrders = filterStatus === 'all' 
    ? formattedOrders 
    : formattedOrders.filter(order => order.status === filterStatus);

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

  const handleStatusChange = async (orderId, newStatus) => {
    if (window.confirm(`Sipariş durumunu "${getStatusInfo(newStatus).label}" olarak değiştirmek istediğinize emin misiniz?`)) {
      updateOrderStatus(orderId, newStatus);
      
      // Durum güncelleme maili gönder (Production'da aktif olacak)
      // const order = orders.find(o => o.id === orderId);
      // if (order) {
      //   try {
      //     await sendOrderStatusEmail({
      //       customerEmail: order.customer_email,
      //       customerName: order.customer_name,
      //       orderId: order.id,
      //       status: newStatus,
      //       trackingNumber: order.tracking_number || null
      //     });
      //     console.log('✅ Durum güncelleme maili gönderildi');
      //   } catch (emailError) {
      //     console.warn('Mail gönderme hatası:', emailError);
      //   }
      // }
    }
  };

  const handleDeleteOrder = (orderId) => {
    if (window.confirm('Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz!')) {
      deleteOrder(orderId);
    }
  };

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-light uppercase tracking-wider">Siparişler</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-500">Filtrele:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="all">Tümü ({orders.length})</option>
            <option value="pending">Beklemede ({orders.filter(o => o.status === 'pending').length})</option>
            <option value="processing">Hazırlanıyor ({orders.filter(o => o.status === 'processing').length})</option>
            <option value="shipped">Kargoda ({orders.filter(o => o.status === 'shipped').length})</option>
            <option value="delivered">Teslim Edildi ({orders.filter(o => o.status === 'delivered').length})</option>
            <option value="cancelled">İptal Edildi ({orders.filter(o => o.status === 'cancelled').length})</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-neutral-200 p-12 text-center">
          <Package size={48} className="mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">Henüz sipariş yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <div key={order.id} className="bg-white border border-neutral-200">
                {/* Order Header */}
                <div className="p-6 flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Sipariş No</p>
                      <p className="font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Müşteri</p>
                      <p className="font-light">{order.customer.firstName} {order.customer.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Tarih</p>
                      <p className="font-light text-sm">
                        {new Date(order.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Tutar</p>
                      <p className="font-medium">{order.total.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 mb-1">Durum</p>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs ${statusInfo.bg} ${statusInfo.color} rounded`}>
                        <StatusIcon size={14} />
                        {statusInfo.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      className="p-2 hover:bg-red-50 text-red-600 transition rounded"
                      title="Siparişi Sil"
                    >
                      <Trash2 size={20} />
                    </button>
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="p-2 hover:bg-neutral-100 transition"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-neutral-200 p-6 bg-neutral-50">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {/* Customer Info */}
                      <div>
                        <h3 className="font-medium mb-3 uppercase text-sm tracking-wider">Müşteri Bilgileri</h3>
                        <div className="text-sm space-y-1 text-neutral-600">
                          <p>{order.customer.firstName} {order.customer.lastName}</p>
                          <p>{order.customer.email}</p>
                          <p>{order.customer.phone}</p>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div>
                        <h3 className="font-medium mb-3 uppercase text-sm tracking-wider">Teslimat Adresi</h3>
                        <div className="text-sm space-y-1 text-neutral-600">
                          <p>{order.shipping.address}</p>
                          <p>{order.shipping.district}, {order.shipping.city} {order.shipping.postalCode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 uppercase text-sm tracking-wider">Ürünler</h3>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 bg-white p-3 border border-neutral-200">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                            <div className="flex-1">
                              <p className="font-light">{item.name}</p>
                              <p className="text-xs text-neutral-500">{item.description}</p>
                            </div>
                            <p className="font-medium">{item.price.toLocaleString('tr-TR')} ₺</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6 bg-white p-4 border border-neutral-200">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Ara Toplam:</span>
                          <span>{order.subtotal.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>İndirim {order.coupon && `(${order.coupon.code})`}:</span>
                            <span>-{order.discount.toLocaleString('tr-TR')} ₺</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-neutral-600">Kargo:</span>
                          <span>{order.shippingCost === 0 ? 'Ücretsiz' : `${order.shippingCost} ₺`}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-neutral-200 font-medium text-base">
                          <span>Toplam:</span>
                          <span>{order.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-neutral-200">
                          <span className="text-neutral-600">Ödeme Yöntemi:</span>
                          <span>
                            {order.payment.method === 'credit-card' && 'Kredi Kartı'}
                            {order.payment.method === 'bank-transfer' && 'Banka Havalesi'}
                            {order.payment.method === 'cash-on-delivery' && 'Kapıda Ödeme'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Actions */}
                    <div>
                      <h3 className="font-medium mb-3 uppercase text-sm tracking-wider">Sipariş Durumunu Güncelle</h3>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => handleStatusChange(order.id, 'pending')}
                          disabled={order.status === 'pending'}
                          className="px-4 py-2 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Beklemede
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'processing')}
                          disabled={order.status === 'processing'}
                          className="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Hazırlanıyor
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'shipped')}
                          disabled={order.status === 'shipped'}
                          className="px-4 py-2 text-sm bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Kargoya Verildi
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'delivered')}
                          disabled={order.status === 'delivered'}
                          className="px-4 py-2 text-sm bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          Teslim Edildi
                        </button>
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          disabled={order.status === 'cancelled'}
                          className="px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                          İptal Et
                        </button>
                      </div>
                    </div>

                    {/* Order Notes */}
                    {order.notes && (
                      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
                        <h3 className="font-medium mb-2 uppercase text-sm tracking-wider">Sipariş Notu</h3>
                        <p className="text-sm text-neutral-600">{order.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

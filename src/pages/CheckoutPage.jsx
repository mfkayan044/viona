import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useOrders } from '../contexts/OrderContext';
import { useToast } from '../contexts/ToastContext';
import { useCoupon } from '../contexts/CouponContext';
import { usePayment } from '../contexts/PaymentContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { sendOrderConfirmationEmail } from '../services/emailService';
import { ShoppingBag, CreditCard, Truck, MapPin, User, Phone, Mail, ChevronRight, X, Tag, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useApp();
  const { createOrder } = useOrders();
  const toast = useToast();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateDiscount, useCouponCode } = useCoupon();
  const { getActivePaymentMethods, getPaymentMethodByCode, loading: paymentLoading } = usePayment();
  const { user, isAuthenticated } = useAuth();

  const activePaymentMethods = getActivePaymentMethods();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [step, setStep] = useState(1); // 1: Bilgiler, 2: Teslimat, 3: Ödeme, 4: Onay
  const [couponCode, setCouponCode] = useState('');

  const [formData, setFormData] = useState({
    // Müşteri Bilgileri
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Teslimat Adresi
    address: '',
    city: '',
    district: '',
    postalCode: '',
    
    // Ödeme
    paymentMethod: '',
    
    // Notlar
    orderNotes: ''
  });

  // ✅ Kullanıcı giriş yaptıysa bilgileri otomatik doldur
  useEffect(() => {
    if (user && isAuthenticated) {
      const nameParts = user.name?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // En son adres varsa onu kullan
      const lastAddress = user.addresses && user.addresses.length > 0 
        ? user.addresses[0] 
        : null;

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || '',
        phone: user.phone || '',
        // Adres bilgileri varsa doldur
        address: lastAddress?.address || '',
        city: lastAddress?.city || '',
        district: lastAddress?.district || '',
        postalCode: lastAddress?.postalCode || ''
      }));
    }
  }, [user, isAuthenticated]);

  // İlk aktif ödeme yöntemini otomatik seç
  useEffect(() => {
    if (!paymentLoading && activePaymentMethods.length > 0 && !formData.paymentMethod) {
      setFormData(prev => ({
        ...prev,
        paymentMethod: activePaymentMethods[0].code
      }));
    }
  }, [paymentLoading, activePaymentMethods, formData.paymentMethod]);

  const [errors, setErrors] = useState({});

  // Sepet toplamı (quantity dahil)
  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const discount = calculateDiscount(subtotal);
  const shippingCost = subtotal > 500 ? 0 : 50;
  const total = subtotal - discount + shippingCost;

  // Form değişiklikleri
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validasyon
  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Ad gerekli';
      if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gerekli';
      if (!formData.email.trim()) newErrors.email = 'E-posta gerekli';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Geçerli bir e-posta girin';
      if (!formData.phone.trim()) newErrors.phone = 'Telefon gerekli';
      else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) newErrors.phone = 'Geçerli bir telefon numarası girin';
    }

    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = 'Adres gerekli';
      if (!formData.city.trim()) newErrors.city = 'Şehir gerekli';
      if (!formData.district.trim()) newErrors.district = 'İlçe gerekli';
      if (!formData.postalCode.trim()) newErrors.postalCode = 'Posta kodu gerekli';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // İleri git
  const handleNext = () => {
    if (validateStep(step)) {
      // Step 3'te ödeme yöntemi kontrolü
      if (step === 3 && activePaymentMethods.length === 0) {
        toast.error('Aktif ödeme yöntemi bulunmamaktadır');
        return;
      }
      if (step === 3 && !formData.paymentMethod) {
        toast.error('Lütfen bir ödeme yöntemi seçin');
        return;
      }
      setStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  // Geri git
  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Sipariş tamamla
  const handleCompleteOrder = async () => {
    if (!validateStep(2)) {
      toast.error('Lütfen tüm bilgileri doldurun');
      return;
    }

    try {
      const order = await createOrder({
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          district: formData.district,
          postalCode: formData.postalCode
        },
        paymentMethod: formData.paymentMethod,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        total,
        notes: formData.orderNotes
      });

      // ✅ Kupon kullanımını kaydet
      if (appliedCoupon) {
        try {
          const { error } = await supabase
            .from('coupon_usage')
            .insert({
              coupon_code: appliedCoupon.code,
              user_email: formData.email.toLowerCase(),
              order_id: order.id,
              discount_amount: discount
            });

          if (error) {
            console.error('Kupon kullanımı kaydedilemedi:', error);
          } else {
            console.log('✅ Kupon kullanımı kaydedildi');
            useCouponCode(appliedCoupon.id);
          }
        } catch (error) {
          console.error('Kupon kayıt hatası:', error);
        }
      }

      // Sipariş onay maili gönder (Production'da aktif olacak)
      // try {
      //   await sendOrderConfirmationEmail({
      //     customerEmail: formData.email,
      //     customerName: `${formData.firstName} ${formData.lastName}`,
      //     orderId: order.id,
      //     items: cart.map(item => ({
      //       name: item.name,
      //       price: item.price,
      //       quantity: item.quantity || 1
      //     })),
      //     total,
      //     shippingAddress: `${formData.address}, ${formData.district}/${formData.city} - ${formData.postalCode}`
      //   });
      //   console.log('✅ Sipariş onay maili gönderildi');
      // } catch (emailError) {
      //   console.warn('Mail gönderme hatası:', emailError);
      // }

      clearCart();
      removeCoupon();
      toast.success('🎉 Siparişiniz alındı!');
      
      // Üye değilse kayıt modalı ile birlikte order-success'e yönlendir
      if (!isAuthenticated) {
        // Query params ile modal tetikle
        navigate(`/order-success/${order.id}?showRegister=true&email=${encodeURIComponent(formData.email)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&phone=${encodeURIComponent(formData.phone)}`);
      } else {
        navigate(`/order-success/${order.id}`);
      }
    } catch (error) {
      console.error('Sipariş hatası:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu!');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <ShoppingBag size={64} className="mx-auto text-neutral-300 mb-6" />
          <h2 className="text-2xl font-light mb-4">Sepetiniz Boş</h2>
          <p className="text-neutral-600 mb-8">Sipariş verebilmek için sepetinize ürün ekleyin.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Alışverişe Başla
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[
              { num: 1, icon: User, label: 'Bilgiler' },
              { num: 2, icon: MapPin, label: 'Teslimat' },
              { num: 3, icon: CreditCard, label: 'Ödeme' },
              { num: 4, icon: ShoppingBag, label: 'Onay' }
            ].map(({ num, icon: Icon, label }, index) => (
              <React.Fragment key={num}>
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    step >= num ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-xs mt-2 ${step >= num ? 'text-black font-medium' : 'text-neutral-400'}`}>
                    {label}
                  </span>
                </div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mb-6 ${step > num ? 'bg-black' : 'bg-neutral-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 p-8">
              {/* Step 1: Müşteri Bilgileri */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
                    <User size={24} />
                    Müşteri Bilgileri
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-2">Ad *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`input-field w-full ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="Adınız"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Soyad *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`input-field w-full ${errors.lastName ? 'border-red-500' : ''}`}
                        placeholder="Soyadınız"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm mb-2">E-posta *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={isAuthenticated} // Giriş yapmışsa değiştiremesin
                        className={`input-field w-full ${errors.email ? 'border-red-500' : ''} ${isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="ornek@email.com"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      {isAuthenticated && (
                        <p className="text-xs text-gray-500 mt-1">✓ Giriş yapılmış hesap</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Telefon *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field w-full ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="5XX XXX XX XX"
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Teslimat Adresi */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={24} />
                    Teslimat Adresi
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Adres *</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`input-field w-full ${errors.address ? 'border-red-500' : ''}`}
                        rows="3"
                        placeholder="Mahalle, sokak, kapı no, daire no"
                      />
                      {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm mb-2">Şehir *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className={`input-field w-full ${errors.city ? 'border-red-500' : ''}`}
                          placeholder="İstanbul"
                        />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm mb-2">İlçe *</label>
                        <input
                          type="text"
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          className={`input-field w-full ${errors.district ? 'border-red-500' : ''}`}
                          placeholder="Kadıköy"
                        />
                        {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                      </div>
                      <div>
                        <label className="block text-sm mb-2">Posta Kodu *</label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleChange}
                          className={`input-field w-full ${errors.postalCode ? 'border-red-500' : ''}`}
                          placeholder="34XXX"
                        />
                        {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Ödeme Yöntemi */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard size={24} />
                    Ödeme Yöntemi
                  </h2>
                  
                  {paymentLoading ? (
                    <div className="p-8 text-center text-neutral-600 font-light">
                      Ödeme yöntemleri yükleniyor...
                    </div>
                  ) : activePaymentMethods.length === 0 ? (
                    <div className="p-8 border-2 border-amber-200 bg-amber-50 text-center">
                      <p className="text-amber-900 font-light">
                        Şu anda aktif ödeme yöntemi bulunmamaktadır. Lütfen daha sonra tekrar deneyin.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activePaymentMethods.map((method) => (
                        <label
                        key={method.code}
                        className={`block border-2 p-4 cursor-pointer transition-all ${
                          formData.paymentMethod === method.code ? 'border-black bg-neutral-50' : 'border-neutral-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.code}
                          checked={formData.paymentMethod === method.code}
                          onChange={handleChange}
                          className="mr-3"
                        />
                        <div>
                          <span className="font-light">{method.name}</span>
                          {method.description && (
                            <p className="text-sm text-neutral-600 mt-1 ml-6 font-light">
                              {method.description}
                            </p>
                          )}
                          {method.code === 'bank-transfer' && method.bank_name && formData.paymentMethod === method.code && (
                            <div className="ml-6 mt-3 p-3 bg-white border border-neutral-300">
                              <p className="text-sm font-light mb-1">
                                <strong>Banka:</strong> {method.bank_name}
                              </p>
                              <p className="text-sm font-light mb-1">
                                <strong>IBAN:</strong> <span className="font-mono">{method.iban}</span>
                              </p>
                              <p className="text-sm font-light">
                                <strong>Hesap Sahibi:</strong> {method.account_holder}
                              </p>
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                    </div>
                  )}
                  <div className="mt-6">
                    <label className="block text-sm mb-2">Sipariş Notları (Opsiyonel)</label>
                    <textarea
                      name="orderNotes"
                      value={formData.orderNotes}
                      onChange={handleChange}
                      className="input-field w-full"
                      rows="3"
                      placeholder="Özel notlarınız..."
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Onay */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-light mb-6 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag size={24} />
                    Sipariş Özeti
                  </h2>
                  <div className="space-y-6">
                    {/* Müşteri Bilgileri */}
                    <div className="border-b border-neutral-200 pb-4">
                      <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
                      <p className="text-sm text-neutral-600">
                        {formData.firstName} {formData.lastName}<br />
                        {formData.email}<br />
                        {formData.phone}
                      </p>
                    </div>

                    {/* Teslimat Adresi */}
                    <div className="border-b border-neutral-200 pb-4">
                      <h3 className="font-medium mb-2">Teslimat Adresi</h3>
                      <p className="text-sm text-neutral-600">
                        {formData.address}<br />
                        {formData.district}, {formData.city} {formData.postalCode}
                      </p>
                    </div>

                    {/* Ödeme Yöntemi */}
                    <div className="border-b border-neutral-200 pb-4">
                      <h3 className="font-medium mb-2">Ödeme Yöntemi</h3>
                      <p className="text-sm text-neutral-600">
                        {getPaymentMethodByCode(formData.paymentMethod)?.name || formData.paymentMethod}
                      </p>
                      {formData.paymentMethod === 'bank-transfer' && (
                        <div className="mt-2 p-3 bg-neutral-50 text-sm">
                          {(() => {
                            const method = getPaymentMethodByCode('bank-transfer');
                            return method ? (
                              <>
                                <p className="font-light mb-1">
                                  <strong>Banka:</strong> {method.bank_name}
                                </p>
                                <p className="font-light mb-1">
                                  <strong>IBAN:</strong> <span className="font-mono">{method.iban}</span>
                                </p>
                                <p className="font-light">
                                  <strong>Hesap Sahibi:</strong> {method.account_holder}
                                </p>
                              </>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Ürünler */}
                    <div>
                      <h3 className="font-medium mb-2">Ürünler ({cart.length})</h3>
                      <div className="space-y-2">
                        {cart.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-neutral-600">{item.name}</span>
                            <span className="font-light">{item.price.toLocaleString('tr-TR')} ₺</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-8 border-t border-neutral-200">
                {step > 1 ? (
                  <button onClick={handleBack} className="btn-outline">
                    Geri
                  </button>
                ) : <div></div>}
                
                {step < 4 ? (
                  <button 
                    onClick={handleNext} 
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={step === 3 && (paymentLoading || activePaymentMethods.length === 0 || !formData.paymentMethod)}
                  >
                    İleri
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button onClick={handleCompleteOrder} className="btn-primary">
                    Siparişi Tamamla
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 p-6 sticky top-4">
              <h3 className="text-xl font-light mb-6 uppercase tracking-wider">Sipariş Özeti</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-light">{item.name}</p>
                      <p className="text-xs text-neutral-500">Adet: {item.quantity || 1}</p>
                      <p className="text-sm text-neutral-600">
                        {item.price.toLocaleString('tr-TR')} ₺ x {item.quantity || 1} = {((item.price * (item.quantity || 1)).toLocaleString('tr-TR'))} ₺
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-neutral-200 pt-4 mb-4">
                {!appliedCoupon ? (
                  <div>
                    <label className="block text-sm font-light mb-2">İndirim Kuponu</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="input-field flex-1 text-sm"
                        placeholder="Kupon kodunu girin"
                      />
                      <button
                        onClick={async () => {
                          // Email kontrolü
                          if (!formData.email || !formData.email.trim()) {
                            toast.error('Kupon kullanmak için önce email adresinizi girin');
                            return;
                          }
                          
                          const result = await applyCoupon(couponCode, subtotal, formData.email);
                          if (result.success) {
                            toast.success(result.message);
                            setCouponCode('');
                          } else {
                            toast.error(result.message);
                          }
                        }}
                        className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800 transition-colors"
                      >
                        Uygula
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-green-600" />
                        <span className="text-sm font-medium text-green-800">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={() => {
                          removeCoupon();
                          toast.info('Kupon kaldırıldı');
                        }}
                        className="text-green-800 hover:text-green-900"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-green-700">{appliedCoupon.description}</p>
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-neutral-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Ara Toplam</span>
                  <span className="font-light">{subtotal.toLocaleString('tr-TR')} ₺</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span className="font-light">-{discount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Kargo</span>
                  <span className={`font-light ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'Ücretsiz' : `${shippingCost} ₺`}
                  </span>
                </div>
                {subtotal < 500 && (
                  <p className="text-xs text-neutral-500">
                    500 ₺ üzeri alışverişlerde kargo ücretsiz!
                  </p>
                )}
                <div className="flex justify-between text-lg font-medium pt-4 border-t border-neutral-200">
                  <span>Toplam</span>
                  <span>{total.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-2 text-xs text-neutral-600">
                  <Truck size={16} className="mt-0.5 flex-shrink-0" />
                  <span>2-5 iş günü içinde teslimat</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-neutral-600">
                  <ShoppingBag size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Güvenli ödeme</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;

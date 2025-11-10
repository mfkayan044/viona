import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContact } from '../contexts/ContactContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const ContactPage = () => {
  const navigate = useNavigate();
  const { addMessage } = useContact();
  const toast = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'İsim gerekli';
    if (!formData.email.trim()) newErrors.email = 'E-posta gerekli';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Geçerli bir e-posta girin';
    if (!formData.message.trim()) newErrors.message = 'Mesaj gerekli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    addMessage(formData);
    toast.success('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO pageKey="contact" />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wider mb-4">
            İletişim
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Sorularınız, önerileriniz veya siparişlerinizle ilgili her konuda bize ulaşabilirsiniz
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-100">
                  <Mail size={24} className="text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-light text-lg mb-2">E-posta</h3>
                  <p className="text-neutral-600 text-sm">info@viona.com</p>
                  <p className="text-neutral-600 text-sm">destek@viona.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-100">
                  <Phone size={24} className="text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-light text-lg mb-2">Telefon</h3>
                  <p className="text-neutral-600 text-sm">0850 XXX XX XX</p>
                  <p className="text-neutral-600 text-sm text-xs mt-1">Pazartesi - Cuma: 09:00 - 18:00</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-neutral-100">
                  <MapPin size={24} className="text-neutral-700" />
                </div>
                <div>
                  <h3 className="font-light text-lg mb-2">Adres</h3>
                  <p className="text-neutral-600 text-sm">
                    Nişantaşı Mah. Moda Cad.<br />
                    No: 123 Şişli / İstanbul
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 text-white p-6">
              <h3 className="font-light text-lg mb-3">Çalışma Saatleri</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Pazartesi - Cuma</span>
                  <span>09:00 - 18:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Cumartesi</span>
                  <span>10:00 - 17:00</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Pazar</span>
                  <span>Kapalı</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200 p-8">
              <h2 className="text-2xl font-light uppercase tracking-wider mb-6">
                Bize Mesaj Gönderin
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Adınız Soyadınız *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="İsminiz"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm mb-2">E-posta *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="ornek@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Telefon</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field w-full"
                      placeholder="5XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Konu</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="input-field w-full"
                    >
                      <option value="">Konu Seçin</option>
                      <option value="Genel Soru">Genel Soru</option>
                      <option value="Sipariş">Sipariş</option>
                      <option value="Ürün">Ürün Hakkında</option>
                      <option value="İade/Değişim">İade/Değişim</option>
                      <option value="Öneri">Öneri</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm mb-2">Mesajınız *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className={`input-field w-full ${errors.message ? 'border-red-500' : ''}`}
                    rows="6"
                    placeholder="Mesajınızı buraya yazın..."
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full md:w-auto btn-primary flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  <span>Gönder</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;

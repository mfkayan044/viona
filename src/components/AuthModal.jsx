import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const { login, register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-posta gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta girin';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalı';
    }

    if (!isLogin) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Ad gerekli';
      if (!formData.lastName.trim()) newErrors.lastName = 'Soyad gerekli';
      if (!formData.phone.trim()) {
        newErrors.phone = 'Telefon gerekli';
      } else if (!/^[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Geçerli bir telefon numarası girin';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Hoş geldiniz! 👋');
      } else {
        await register(formData);
        toast.success('Hesabınız oluşturuldu! 🎉');
      }
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setErrors({});
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-lg shadow-2xl animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-neutral-100 rounded-full transition"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="p-8 pb-0">
          <h2 className="text-3xl font-light uppercase tracking-wider mb-2">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h2>
          <p className="text-neutral-500 text-sm">
            {isLogin 
              ? 'Hesabınıza giriş yapın' 
              : 'Yeni bir hesap oluşturun'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Ad *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`input-field w-full pl-10 ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="Adınız"
                    />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm mb-2">Soyad *</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`input-field w-full pl-10 ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Soyadınız"
                    />
                  </div>
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2">Telefon *</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`input-field w-full pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    placeholder="5XX XXX XX XX"
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </>
          )}

          <div>
            <label className="block text-sm mb-2">E-posta *</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input-field w-full pl-10 ${errors.email ? 'border-red-500' : ''}`}
                placeholder="ornek@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-2">Şifre *</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field w-full pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-6">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </button>
        </form>

        {/* Switch Mode */}
        <div className="px-8 pb-8 text-center text-sm">
          <p className="text-neutral-600">
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            {' '}
            <button
              type="button"
              onClick={switchMode}
              className="text-black font-medium hover:underline"
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { userService } from '../services/supabase.service';
import { emailService } from '../services/email.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // ✅ Supabase Auth session kontrolü
  useEffect(() => {
    // Mevcut session'ı kontrol et
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Auth state değişikliklerini dinle
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Yeni kayıt sonrası profil DB'ye yazılana kadar kısa gecikme
        if (_event === 'SIGNED_IN') {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Kullanıcı profilini yükle
  const loadUserProfile = async (userId) => {
    try {
      const profile = await userService.getById(userId);
      setUser(profile);
    } catch (error) {
      console.error('❌ Profile load error:', error);
    }
  };

  // ✅ Kayıt ol (Supabase Auth + users tablosu)
  const register = async (userData) => {
    try {
      const { email, password, firstName, lastName, phone } = userData;

      // 1. Supabase Auth'da kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (authError) {
        console.error('❌ Auth kayıt hatası:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Kullanıcı oluşturulamadı!');
      }

      console.log('✅ Auth user oluşturuldu:', authData.user.id);

      // 2. users tablosuna profil ekle (ID manuel olarak set ediyoruz)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id, // Auth user ID'si ile aynı
          name: `${firstName} ${lastName}`,
          email,
          phone: phone || null,
          role: 'customer',
          status: 'active'
        }])
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profil oluşturma hatası:', profileError);
        throw new Error('Profil oluşturulamadı: ' + profileError.message);
      }

      // 3. Aynı email ile yapılmış siparişleri kullanıcıya bağla
      try {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ user_id: userProfile.id })
          .eq('customer_email', email)
          .is('user_id', null);

        if (updateError) {
          console.warn('Önceki siparişler bağlanamadı:', updateError);
        } else {
          console.log('✅ Önceki siparişler kullanıcıya bağlandı');
        }
      } catch (linkError) {
        console.warn('Sipariş bağlama hatası:', linkError);
        // Sipariş bağlama hatası kayıt işlemini engellemez
      }

      setUser(userProfile);
      
      // 4. Hoşgeldin maili gönder
      try {
        await emailService.sendWelcomeEmail({
          email,
          full_name: `${firstName} ${lastName}`
        });
        console.log('✅ Hoşgeldin maili gönderildi');
      } catch (emailError) {
        console.warn('Hoşgeldin maili gönderilemedi:', emailError);
        // Email hatası kayıt işlemini engellemez
      }
      // } catch (emailError) {
      //   console.warn('Mail gönderme hatası (kayıt devam etti):', emailError);
      // }
      
      return userProfile;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw new Error(error.message || 'Kayıt olurken bir hata oluştu!');
    }
  };

  // Giriş yap
  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login hatası:', error);
        throw error;
      }

      // Kullanıcı profilini yükle
      await loadUserProfile(data.user.id);
      
      return user;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw new Error('E-posta veya şifre hatalı!');
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  // Profil güncelle
  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const updatedUser = await userService.update(user.id, updates);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  };

  // Şifre değiştir
  const changePassword = async (newPassword) => {
    if (!user) throw new Error('Giriş yapmalısınız!');

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      throw new Error('Şifre değiştirirken bir hata oluştu!');
    }
  };

  // Adres ekle
  const addAddress = async (address) => {
    if (!user) return;

    try {
      const newAddress = {
        id: Date.now(),
        ...address
      };

      const updatedAddresses = [...(user.addresses || []), newAddress];
      await updateProfile({ addresses: updatedAddresses });
    } catch (error) {
      console.error('Adres ekleme hatası:', error);
      throw error;
    }
  };

  // Adres sil
  const removeAddress = async (addressId) => {
    if (!user) return;

    try {
      const updatedAddresses = (user.addresses || []).filter(addr => addr.id !== addressId);
      await updateProfile({ addresses: updatedAddresses });
    } catch (error) {
      console.error('Adres silme hatası:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!session, // ✅ Session varsa authenticated
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    addAddress,
    removeAddress
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

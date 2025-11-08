import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { siteSettings } = useApp();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      
      // Login başarılı, user profili yüklendi
      // Kısa bir gecikme ile user state'inin güncellenmesini bekle
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // User'ı kontrol et (AuthContext'ten gelecek)
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Users tablosundan profil bilgisini al
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      
      // Check if user has admin role
      if (userProfile?.role !== 'admin') {
        setError('Bu hesap admin yetkisine sahip değil.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Success - navigate to admin dashboard
      navigate('/admin/products');
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Giriş başarısız. E-posta ve şifrenizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10">
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">{siteSettings.logo}</span>
          <h2 className="text-3xl font-light mb-2 tracking-widest uppercase">Admin</h2>
          <p className="text-neutral-600 text-sm uppercase tracking-wider">Management Portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-light mb-2 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-light mb-2 uppercase tracking-widest">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="input-field"
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Giriş yapılıyor...' : 'Sign In'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full btn-outline"
            disabled={loading}
          >
            Back to Site
          </button>
        </form>
        
        <div className="mt-8 p-4 bg-neutral-50 border border-neutral-200">
          <p className="text-xs text-neutral-600 text-center uppercase tracking-wider">
            Admin hesabı oluşturmak için önce normal kayıt olun, sonra veritabanında role='admin' olarak ayarlayın.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

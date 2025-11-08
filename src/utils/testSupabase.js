import { supabase } from '../lib/supabase';

// Supabase bağlantısını test et
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count');
    
    if (error) {
      console.error('❌ Supabase bağlantı hatası:', error);
      return false;
    }
    
    console.log('✅ Supabase bağlantısı başarılı!');
    return true;
  } catch (err) {
    console.error('❌ Supabase bağlantı hatası:', err);
    return false;
  }
}

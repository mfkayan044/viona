import { supabase } from '../lib/supabase';

const PRODUCT_BUCKET = 'product-images';
const HERO_BUCKET = 'hero-images';

export const storageService = {
  /**
   * Fotoğraf yükle
   * @param {File} file - Yüklenecek dosya
   * @param {string} folder - Klasör adı (opsiyonel)
   * @param {string} bucketName - Bucket adı (varsayılan: product-images)
   * @returns {Promise<string>} - Yüklenen dosyanın public URL'i
   */
  async uploadImage(file, folder = 'products', bucketName = PRODUCT_BUCKET) {
    try {
      // Dosya adını benzersiz yap
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Supabase Storage'a yükle
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      // Public URL'i al
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('❌ Fotoğraf yüklenirken hata:', error);
      throw error;
    }
  },

  /**
   * Fotoğraf sil
   * @param {string} url - Silinecek fotoğrafın URL'i
   * @param {string} bucketName - Bucket adı (varsayılan: product-images)
   */
  async deleteImage(url, bucketName = PRODUCT_BUCKET) {
    try {
      // URL'den dosya yolunu çıkar
      const urlParts = url.split(`/${bucketName}/`);
      if (urlParts.length < 2) {
        console.warn('Geçersiz URL formatı:', url);
        return;
      }

      const filePath = urlParts[1].split('?')[0]; // Query parametrelerini temizle

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        throw error;
      }

      console.log('✅ Fotoğraf silindi:', filePath);
    } catch (error) {
      console.error('❌ Fotoğraf silinirken hata:', error);
      // Silme hatası kritik değil, devam et
    }
  },

  /**
   * Birden fazla fotoğraf yükle
   * @param {File[]} files - Yüklenecek dosyalar
   * @param {string} folder - Klasör adı
   * @param {string} bucketName - Bucket adı (varsayılan: product-images)
   * @returns {Promise<string[]>} - Yüklenen dosyaların URL'leri
   */
  async uploadMultipleImages(files, folder = 'products', bucketName = PRODUCT_BUCKET) {
    try {
      const uploadPromises = files.map(file => this.uploadImage(file, folder, bucketName));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('❌ Çoklu fotoğraf yükleme hatası:', error);
      throw error;
    }
  },

  /**
   * Hero görsel yükle
   * @param {File} file - Yüklenecek dosya
   * @returns {Promise<string>} - Yüklenen dosyanın public URL'i
   */
  async uploadHeroImage(file) {
    return this.uploadImage(file, 'hero', HERO_BUCKET);
  },

  /**
   * Hero görsel sil
   * @param {string} url - Silinecek fotoğrafın URL'i
   */
  async deleteHeroImage(url) {
    return this.deleteImage(url, HERO_BUCKET);
  }
};

/**
 * Supabase Storage bucket'ı oluşturma SQL'i (Manuel çalıştırılmalı)
 * 
 * -- Supabase Dashboard > Storage > Create Bucket
 * -- Bucket Name: product-images
 * -- Public: true (veya RLS policy ekle)
 * 
 * VEYA SQL Editor'de:
 * 
 * -- Bucket oluştur
 * INSERT INTO storage.buckets (id, name, public)
 * VALUES ('product-images', 'product-images', true);
 * 
 * -- RLS policy ekle (Public erişim)
 * CREATE POLICY "Public Access for Images"
 * ON storage.objects FOR SELECT
 * USING (bucket_id = 'product-images');
 * 
 * CREATE POLICY "Authenticated users can upload images"
 * ON storage.objects FOR INSERT
 * WITH CHECK (bucket_id = 'product-images');
 * 
 * CREATE POLICY "Authenticated users can delete images"
 * ON storage.objects FOR DELETE
 * USING (bucket_id = 'product-images');
 */

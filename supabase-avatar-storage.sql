-- ====================================
-- SUPABASE STORAGE - AVATARS BUCKET
-- Supabase Dashboard → Storage → Create New Bucket
-- ====================================

-- Bu işlemleri Supabase Dashboard'da yapın:
-- 1. Storage → "Create a new bucket"
-- 2. Name: "avatars"
-- 3. Public bucket: YES (avatarlar herkese açık)
-- 4. File size limit: 2MB
-- 5. Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- VEYA SQL ile:

-- Storage policies (Supabase Dashboard → Storage → avatars → Policies)

-- 1. SELECT policy (herkes görebilir)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 2. INSERT policy (sadece kayıtlı kullanıcılar yükleyebilir)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = 'public'
);

-- 3. UPDATE policy (kullanıcılar kendi avatarını güncelleyebilir)
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars');

-- 4. DELETE policy (kullanıcılar kendi avatarını silebilir)
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars');

-- ====================================
-- KULLANIM ÖRNEĞİ (JavaScript)
-- ====================================

/*
// Avatar yükleme
const file = event.target.files[0];
const fileName = `${userId}-${Date.now()}.${file.name.split('.').pop()}`;

const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`public/${fileName}`, file, {
    cacheControl: '3600',
    upsert: true
  });

// Public URL alma
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`public/${fileName}`);

// users tablosunu güncelle
await supabase
  .from('users')
  .update({ avatar: publicUrl })
  .eq('id', userId);
*/

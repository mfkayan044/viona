import React, { useState } from 'react';
import { useBlog } from '../../contexts/BlogContext';
import { Plus, Trash2, Edit2, Eye, EyeOff, Upload, Link as LinkIcon } from 'lucide-react';
import { resizeImage } from '../../utils/imageUtils';

const AdminBlog = () => {
  const { posts, addPost, updatePost, deletePost, categories, addCategory } = useBlog();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [imageUploadMethod, setImageUploadMethod] = useState('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'Viona Editör',
    category: categories[0] || '',
    tags: '',
    isPublished: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) {
      alert('Lütfen başlık ve içerik alanlarını doldurun');
      return;
    }

    const postData = {
      ...newPost,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingPost) {
      updatePost(editingPost.id, postData);
      setEditingPost(null);
    } else {
      addPost(postData);
    }

    setNewPost({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      author: 'Viona Editör',
      category: categories[0] || '',
      tags: '',
      isPublished: true
    });
    setIsAdding(false);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
      author: post.author,
      category: post.category,
      tags: post.tags.join(', '),
      isPublished: post.isPublished
    });
    setIsAdding(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const resizedImage = await resizeImage(file, 1200, 800);
      setNewPost({ ...newPost, image: resizedImage });
      event.target.value = '';
    } catch (error) {
      console.error('Görsel yükleme hatası:', error);
      alert('Görsel yüklenirken bir hata oluştu.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
      deletePost(id);
    }
  };

  const togglePublished = (post) => {
    updatePost(post.id, { isPublished: !post.isPublished });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-light uppercase tracking-wider">Blog Yönetimi</h2>
        <button
          onClick={() => {
            setIsAdding(!isAdding);
            setEditingPost(null);
            setNewPost({
              title: '',
              excerpt: '',
              content: '',
              image: '',
              author: 'Viona Editör',
              category: categories[0] || '',
              tags: '',
              isPublished: true
            });
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Yeni Yazı
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <div className="bg-white border border-neutral-200 p-6 mb-6">
          <h3 className="text-lg font-light mb-4">
            {editingPost ? 'Yazıyı Düzenle' : 'Yeni Yazı Ekle'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Başlık *</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="input-field w-full"
                placeholder="Yazı başlığı"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Özet</label>
              <input
                type="text"
                value={newPost.excerpt}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                className="input-field w-full"
                placeholder="Kısa özet"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">İçerik *</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="input-field w-full"
                rows="10"
                placeholder="Yazı içeriği (Markdown destekler)"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Blog Görseli</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('url')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs transition-all ${
                      imageUploadMethod === 'url'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                  >
                    <LinkIcon size={14} />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUploadMethod('file')}
                    className={`flex items-center gap-2 px-3 py-1 text-xs transition-all ${
                      imageUploadMethod === 'file'
                        ? 'bg-black text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                  >
                    <Upload size={14} />
                    Dosya
                  </button>
                </div>

                {imageUploadMethod === 'url' ? (
                  <input
                    type="url"
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    className="input-field w-full"
                    placeholder="https://..."
                  />
                ) : (
                  <div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploadingImage}
                      />
                      <div className="border-2 border-dashed border-neutral-300 rounded p-4 text-center cursor-pointer hover:border-black transition-all">
                        {isUploadingImage ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                            <span className="text-sm">Yükleniyor...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Upload size={20} className="text-neutral-400" />
                            <span className="text-sm">Görsel Seç</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                )}

                {newPost.image && (
                  <div className="mt-2">
                    <img src={newPost.image} alt="Preview" className="w-full h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">Yazar</label>
                <input
                  type="text"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                  className="input-field w-full"
                  placeholder="Yazar adı"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Kategori</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                  className="input-field w-full"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-2">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                  className="input-field w-full"
                  placeholder="trend, yaz, 2025"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={newPost.isPublished}
                onChange={(e) => setNewPost({ ...newPost, isPublished: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isPublished" className="text-sm">Yayınla</label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary">
                {editingPost ? 'Güncelle' : 'Ekle'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingPost(null);
                }}
                className="px-4 py-2 border border-neutral-300 hover:bg-neutral-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white border border-neutral-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left p-4 font-light">Görsel</th>
                <th className="text-left p-4 font-light">Başlık</th>
                <th className="text-left p-4 font-light">Kategori</th>
                <th className="text-left p-4 font-light">Tarih</th>
                <th className="text-left p-4 font-light">Görüntüleme</th>
                <th className="text-left p-4 font-light">Durum</th>
                <th className="text-left p-4 font-light">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-neutral-500">
                    Henüz yazı bulunmuyor
                  </td>
                </tr>
              ) : (
                posts.map(post => (
                  <tr key={post.id} className="border-b border-neutral-100">
                    <td className="p-4">
                      {post.image && (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-16 h-16 object-cover"
                        />
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{post.title}</p>
                      <p className="text-xs text-neutral-500 mt-1">{post.excerpt}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600">
                        {post.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="p-4 text-sm">
                      {post.views}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => togglePublished(post)}
                        className={`flex items-center gap-1 text-sm ${
                          post.isPublished ? 'text-green-600' : 'text-neutral-400'
                        }`}
                      >
                        {post.isPublished ? (
                          <>
                            <Eye size={16} />
                            <span>Yayında</span>
                          </>
                        ) : (
                          <>
                            <EyeOff size={16} />
                            <span>Taslak</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Yazı</p>
          <p className="text-2xl font-light">{posts.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Yayında</p>
          <p className="text-2xl font-light">{posts.filter(p => p.isPublished).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Taslak</p>
          <p className="text-2xl font-light">{posts.filter(p => !p.isPublished).length}</p>
        </div>
        <div className="bg-white border border-neutral-200 p-4">
          <p className="text-sm text-neutral-600 mb-1">Toplam Görüntüleme</p>
          <p className="text-2xl font-light">{posts.reduce((sum, p) => sum + p.views, 0)}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminBlog;

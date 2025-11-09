import React, { useState, useEffect } from 'react';
import { useReviews } from '../../contexts/ReviewContext';
import { useApp } from '../../contexts/AppContext';
import { Star, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const AdminReviews = () => {
  const { reviews, deleteReview, updateReview, loading } = useReviews();
  const { products } = useApp();
  const toast = useToast();

  const [filter, setFilter] = useState('all'); // all, approved, pending
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrelenmiş yorumlar
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

    try {
      await deleteReview(reviewId);
      toast.success('Yorum silindi');
    } catch (error) {
      console.error('Delete review error:', error);
      toast.error('Yorum silinemedi');
    }
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Bilinmeyen Ürün';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light uppercase tracking-wider mb-2">
          Yorum Yönetimi
        </h1>
        <p className="text-neutral-600">
          Toplam {reviews.length} yorum
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Yorum veya kullanıcı ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field flex-1"
        />
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-neutral-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-300">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ürün
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Puan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Yorum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">
                        {review.user_name || 'Anonim'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">
                        {getProductName(review.product_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={14}
                            className={
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-neutral-300'
                            }
                          />
                        ))}
                        <span className="ml-2 text-sm text-neutral-600">
                          ({review.rating})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-700 max-w-md truncate">
                        {review.comment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-500">
                        {new Date(review.created_at).toLocaleDateString('tr-TR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-600 hover:text-red-800 transition"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">
                    Yorum bulunamadı
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
            Toplam Yorum
          </p>
          <p className="text-3xl font-light">{reviews.length}</p>
        </div>
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
            Ortalama Puan
          </p>
          <p className="text-3xl font-light">
            {reviews.length > 0
              ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'}
          </p>
        </div>
        <div className="bg-white p-6 border border-neutral-300">
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
            Faydalı İşaretleme
          </p>
          <p className="text-3xl font-light">
            {reviews.reduce((acc, r) => acc + (r.helpful_count || 0), 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;

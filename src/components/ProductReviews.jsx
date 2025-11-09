import React, { useState } from 'react';
import { Star, ThumbsUp, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useReviews } from '../contexts/ReviewContext';
import { useToast } from '../contexts/ToastContext';

const ProductReviews = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    getProductReviews, 
    getAverageRating, 
    getRatingDistribution, 
    hasUserReviewed,
    addReview,
    markAsHelpful
  } = useReviews();
  const toast = useToast();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [filterRating, setFilterRating] = useState(0); // 0 = tümü

  const reviews = getProductReviews(productId);
  const averageRating = getAverageRating(productId);
  const distribution = getRatingDistribution(productId);
  const userHasReviewed = user ? hasUserReviewed(productId, user.email) : false;

  // Filtreli yorumlar
  const filteredReviews = filterRating === 0 
    ? reviews 
    : reviews.filter(r => r.rating === filterRating);

  // Sıralama: En yeni, En faydalı
  const [sortBy, setSortBy] = useState('newest'); // newest, helpful
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return (b.helpful || 0) - (a.helpful || 0);
    }
  });

  const handleSubmitReview = (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Yorum yapmak için giriş yapmalısınız!');
      return;
    }

    if (userHasReviewed) {
      toast.error('Bu ürün için zaten yorum yaptınız!');
      return;
    }

    if (rating === 0) {
      toast.error('Lütfen bir puan verin!');
      return;
    }

    if (!comment.trim()) {
      toast.error('Lütfen yorumunuzu yazın!');
      return;
    }

    addReview({
      productId,
      userEmail: user.email,
      userName: user.name || user.email.split('@')[0],
      userAvatar: user.avatar,
      rating,
      comment: comment.trim()
    });

    toast.success('Yorumunuz eklendi! 🎉');
    setRating(0);
    setComment('');
    setShowReviewForm(false);
  };

  const StarRating = ({ value, onChange, readonly = false, size = 24 }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onChange && onChange(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`transition-all ${!readonly ? 'hover:scale-110' : ''}`}
          >
            <Star
              size={size}
              className={`${
                star <= (hoverRating || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-neutral-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-3xl font-light uppercase tracking-wider mb-8">
        Değerlendirmeler
      </h2>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-8 mb-8 p-8 bg-neutral-50 border border-neutral-200">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="text-6xl font-light mb-2">{averageRating}</div>
          <StarRating value={Math.round(averageRating)} readonly size={28} />
          <p className="text-neutral-600 mt-3">
            {reviews.length} değerlendirme
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(star => {
            const count = distribution[star];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

            return (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                className="w-full flex items-center gap-3 hover:bg-white p-2 transition group"
              >
                <span className="text-sm w-12">{star} yıldız</span>
                <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all duration-300 group-hover:bg-yellow-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-neutral-600 w-8">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Form Toggle */}
      {!userHasReviewed && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  toast.error('Yorum yapmak için giriş yapmalısınız!');
                  return;
                }
                setShowReviewForm(true);
              }}
              className="btn-primary"
            >
              Değerlendirme Yap
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="p-6 bg-neutral-50 border border-neutral-200">
              <h3 className="font-medium mb-4">Değerlendirmeniz</h3>
              
              <div className="mb-4">
                <label className="block text-sm mb-2">Puanınız *</label>
                <StarRating value={rating} onChange={setRating} />
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2">Yorumunuz *</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Bu ürün hakkındaki düşüncelerinizi paylaşın..."
                  className="input-field w-full"
                  rows="4"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Gönder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setRating(0);
                    setComment('');
                  }}
                  className="btn-outline"
                >
                  İptal
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {userHasReviewed && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            ✓ Bu ürün için değerlendirme yaptınız
          </p>
        </div>
      )}

      {/* Filters & Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">Gösterilen:</span>
            <button
              onClick={() => setFilterRating(0)}
              className={`text-sm px-3 py-1 transition ${
                filterRating === 0 ? 'bg-black text-white' : 'bg-neutral-100 hover:bg-neutral-200'
              }`}
            >
              Tümü ({reviews.length})
            </button>
            {filterRating > 0 && (
              <button
                onClick={() => setFilterRating(0)}
                className="text-sm px-3 py-1 bg-neutral-100 hover:bg-neutral-200"
              >
                {filterRating} yıldız ({filteredReviews.length})
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-neutral-300 px-3 py-1"
          >
            <option value="newest">En Yeni</option>
            <option value="helpful">En Faydalı</option>
          </select>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {sortedReviews.length > 0 ? (
          sortedReviews.map(review => (
            <div key={review.id} className="border-b border-neutral-200 pb-6">
              <div className="flex items-start gap-4">
                <img
                  src={review.userAvatar}
                  alt={review.userName}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{review.userName}</h4>
                      <p className="text-xs text-neutral-500">
                        {new Date(review.date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <StarRating value={review.rating} readonly size={18} />
                  </div>
                  <p className="text-neutral-700 mb-3">{review.comment}</p>
                  <button
                    onClick={() => markAsHelpful(review.id)}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-black transition"
                  >
                    <ThumbsUp size={14} />
                    Faydalı ({review.helpful || 0})
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-neutral-500">
            {filterRating > 0 
              ? `${filterRating} yıldızlı değerlendirme yok`
              : 'Henüz değerlendirme yapılmamış. İlk değerlendirmeyi siz yapın!'}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;

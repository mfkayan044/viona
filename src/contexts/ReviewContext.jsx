import React, { createContext, useContext, useState, useEffect } from 'react';
import { reviewService } from '../services/supabase.service';

const ReviewContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Supabase'den yükle
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getAll();
      setReviews(data || []);
    } catch (error) {
      console.error('Reviews load error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Yorum ekle
  const addReview = async (reviewData) => {
    try {
      const newReview = await reviewService.create({
        productId: reviewData.productId,
        userName: reviewData.userName,
        userEmail: reviewData.userEmail,
        userId: reviewData.userId, // user_id ekle
        rating: reviewData.rating,
        comment: reviewData.comment
      });

      // State'i güncelle
      setReviews(prev => [newReview, ...prev]);
      
      // Başarıyla eklendi, yeniden yükle
      await loadReviews();
      
      return newReview;
    } catch (error) {
      console.error('Add review error:', error);
      throw error;
    }
  };

  // Yorum güncelle
  const updateReview = async (reviewId, updates) => {
    try {
      await reviewService.update(reviewId, updates);
      setReviews(prev =>
        prev.map(review =>
          review.id === reviewId ? { ...review, ...updates } : review
        )
      );
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  };

  // Yorum sil
  const deleteReview = async (reviewId) => {
    try {
      await reviewService.delete(reviewId);
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  };

  // Ürüne ait yorumları getir
  const getProductReviews = (productId) => {
    return reviews.filter(review => review.product_id === productId);
  };

  // Kullanıcının yorumlarını getir
  const getUserReviews = (userId) => {
    return reviews.filter(review => review.user_id === userId);
  };

  // Kullanıcı bu ürün için yorum yapmış mı?
  const hasUserReviewed = (productId, userId) => {
    return reviews.some(
      review => review.product_id === productId && review.user_id === userId
    );
  };

  // Ürün için ortalama puan
  const getAverageRating = (productId) => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) return 0;

    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / productReviews.length).toFixed(1);
  };

  // Puan dağılımı
  const getRatingDistribution = (productId) => {
    const productReviews = getProductReviews(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    productReviews.forEach(review => {
      distribution[review.rating]++;
    });

    return distribution;
  };

  // Yorumu faydalı işaretle
  const markAsHelpful = async (reviewId) => {
    try {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        const newHelpful = (review.helpful_count || 0) + 1;
        await updateReview(reviewId, { helpful_count: newHelpful });
      }
    } catch (error) {
      console.error('Mark helpful error:', error);
    }
  };

  const value = {
    reviews,
    loading,
    addReview,
    updateReview,
    deleteReview,
    getProductReviews,
    getUserReviews,
    hasUserReviewed,
    getAverageRating,
    getRatingDistribution,
    markAsHelpful,
    loadReviews
  };

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  );
};

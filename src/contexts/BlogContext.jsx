import React, { createContext, useContext, useState, useEffect } from 'react';
import { blogService } from '../services/supabase.service';

const BlogContext = createContext();

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within a BlogProvider');
  }
  return context;
};

export const BlogProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState(['Trendler', 'Bakım', 'Rehber', 'Kampanya']);

  // Supabase'den yükle
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAll();
      setPosts(data || []);
    } catch (error) {
      console.error('Blog posts load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData) => {
    try {
      const slug = postData.title.toLowerCase()
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
        .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const newPost = await blogService.create({
        title: postData.title,
        slug: slug,
        excerpt: postData.excerpt,
        content: postData.content,
        image: postData.image,
        author: postData.author || 'Viona Editör',
        category: postData.category,
        tags: postData.tags || [],
        published: true
      });

      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (error) {
      console.error('Add post error:', error);
      throw error;
    }
  };

  const updatePost = async (postId, updates) => {
    try {
      await blogService.update(postId, updates);
      setPosts(prev => prev.map(post =>
        post.id === postId ? { ...post, ...updates } : post
      ));
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      await blogService.delete(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  };

  const getPostBySlug = (slug) => {
    return posts.find(post => post.slug === slug);
  };

  const incrementViews = async (postId) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        const newViews = (post.views || 0) + 1;
        await updatePost(postId, { views: newViews });
      }
    } catch (error) {
      console.error('Increment views error:', error);
    }
  };

  const getPublishedPosts = () => {
    return posts.filter(post => post.published);
  };

  const getPostsByCategory = (category) => {
    return posts.filter(post => post.category === category && post.published);
  };

  const addCategory = (category) => {
    if (category && !categories.includes(category)) {
      setCategories(prev => [...prev, category]);
    }
  };

  const deleteCategory = (category) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  return (
    <BlogContext.Provider value={{
      posts,
      categories,
      loading,
      addPost,
      updatePost,
      deletePost,
      getPostBySlug,
      incrementViews,
      getPublishedPosts,
      getPostsByCategory,
      addCategory,
      deleteCategory,
      loadPosts
    }}>
      {children}
    </BlogContext.Provider>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { Calendar, User, Eye, ArrowRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEO from '../components/SEO';

const BlogPage = () => {
  const navigate = useNavigate();
  const { getPublishedPosts, categories } = useBlog();
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const publishedPosts = getPublishedPosts();
  const filteredPosts = selectedCategory === 'all'
    ? publishedPosts
    : publishedPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO pageKey="blog" />
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-wider mb-4">
            Blog & Haberler
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Çanta dünyasından son haberler, trend önerileri ve bakım ipuçları
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
              selectedCategory === 'all'
                ? 'bg-black text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            Tümü ({publishedPosts.length})
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
                selectedCategory === category
                  ? 'bg-black text-white'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {category} ({publishedPosts.filter(p => p.category === category).length})
            </button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500">Bu kategoride henüz yazı yok</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article
                key={post.id}
                className="bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                {/* Featured Image */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category Badge */}
                  <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-neutral-100 text-neutral-700 mb-3">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="text-xl font-light mb-3 group-hover:text-neutral-600 transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{post.views}</span>
                    </div>
                  </div>

                  {/* Read More */}
                  <div className="flex items-center gap-2 text-sm font-medium group-hover:gap-3 transition-all">
                    <span>Devamını Oku</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;

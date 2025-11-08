import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import { Calendar, User, Eye, ArrowLeft, Tag } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getPostBySlug, incrementViews, getPublishedPosts } = useBlog();
  
  const post = getPostBySlug(slug);
  const relatedPosts = getPublishedPosts()
    .filter(p => p.id !== post?.id && p.category === post?.category)
    .slice(0, 3);

  useEffect(() => {
    if (post) {
      incrementViews(post.id);
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-light mb-4">Yazı Bulunamadı</h2>
          <button onClick={() => navigate('/blog')} className="btn-primary">
            Blog'a Dön
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-neutral-600 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Blog'a Dön</span>
        </button>

        {/* Article */}
        <article className="bg-white border border-neutral-200 overflow-hidden">
          {/* Featured Image */}
          <div className="aspect-[21/9] overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Category */}
            <span className="inline-block px-3 py-1 text-xs uppercase tracking-wider bg-neutral-100 text-neutral-700 mb-4">
              {post.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-light mb-6">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-600 mb-8 pb-8 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{post.views} görüntülenme</span>
              </div>
            </div>

            {/* Post Content */}
            <div className="prose prose-neutral max-w-none">
              <div className="text-lg text-neutral-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-neutral-200">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag size={16} className="text-neutral-400" />
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs bg-neutral-100 text-neutral-600 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-light uppercase tracking-wider mb-6">
              İlgili Yazılar
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <div
                  key={relatedPost.id}
                  onClick={() => navigate(`/blog/${relatedPost.slug}`)}
                  className="bg-white border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-light mb-2 group-hover:text-neutral-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {new Date(relatedPost.publishedAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;

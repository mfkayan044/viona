import { useState, useEffect } from 'react';
import { Download, FileText, Save, Globe, Eye, Search, BarChart } from 'lucide-react';
import { generateSitemap, downloadSitemap, downloadRobotsTxt } from '../../utils/sitemap';
import { useApp } from '../../contexts/AppContext';
import { supabase } from '../../lib/supabase';

export default function AdminSEO() {
  const [sitemapPreview, setSitemapPreview] = useState(false);
  const { products } = useApp();
  const [seoSettings, setSeoSettings] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    page_key: '',
    page_title: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    canonical_url: '',
    robots: 'index, follow',
    google_analytics_id: '',
    google_search_console_id: ''
  });

  useEffect(() => {
    fetchSEOSettings();
  }, []);

  const fetchSEOSettings = async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('page_key');
    
    if (!error && data) {
      setSeoSettings(data);
    }
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setFormData({
      page_key: page.page_key,
      page_title: page.page_title,
      meta_title: page.meta_title,
      meta_description: page.meta_description,
      meta_keywords: page.meta_keywords || '',
      og_title: page.og_title || '',
      og_description: page.og_description || '',
      og_image: page.og_image || '',
      og_type: page.og_type || 'website',
      twitter_card: page.twitter_card || 'summary_large_image',
      twitter_title: page.twitter_title || '',
      twitter_description: page.twitter_description || '',
      twitter_image: page.twitter_image || '',
      canonical_url: page.canonical_url || '',
      robots: page.robots || 'index, follow',
      google_analytics_id: page.google_analytics_id || '',
      google_search_console_id: page.google_search_console_id || ''
    });
  };

  const handleSaveSEO = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('seo_settings')
      .update({
        page_title: formData.page_title,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        og_title: formData.og_title,
        og_description: formData.og_description,
        og_image: formData.og_image,
        og_type: formData.og_type,
        twitter_card: formData.twitter_card,
        twitter_title: formData.twitter_title,
        twitter_description: formData.twitter_description,
        twitter_image: formData.twitter_image,
        canonical_url: formData.canonical_url,
        robots: formData.robots,
        google_analytics_id: formData.google_analytics_id,
        google_search_console_id: formData.google_search_console_id
      })
      .eq('page_key', formData.page_key);

    if (!error) {
      alert('✅ SEO ayarları kaydedildi!');
      fetchSEOSettings();
    } else {
      alert('❌ Hata: ' + error.message);
    }
    setLoading(false);
  };

  const handleGenerateSitemap = () => {
    const sitemap = generateSitemap(products);
    setSitemapPreview(sitemap);
  };

  return (
    <div className="p-4 sm:p-8 bg-neutral-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-light mb-2 uppercase tracking-wider">SEO Yönetimi</h1>
        <p className="text-neutral-600">Arama motoru optimizasyonu ve meta tag yönetimi</p>
      </div>

      {/* Page Selector */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 mb-6">
        <h2 className="text-lg sm:text-xl font-light mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Sayfa Seçin
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {seoSettings.map((page) => (
            <button
              key={page.page_key}
              onClick={() => handleSelectPage(page)}
              className={`p-4 border-2 rounded-lg transition-all text-left ${
                selectedPage?.page_key === page.page_key
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-200 hover:border-black'
              }`}
            >
              <div className="font-medium text-sm uppercase tracking-wider">{page.page_title}</div>
              <div className="text-xs opacity-70 mt-1">{page.page_key}</div>
            </button>
          ))}
        </div>
      </div>

      {/* SEO Form */}
      {selectedPage && (
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-neutral-200 mb-6">
          <h2 className="text-lg sm:text-xl font-light mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            SEO Ayarları - {selectedPage.page_title}
          </h2>

          <div className="space-y-6">
            {/* Basic Meta */}
            <div>
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                Temel Meta Etiketleri
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light mb-2">Meta Title (50-60 karakter)</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({...formData, meta_title: e.target.value})}
                    className="input-field"
                    maxLength="60"
                  />
                  <p className="text-xs text-neutral-500 mt-1">{formData.meta_title.length}/60 karakter</p>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Meta Description (150-160 karakter)</label>
                  <textarea
                    value={formData.meta_description}
                    onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                    className="input-field"
                    rows="3"
                    maxLength="160"
                  />
                  <p className="text-xs text-neutral-500 mt-1">{formData.meta_description.length}/160 karakter</p>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Meta Keywords (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData({...formData, meta_keywords: e.target.value})}
                    className="input-field"
                    placeholder="moda, giyim, elbise, ayakkabı"
                  />
                </div>
              </div>
            </div>

            {/* Open Graph */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Open Graph (Facebook, LinkedIn)
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">OG Title</label>
                    <input
                      type="text"
                      value={formData.og_title}
                      onChange={(e) => setFormData({...formData, og_title: e.target.value})}
                      className="input-field"
                      placeholder={formData.meta_title}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">OG Type</label>
                    <select
                      value={formData.og_type}
                      onChange={(e) => setFormData({...formData, og_type: e.target.value})}
                      className="input-field"
                    >
                      <option value="website">Website</option>
                      <option value="article">Article</option>
                      <option value="product">Product</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">OG Description</label>
                  <textarea
                    value={formData.og_description}
                    onChange={(e) => setFormData({...formData, og_description: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder={formData.meta_description}
                  />
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">OG Image URL (1200x630px önerilir)</label>
                  <input
                    type="url"
                    value={formData.og_image}
                    onChange={(e) => setFormData({...formData, og_image: e.target.value})}
                    className="input-field"
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </div>
            </div>

            {/* Twitter Card */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter Card
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-light mb-2">Card Type</label>
                  <select
                    value={formData.twitter_card}
                    onChange={(e) => setFormData({...formData, twitter_card: e.target.value})}
                    className="input-field"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary Large Image</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Twitter Title</label>
                    <input
                      type="text"
                      value={formData.twitter_title}
                      onChange={(e) => setFormData({...formData, twitter_title: e.target.value})}
                      className="input-field"
                      placeholder={formData.meta_title}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Twitter Image URL</label>
                    <input
                      type="url"
                      value={formData.twitter_image}
                      onChange={(e) => setFormData({...formData, twitter_image: e.target.value})}
                      className="input-field"
                      placeholder={formData.og_image || 'https://example.com/twitter-image.jpg'}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-light mb-2">Twitter Description</label>
                  <textarea
                    value={formData.twitter_description}
                    onChange={(e) => setFormData({...formData, twitter_description: e.target.value})}
                    className="input-field"
                    rows="2"
                    placeholder={formData.meta_description}
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="border-t pt-6">
              <h3 className="font-medium mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
                <BarChart className="w-4 h-4" />
                Gelişmiş Ayarlar
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Canonical URL</label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                      className="input-field"
                      placeholder="https://viona.com.tr/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Robots</label>
                    <select
                      value={formData.robots}
                      onChange={(e) => setFormData({...formData, robots: e.target.value})}
                      className="input-field"
                    >
                      <option value="index, follow">Index, Follow</option>
                      <option value="noindex, follow">NoIndex, Follow</option>
                      <option value="index, nofollow">Index, NoFollow</option>
                      <option value="noindex, nofollow">NoIndex, NoFollow</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-light mb-2">Google Analytics ID</label>
                    <input
                      type="text"
                      value={formData.google_analytics_id}
                      onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})}
                      className="input-field"
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-light mb-2">Google Search Console ID</label>
                    <input
                      type="text"
                      value={formData.google_search_console_id}
                      onChange={(e) => setFormData({...formData, google_search_console_id: e.target.value})}
                      className="input-field"
                      placeholder="google-site-verification"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t pt-6">
              <button
                onClick={handleSaveSEO}
                disabled={loading}
                className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Kaydediliyor...' : 'SEO Ayarlarını Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sitemap & Robots.txt Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Sitemap Generator */}
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-light">Sitemap.xml</h2>
          </div>
          <p className="text-neutral-600 mb-4">
            Arama motorları için XML sitemap dosyası oluşturun.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateSitemap}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:border-black transition"
            >
              <FileText className="w-4 h-4" />
              Önizleme
            </button>
            <button
              onClick={() => downloadSitemap(products)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
            >
              <Download className="w-4 h-4" />
              İndir
            </button>
          </div>
        </div>

        {/* Robots.txt Generator */}
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-light">Robots.txt</h2>
          </div>
          <p className="text-neutral-600 mb-4">
            Arama motoru botları için robots.txt dosyası oluşturun.
          </p>
          <button
            onClick={downloadRobotsTxt}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <Download className="w-4 h-4" />
            İndir
          </button>
        </div>
      </div>

      {/* SEO Checklist */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-8">
        <h2 className="text-xl font-light mb-4">SEO Kontrol Listesi</h2>
        <div className="space-y-3">
          {[
            { title: 'Meta Title & Description', status: 'completed', desc: 'Tüm sayfalarda tanımlı' },
            { title: 'Open Graph Tags', status: 'completed', desc: 'Sosyal medya paylaşımları için' },
            { title: 'Schema Markup', status: 'completed', desc: 'Ürün ve organizasyon yapılandırılmış verisi' },
            { title: 'Canonical URLs', status: 'completed', desc: 'Duplicate content önleme' },
            { title: 'Alt Text', status: 'warning', desc: 'Bazı görseller eksik' },
            { title: 'Mobile Friendly', status: 'completed', desc: 'Responsive tasarım aktif' },
            { title: 'Page Speed', status: 'warning', desc: 'Lazy loading önerilir' },
            { title: 'Sitemap', status: 'completed', desc: 'Yukarıdan indirebilirsiniz' },
          ].map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                <div>
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-neutral-600">{item.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sitemap Preview */}
      {sitemapPreview && (
        <div className="bg-white p-6 rounded-lg border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-light">Sitemap Önizleme</h2>
            <button
              onClick={() => setSitemapPreview(false)}
              className="text-neutral-500 hover:text-black"
            >
              Kapat
            </button>
          </div>
          <pre className="bg-neutral-50 p-4 rounded-lg overflow-auto text-xs">
            {sitemapPreview}
          </pre>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { generateSitemap, downloadSitemap, downloadRobotsTxt } from '../../utils/sitemap';
import { useApp } from '../../contexts/AppContext';

export default function AdminSEO() {
  const [sitemapPreview, setSitemapPreview] = useState(false);
  const { products } = useApp();

  const handleGenerateSitemap = () => {
    const sitemap = generateSitemap(products);
    setSitemapPreview(sitemap);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-light mb-2">SEO Araçları</h1>
        <p className="text-neutral-600">Sitemap ve robots.txt dosyalarını yönetin</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
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

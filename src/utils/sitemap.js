export function generateSitemap(products = []) {
  const baseUrl = 'https://viona.com'; // Production URL'inizi buraya yazın
  const currentDate = new Date().toISOString().split('T')[0];
  
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/products', priority: '0.9', changefreq: 'daily' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/contact', priority: '0.7', changefreq: 'monthly' },
    { url: '/blog', priority: '0.8', changefreq: 'weekly' },
    { url: '/faq', priority: '0.6', changefreq: 'monthly' },
    { url: '/cart', priority: '0.5', changefreq: 'weekly' },
    { url: '/wishlist', priority: '0.5', changefreq: 'weekly' },
  ];

  const productPages = products.map(product => ({
    url: `/product/${product.id}`,
    priority: '0.8',
    changefreq: 'weekly'
  }));

  const categoryPages = [
    { url: '/category/clutch', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/shoulder', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/tote', priority: '0.8', changefreq: 'weekly' },
    { url: '/category/crossbody', priority: '0.8', changefreq: 'weekly' },
  ];

  const allPages = [...staticPages, ...productPages, ...categoryPages];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allPages.forEach(page => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
    xml += `    <priority>${page.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

export function downloadSitemap(products = []) {
  const sitemapContent = generateSitemap(products);
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function generateRobotsTxt() {
  const baseUrl = 'https://viona.com'; // Production URL'inizi buraya yazın
  
  return `# robots.txt for Viona
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /checkout/
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
}

export function downloadRobotsTxt() {
  const robotsContent = generateRobotsTxt();
  const blob = new Blob([robotsContent], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'robots.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

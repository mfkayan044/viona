import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title = 'Viona - El Yapımı Boncuklu Çantalar',
  description = 'Viona ile benzersiz, el yapımı boncuklu çantalar keşfedin. Her biri özenle tasarlanmış, şık ve özgün aksesuarlar.',
  keywords = 'el yapımı çanta, boncuklu çanta, handmade bag, viona, aksesuar, moda',
  image = '/logo.png',
  url = window.location.href,
  type = 'website',
  author = 'Viona'
}) {
  const fullTitle = title.includes('Viona') ? title : `${title} | Viona`;
  const siteUrl = window.location.origin;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Turkish" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Viona" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:creator" content="@viona" />

      {/* Additional SEO */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
    </Helmet>
  );
}

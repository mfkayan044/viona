import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function SEO({ 
  pageKey = 'home',
  title,
  description,
  keywords,
  image,
  url = window.location.href,
  type,
}) {
  const [seo, setSeo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSEO();
  }, [pageKey]);

  const fetchSEO = async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_key', pageKey)
      .single();

    if (!error && data) {
      setSeo(data);
    }
    setLoading(false);
  };

  // Fallback values
  const defaultTitle = 'Viona - Premium Moda & Giyim';
  const defaultDescription = 'Viona ile tarzınızı yansıtın. En yeni moda trendleri, kaliteli ürünler ve hızlı teslimat.';
  const defaultKeywords = 'moda, giyim, elbise, ayakkabı, aksesuar, online alışveriş';

  const finalTitle = title || (seo?.meta_title) || defaultTitle;
  const finalDescription = description || (seo?.meta_description) || defaultDescription;
  const finalKeywords = keywords || (seo?.meta_keywords) || defaultKeywords;
  const finalImage = image || (seo?.og_image) || '/logo.png';
  const finalType = type || (seo?.og_type) || 'website';

  const siteUrl = window.location.origin;
  const fullImage = finalImage.startsWith('http') ? finalImage : `${siteUrl}${finalImage}`;

  if (loading) return null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={seo?.robots || 'index, follow'} />
      <meta name="language" content="Turkish" />
      {seo?.canonical_url && <link rel="canonical" href={seo.canonical_url} />}
      {!seo?.canonical_url && <link rel="canonical" href={url} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalType} />
      <meta property="og:url" content={seo?.canonical_url || url} />
      <meta property="og:title" content={seo?.og_title || finalTitle} />
      <meta property="og:description" content={seo?.og_description || finalDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Viona" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter */}
      <meta name="twitter:card" content={seo?.twitter_card || 'summary_large_image'} />
      <meta name="twitter:url" content={seo?.canonical_url || url} />
      <meta name="twitter:title" content={seo?.twitter_title || finalTitle} />
      <meta name="twitter:description" content={seo?.twitter_description || finalDescription} />
      <meta name="twitter:image" content={seo?.twitter_image || fullImage} />

      {/* Google Analytics */}
      {seo?.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${seo.google_analytics_id}`}></script>
          <script>
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${seo.google_analytics_id}');
            `}
          </script>
        </>
      )}

      {/* Google Search Console */}
      {seo?.google_search_console_id && (
        <meta name="google-site-verification" content={seo.google_search_console_id} />
      )}

      {/* Additional SEO */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
    </Helmet>
  );
}

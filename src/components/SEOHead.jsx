import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function SEOHead({ pageKey = 'home' }) {
  const [seo, setSeo] = useState(null);

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
  };

  if (!seo) return null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{seo.meta_title}</title>
      <meta name="description" content={seo.meta_description} />
      {seo.meta_keywords && <meta name="keywords" content={seo.meta_keywords} />}
      {seo.robots && <meta name="robots" content={seo.robots} />}
      {seo.canonical_url && <link rel="canonical" href={seo.canonical_url} />}

      {/* Open Graph */}
      <meta property="og:title" content={seo.og_title || seo.meta_title} />
      <meta property="og:description" content={seo.og_description || seo.meta_description} />
      {seo.og_image && <meta property="og:image" content={seo.og_image} />}
      {seo.og_type && <meta property="og:type" content={seo.og_type} />}
      {seo.canonical_url && <meta property="og:url" content={seo.canonical_url} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content={seo.twitter_card || 'summary_large_image'} />
      <meta name="twitter:title" content={seo.twitter_title || seo.meta_title} />
      <meta name="twitter:description" content={seo.twitter_description || seo.meta_description} />
      {seo.twitter_image && <meta name="twitter:image" content={seo.twitter_image} />}

      {/* Google Analytics */}
      {seo.google_analytics_id && (
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

      {/* Google Search Console Verification */}
      {seo.google_search_console_id && (
        <meta name="google-site-verification" content={seo.google_search_console_id} />
      )}
    </Helmet>
  );
}

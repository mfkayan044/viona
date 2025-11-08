export default function generateProductSchema(product) {
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": [product.image, ...(product.images || [])],
    "description": product.description,
    "sku": `VIONA-${product.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Viona"
    },
    "offers": {
      "@type": "Offer",
      "url": `${window.location.origin}/product/${product.id}`,
      "priceCurrency": "TRY",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Viona"
      }
    },
    "aggregateRating": product.reviews && product.reviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.reviews.length
    } : undefined
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Viona",
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "description": "El yapımı boncuklu çantalar ve aksesuarlar",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR"
    },
    "sameAs": [
      "https://www.instagram.com/viona",
      "https://www.facebook.com/viona"
    ]
  };
}

export function generateBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Viona",
    "url": window.location.origin,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${window.location.origin}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

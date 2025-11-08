# Deployment Guide - VIONA E-commerce

## Deployment Options

### Option 1: Vercel (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (free tier available)

#### Steps
1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/viona.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Vite settings
   - Click "Deploy"

3. **Environment Variables** (if needed)
   - No environment variables required for demo
   - Add later for API keys, etc.

#### Build Settings (Auto-detected)
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Option 2: Netlify

#### Steps
1. **Push to GitHub** (same as above)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Configure Redirects**
   Create `public/_redirects`:
   ```
   /* /index.html 200
   ```

### Option 3: GitHub Pages

#### Steps
1. **Install gh-pages**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "homepage": "https://yourusername.github.io/viona",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Update vite.config.js**
   ```javascript
   export default defineConfig({
     base: '/viona/',
     plugins: [react()],
   })
   ```

4. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 4: AWS S3 + CloudFront

#### Steps
1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create S3 Bucket**
   - Name: `viona-ecommerce`
   - Enable static website hosting
   - Set index.html as index document

3. **Upload dist folder**
   ```bash
   aws s3 sync dist/ s3://viona-ecommerce
   ```

4. **Configure CloudFront**
   - Create distribution
   - Origin: S3 bucket
   - Default root object: `index.html`

5. **Set up custom error pages**
   - 404 → /index.html (for SPA routing)

## Environment Setup

### For Production

Create `.env.production`:
```env
VITE_API_URL=your-api-url
VITE_ADMIN_PASSWORD=your-secure-password
```

Update code to use env variables:
```javascript
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'viona2024';
```

## Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Update admin password
- [ ] Replace demo products with real data
- [ ] Update contact information
- [ ] Test responsive design
- [ ] Optimize images
- [ ] Check console for errors
- [ ] Test cart functionality
- [ ] Verify admin panel access
- [ ] Update meta tags in index.html
- [ ] Add favicon
- [ ] Test on multiple browsers
- [ ] Check accessibility
- [ ] Review analytics setup

## Performance Optimization

### 1. Image Optimization
```bash
# Install image optimization package
npm install --save-dev vite-plugin-imagemin
```

Update `vite.config.js`:
```javascript
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
    })
  ]
})
```

### 2. Code Splitting
Already handled by Vite automatically

### 3. Lazy Loading
Implement for routes:
```javascript
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

### 4. Compression
Most hosting providers handle this automatically

## SEO Optimization

### Update index.html
```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- Primary Meta Tags -->
  <title>VIONA - Handcrafted Beaded Bags | Turkish Artisan Jewelry</title>
  <meta name="title" content="VIONA - Handcrafted Beaded Bags">
  <meta name="description" content="Discover unique handcrafted beaded bags. Traditional Turkish artistry meets contemporary design.">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://viona.com/">
  <meta property="og:title" content="VIONA - Handcrafted Beaded Bags">
  <meta property="og:description" content="Discover unique handcrafted beaded bags.">
  <meta property="og:image" content="https://viona.com/og-image.jpg">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://viona.com/">
  <meta property="twitter:title" content="VIONA - Handcrafted Beaded Bags">
  <meta property="twitter:description" content="Discover unique handcrafted beaded bags.">
  <meta property="twitter:image" content="https://viona.com/og-image.jpg">
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

### Add robots.txt
Create `public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://viona.com/sitemap.xml
```

## Analytics Setup

### Google Analytics
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## Security Considerations

1. **HTTPS Only**
   - Ensure SSL certificate
   - Force HTTPS redirects

2. **Admin Password**
   - Change default password
   - Use environment variables
   - Consider adding JWT authentication

3. **Headers**
   Configure security headers (varies by host)

4. **Content Security Policy**
   Add to index.html or server config

## Domain Setup

### Custom Domain
1. Purchase domain
2. Add DNS records:
   - A record: points to host IP
   - CNAME: www to root domain
3. Update hosting platform settings
4. Wait for DNS propagation (24-48 hours)

## Monitoring

### Uptime Monitoring
- Use UptimeRobot or Pingdom
- Set up alerts

### Error Tracking
- Implement Sentry
  ```bash
  npm install @sentry/react
  ```

### Performance Monitoring
- Use Lighthouse CI
- Monitor Core Web Vitals

## Backup Strategy

1. **Code**: Git repository
2. **Database**: Regular exports (when implemented)
3. **Images**: Cloud storage backup
4. **Settings**: Version control

## Post-Deployment

1. **Test Everything**
   - All routes
   - Admin panel
   - Cart functionality
   - Mobile responsiveness

2. **Submit to Search Engines**
   - Google Search Console
   - Bing Webmaster Tools

3. **Social Media**
   - Share on Instagram
   - Create business profiles

4. **Monitor**
   - Check analytics weekly
   - Review error logs
   - Monitor performance

## Troubleshooting

### Blank Page After Deploy
- Check console for errors
- Verify base path in vite.config.js
- Check build logs

### Routes Not Working
- Add redirect rules
- Check server configuration

### Images Not Loading
- Verify image URLs
- Check CORS settings
- Use relative paths

## Cost Estimates

| Platform | Free Tier | Paid Plans |
|----------|-----------|------------|
| Vercel | 100GB bandwidth | $20/month |
| Netlify | 100GB bandwidth | $19/month |
| GitHub Pages | 1GB storage | Free |
| AWS S3 | First year free | ~$5-10/month |

## Recommended Stack

**For MVP/Demo:**
- Vercel (easiest, best DX)

**For Production:**
- Vercel/Netlify (frontend)
- Firebase/Supabase (backend)
- Cloudinary (images)

## Next Steps After Deployment

1. Add backend API
2. Implement real payment processing
3. Add user authentication
4. Create email notifications
5. Implement order management
6. Add inventory tracking
7. Create customer dashboard
8. Implement reviews/ratings

---

**Ready to deploy? Choose your platform and go live! 🚀**

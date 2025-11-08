# Quick Start Guide - VIONA E-commerce

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Usage

### Public Site Features

#### Browsing Products
1. Visit the homepage
2. Scroll to "The Collection" section
3. View product details including:
   - Product image
   - Name and description
   - Price
   - Stock availability
   - Featured badge (if applicable)

#### Shopping Cart
1. Click "Add" button on any product
2. Cart sidebar opens automatically
3. Adjust quantities using +/- buttons
4. Remove items with trash icon
5. View total price
6. Click "Checkout" (demo mode)

#### Navigation
- **Home**: Hero section with brand message
- **Collection**: Browse all products
- **About**: Learn about VIONA
- **Contact**: Contact information

### Admin Panel Features

#### Login to Admin
1. Click "Admin" in the header
2. Enter password: `viona2024`
3. Click "Sign In"

#### Manage Products
1. Navigate to "Ürünler" (Products)
2. **Add New Product**:
   - Fill in product details
   - Add image URL
   - Set stock quantity
   - Mark as featured (optional)
   - Click "Ürün Ekle"
3. **Edit Product**:
   - Click edit icon on any product
   - Modify details
   - Click "Kaydet" to save
4. **Delete Product**:
   - Click trash icon
   - Confirm deletion

#### Manage Settings
1. Navigate to "Ayarlar" (Settings)
2. Click "Düzenle" (Edit)
3. Update:
   - Logo emoji
   - Site name
   - Slogan
   - About text
   - Contact information
4. Click "Kaydet" (Save)

## Project Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## Common Tasks

### Adding a New Product via Admin
1. Login to admin panel
2. Go to Products section
3. Fill the "New Product" form:
   - **Name**: Product name in Turkish
   - **Price**: Numeric value (₺)
   - **Image URL**: Direct link to image
   - **Stock**: Available quantity
   - **Description**: Product details
   - **Featured**: Check for homepage display
4. Click "Ürün Ekle"

### Customizing Site Settings
1. Admin panel → Ayarlar
2. Click "Düzenle"
3. Modify any field
4. Click "Kaydet"
5. View changes on public site

### Testing the Cart
1. Browse products on homepage
2. Add multiple items to cart
3. Test quantity changes
4. Test item removal
5. View total calculation
6. Test checkout (shows alert)

## Keyboard Shortcuts

- **ESC**: Close mobile menu or cart
- **ENTER**: Submit login form

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
npm run dev -- --port 3001
```

### Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Clean build
npm run build -- --force
```

## Image URLs

For testing, use Unsplash images:
```
https://images.unsplash.com/photo-[ID]?w=500
```

Example IDs:
- `1566150905458-1bf1fc113f0d` (beaded bag)
- `1590874103328-eac38a683ce7` (vintage clutch)
- `1564422167509-4f3a6833fb41` (mini bag)

## Tips

### Design Consistency
- Use uppercase text for headings
- Maintain wide letter-spacing (tracking)
- Stick to neutral color palette
- Keep imagery high-quality

### Product Photography
- Use consistent aspect ratio
- High resolution (minimum 500px width)
- Clean backgrounds
- Good lighting

### Admin Best Practices
- Regular backups (export data)
- Update stock quantities
- Keep product descriptions concise
- Use featured products strategically

### Performance
- Optimize images before upload
- Limit products per page (pagination)
- Use WebP format for images

## Mobile Testing

Test on various screen sizes:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Next Steps

1. **Customize Content**:
   - Replace demo products
   - Update site settings
   - Add real contact info

2. **Enhance Features**:
   - Add more product fields
   - Implement search
   - Add product categories

3. **Deploy**:
   - Choose hosting (Vercel, Netlify)
   - Set up domain
   - Configure analytics

## Need Help?

- Check `PROJECT_STRUCTURE.md` for architecture details
- Review component files for implementation
- Check browser console for errors
- Verify Node.js version (18+)

## Quick Reference

| Action | Path | Password |
|--------|------|----------|
| Public Site | `/` | - |
| Admin Login | `/admin-login` | viona2024 |
| Products | `/admin/products` | (after login) |
| Settings | `/admin/settings` | (after login) |

---

**Happy building with VIONA! ✨**

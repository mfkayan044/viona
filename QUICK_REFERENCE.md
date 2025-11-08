# 📌 VIONA Quick Reference Card

## 🚀 Quick Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔑 Admin Access

- **URL**: http://localhost:3000/admin-login
- **Password**: `viona2024`

## 📂 File Locations

| What | Where |
|------|-------|
| Add Component | `src/components/` |
| Add Page | `src/pages/` |
| Add Hook | `src/hooks/` |
| Global State | `src/contexts/AppContext.jsx` |
| Styles | `src/styles/index.css` |
| Constants | `src/utils/constants.js` |
| Helpers | `src/utils/helpers.js` |

## 🎨 Styling Classes

```jsx
// Buttons
className="btn-primary"        // Black button
className="btn-outline"        // Outline button

// Inputs
className="input-field"        // Standard input

// Custom
className="uppercase tracking-widest"  // VIONA style
className="font-light"         // Thin font
```

## 🛣️ Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Home | Public |
| `/admin-login` | Login | Public |
| `/admin/products` | Products | Admin |
| `/admin/settings` | Settings | Admin |

## 🪝 Custom Hooks

```jsx
// In components
const { cart, addToCart, products } = useApp();

// State management
const { cart, addToCart, removeFromCart } = useCart();
const { products, addProduct, updateProduct } = useProducts();
const { isOpen, toggle, close } = useMobileMenu();
```

## 📦 Import Examples

```jsx
// Components
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';

// Hooks
import { useApp } from '../contexts/AppContext';
import { useCart } from '../hooks/useCart';

// Icons
import { ShoppingBag, Menu, X } from 'lucide-react';

// Router
import { useNavigate, useLocation } from 'react-router-dom';
```

## 🎯 Common Tasks

### Add New Product (Admin)
1. Login → Products
2. Fill form
3. Click "Ürün Ekle"

### Update Settings (Admin)
1. Login → Ayarlar
2. Click "Düzenle"
3. Modify fields
4. Click "Kaydet"

### Add New Component
```jsx
// src/components/MyComponent.jsx
import React from 'react';
import { useApp } from '../contexts/AppContext';

const MyComponent = () => {
  const { state } = useApp();
  
  return (
    <div className="container mx-auto">
      {/* Your code */}
    </div>
  );
};

export default MyComponent;
```

### Add New Page
```jsx
// 1. Create page in src/pages/MyPage.jsx
// 2. Import in App.jsx
import MyPage from './pages/MyPage';

// 3. Add route
<Route path="/my-page" element={<MyPage />} />
```

## 🎨 Design Tokens

```javascript
// Colors
bg-black          // #000000
bg-white          // #FFFFFF
bg-neutral-50     // Very light gray
text-neutral-700  // Medium gray

// Spacing
px-6 py-4         // Standard padding
gap-4             // Standard gap
mb-8              // Standard margin

// Typography
text-sm           // Small text
text-lg           // Large text
uppercase         // UPPERCASE
tracking-widest   // Wide spacing
font-light        // Thin font
```

## 🔧 VS Code Tips

- **Format**: `Shift + Alt + F`
- **Quick Fix**: `Ctrl + .`
- **Search Files**: `Ctrl + P`
- **Search Text**: `Ctrl + Shift + F`
- **Multi-cursor**: `Alt + Click`

## 📱 Test Viewports

```
Mobile:  375px, 414px
Tablet:  768px, 1024px
Desktop: 1280px, 1920px
```

## 🐛 Debug

```jsx
// Console log
console.log('Debug:', variable);

// React DevTools
// Install extension → Inspect components → View state
```

## 📝 Git Workflow

```bash
git add .
git commit -m "Your message"
git push origin main
```

## 🚀 Deploy Checklist

- [ ] Update admin password
- [ ] Add real products
- [ ] Update contact info
- [ ] Test all features
- [ ] Run `npm run build`
- [ ] Deploy to Vercel/Netlify

## 📚 Documentation

- `README.md` - Project overview
- `QUICK_START.md` - Getting started
- `PROJECT_STRUCTURE.md` - Architecture
- `DEPLOYMENT.md` - Deploy guide
- `SETUP_COMPLETE.md` - Setup summary

## 🔗 Helpful Links

- React: https://react.dev
- Tailwind: https://tailwindcss.com
- Vite: https://vitejs.dev
- React Router: https://reactrouter.com
- Lucide Icons: https://lucide.dev

---

**Pro Tip**: Keep this file open in a split view while coding! 💡

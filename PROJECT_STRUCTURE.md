# VIONA E-commerce Project Structure

## Overview
Modern, elegant e-commerce platform for handcrafted beaded bags built with React, Vite, and Tailwind CSS.

## Folder Structure

```
viona/
├── node_modules/           # Dependencies (auto-generated)
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── admin/          # Admin-specific components
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── AdminProducts.jsx
│   │   │   └── AdminSettings.jsx
│   │   ├── Cart.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   └── ProductCard.jsx
│   ├── contexts/           # React contexts
│   │   └── AppContext.jsx  # Global state management
│   ├── hooks/              # Custom hooks
│   │   ├── useCart.js
│   │   ├── useMobileMenu.js
│   │   └── useProducts.js
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminLogin.jsx
│   │   └── HomePage.jsx
│   ├── styles/             # CSS files
│   │   └── index.css       # Global styles with Tailwind
│   ├── utils/              # Utility functions
│   │   ├── constants.js    # Constants and configs
│   │   └── helpers.js      # Helper functions
│   ├── App.jsx             # Main App component with routing
│   └── main.jsx            # Entry point
├── .gitignore              # Git ignore rules
├── index.html              # HTML entry point
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project documentation
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration

```

## Key Features

### Components Architecture

#### Public Components
- **Header.jsx**: Navigation bar with cart and mobile menu
- **Footer.jsx**: Site footer with branding
- **ProductCard.jsx**: Reusable product display card
- **Cart.jsx**: Shopping cart sidebar

#### Admin Components
- **AdminSidebar.jsx**: Navigation for admin panel
- **AdminProducts.jsx**: Product management interface
- **AdminSettings.jsx**: Site settings management

### State Management
- **AppContext.jsx**: Centralized state using Context API
  - Cart management
  - Product management
  - Site settings
  - Admin authentication

### Custom Hooks
- **useCart.js**: Shopping cart logic
- **useProducts.js**: Product CRUD operations
- **useMobileMenu.js**: Mobile menu state and behavior

### Pages
- **HomePage.jsx**: Public-facing e-commerce site
- **AdminLogin.jsx**: Admin authentication page
- **AdminDashboard.jsx**: Admin panel layout

## Technology Stack

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

## Routes

- `/` - Home page
- `/admin-login` - Admin login
- `/admin/products` - Product management
- `/admin/settings` - Site settings

## Styling Approach

### Tailwind Configuration
- Custom tracking for letter-spacing
- Neutral color palette
- Responsive breakpoints

### CSS Utilities (in `index.css`)
- `.btn-primary` - Primary button style
- `.btn-outline` - Outline button style
- `.input-field` - Standard input field

## Development Guidelines

### Component Organization
- One component per file
- Use functional components with hooks
- Keep components focused and reusable

### State Management
- Use Context API for global state
- Local state for component-specific data
- Custom hooks for reusable logic

### Styling
- Use Tailwind utility classes
- Create custom classes for repeated patterns
- Maintain consistent spacing and typography

## Admin Access
- Password: `viona2024`
- Access via `/admin-login` route

## Environment

### Development
```bash
npm run dev
```
Runs on `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## Future Enhancements

### Potential Features
1. **Backend Integration**
   - API for product management
   - Database integration (Firebase, Supabase)
   - Order processing system

2. **Payment Integration**
   - Stripe or PayPal integration
   - Invoice generation
   - Email notifications

3. **User Features**
   - User authentication
   - Order history
   - Wishlist functionality

4. **Enhanced Admin**
   - Analytics dashboard
   - Order management
   - Customer management
   - Image upload

5. **Performance**
   - Image optimization
   - Lazy loading
   - Code splitting

6. **SEO**
   - Meta tags
   - Sitemap
   - Structured data

## File Naming Conventions

- Components: PascalCase (e.g., `ProductCard.jsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useCart.js`)
- Utilities: camelCase (e.g., `helpers.js`)
- Styles: kebab-case (e.g., `index.css`)

## Best Practices

1. **Components**: Keep them small and focused
2. **Props**: Use destructuring for cleaner code
3. **State**: Lift state up when needed, keep it local when possible
4. **Imports**: Group imports (React, libraries, local)
5. **Comments**: Add comments for complex logic
6. **Accessibility**: Use semantic HTML and ARIA labels
7. **Responsive**: Mobile-first design approach

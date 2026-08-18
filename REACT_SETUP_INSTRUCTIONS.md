# ZENNARA React - Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation Steps

```bash
# 1. Navigate to project directory
cd "c:\Users\Joel Khamala\Downloads\zennara v4"

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Vite will automatically open http://localhost:3000
```

## 📁 Project Structure Created

```
zennara v4/
├── src/                    # React source code
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── styles/            # Global styles
│   ├── data/              # Mock data
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
│   └── assets/            # Logos, images
├── index.html             # HTML template
├── package.json           # Dependencies
├── vite.config.js         # Vite configuration
└── README.md              # Project documentation
```

## 🔧 Available Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## 📦 What's Included

### Core Libraries
- ✅ **React 18.3** - Latest React with concurrent features
- ✅ **React Router v6** - Client-side routing
- ✅ **Vite** - Lightning-fast build tool
- ✅ **Framer Motion** - Smooth animations

### Features Set Up
- ✅ Path aliases (@components, @pages, etc.)
- ✅ Hot module replacement
- ✅ CSS Modules ready
- ✅ Production build optimization
- ✅ Source maps for debugging

## 🎨 Styling Approach

### CSS Architecture
We're keeping your existing CSS but organizing it better:

1. **Global Styles** (`src/styles/global.css`)
   - CSS variables
   - Reset/base styles
   - Typography

2. **Component Styles** (CSS Modules)
   - `Header.module.css`
   - `Button.module.css`
   - Scoped to component

3. **Shared Styles** (`src/styles/`)
   - `variables.css` - CSS custom properties
   - `animations.css` - Animation keyframes
   - `responsive.css` - Media queries

## 🧩 Component Structure

### Example: Button Component
```jsx
// src/components/common/Button/Button.jsx
import styles from './Button.module.css';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick 
}) {
  return (
    <button 
      className={styles[variant]} 
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Usage
```jsx
<Button variant="gold">Book a Viewing</Button>
<Button variant="outline">Learn More</Button>
```

## 🔄 Routing Structure

```jsx
// App.jsx routes
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/properties" element={<Properties />} />
  <Route path="/listings" element={<Listings />} />
  <Route path="/projects" element={<Projects />} />
  <Route path="/advisory" element={<Advisory />} />
  <Route path="/portal" element={<Portal />} />
  <Route path="/journal" element={<Journal />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/property/:id" element={<PropertyDetails />} />
</Routes>
```

## 🎯 Next Steps - Development Order

### Phase 1: Foundation (First)
1. ✅ Setup Vite + React
2. ⬜ Create Layout component (Header, Footer)
3. ⬜ Setup routing
4. ⬜ Create common components (Button, Card)

### Phase 2: Pages (Second)
5. ⬜ Convert Home page
6. ⬜ Convert Properties page
7. ⬜ Convert Listings page with filters
8. ⬜ Convert Projects page
9. ⬜ Convert Advisory page
10. ⬜ Convert other pages

### Phase 3: Features (Third)
11. ⬜ Implement property filters
12. ⬜ Add favorites functionality
13. ⬜ Implement search
14. ⬜ Add number counter animations
15. ⬜ Add scroll animations

### Phase 4: Polish (Last)
16. ⬜ Loading states
17. ⬜ Error handling
18. ⬜ Performance optimization
19. ⬜ SEO meta tags
20. ⬜ Testing

## 💡 Development Tips

### Hot Reload
Changes to React components automatically update in browser without refresh!

### CSS Modules Naming
```jsx
// ✅ Good
import styles from './Header.module.css';
<div className={styles.header}>

// ❌ Bad
<div className="header">  // Global class, avoid in components
```

### Import Aliases
```jsx
// ✅ Use aliases
import Header from '@components/common/Header';
import { useProperties } from '@hooks/useProperties';

// ❌ Avoid relative paths
import Header from '../../components/common/Header';
```

### Component Files
Keep one component per file with this structure:
```
Button/
├── Button.jsx
├── Button.module.css
└── index.js  // Re-export for clean imports
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in vite.config.js
server: {
  port: 3001,  // Change to different port
}
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
# Check for ESLint errors
npm run lint

# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

## 📚 Learning Resources

### React Docs
- [React 18 Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Vite Guide](https://vitejs.dev/guide/)

### Key Concepts to Learn
1. **Components** - Building blocks
2. **Props** - Passing data
3. **State** - Component data
4. **Hooks** - useState, useEffect, etc.
5. **Routing** - Page navigation
6. **CSS Modules** - Scoped styling

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates a `dist/` folder with optimized files.

### Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Build command
npm run build

# Publish directory
dist
```

## 🔐 Environment Variables

Create `.env` file for API keys:
```env
VITE_API_URL=https://api.zennara.com
VITE_GOOGLE_MAPS_KEY=your_key_here
```

Access in code:
```jsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## ✅ Checklist Before Going Live

- [ ] All pages converted to React
- [ ] Animations working smoothly
- [ ] Forms functional
- [ ] Filters working
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance optimized
- [ ] SEO meta tags added
- [ ] Error boundaries in place
- [ ] Loading states implemented
- [ ] Production build tested
- [ ] Analytics integrated

## 🆘 Need Help?

Common issues and solutions:

1. **Blank page** → Check browser console for errors
2. **Styles not working** → Check CSS Module imports
3. **Routing not working** → Ensure BrowserRouter wraps App
4. **Images not loading** → Move to `/public/assets/`
5. **Slow dev server** → Clear `.vite` cache folder

---

## 🎉 You're Ready!

Run `npm install` then `npm run dev` to start development!

The React version will be faster, more maintainable, and easier to scale than the static HTML version.

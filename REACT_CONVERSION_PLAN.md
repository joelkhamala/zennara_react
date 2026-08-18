# ZENNARA React Conversion Plan

## Overview
Converting the static HTML ZENNARA website to a modern React application.

## Technology Stack

### Core
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool (faster than CRA)

### Styling
- **CSS Modules** or **Styled Components** - Scoped styling
- Keep existing CSS architecture (variables, animations)

### State Management
- **React Context** - Global state (filters, favorites, user)
- **React Query** or **SWR** - Data fetching & caching

### Additional Libraries
- **Framer Motion** - Enhanced animations
- **React Hook Form** - Form handling
- **Intersection Observer API** - Scroll animations (keep existing)

## Project Structure

```
zennara-react/
├── public/
│   ├── assets/
│   │   ├── logos/
│   │   └── images/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.module.css
│   │   │   │   └── MobileMenu.jsx
│   │   │   ├── Footer/
│   │   │   ├── Button/
│   │   │   ├── SearchForm/
│   │   │   └── AnimatedNumber/
│   │   ├── home/
│   │   │   ├── Hero.jsx
│   │   │   ├── PropertyGrid.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   └── StatsSection.jsx
│   │   ├── properties/
│   │   │   ├── PropertyCard.jsx
│   │   │   ├── PropertyFilters.jsx
│   │   │   └── PropertyGrid.jsx
│   │   ├── listings/
│   │   ├── projects/
│   │   ├── advisory/
│   │   └── portal/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Properties.jsx
│   │   ├── Listings.jsx
│   │   ├── Projects.jsx
│   │   ├── Advisory.jsx
│   │   ├── Portal.jsx
│   │   ├── Journal.jsx
│   │   ├── Contact.jsx
│   │   └── PropertyDetails.jsx
│   ├── hooks/
│   │   ├── useScrollAnimation.js
│   │   ├── useCountAnimation.js
│   │   ├── useFilters.js
│   │   └── useFavorites.js
│   ├── context/
│   │   ├── FavoritesContext.jsx
│   │   └── FilterContext.jsx
│   ├── utils/
│   │   ├── animations.js
│   │   └── helpers.js
│   ├── data/
│   │   ├── properties.js
│   │   ├── projects.js
│   │   └── listings.js
│   ├── styles/
│   │   ├── variables.css
│   │   ├── global.css
│   │   ├── animations.css
│   │   └── responsive.css
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
├── package.json
├── vite.config.js
└── README.md
```

## Conversion Strategy

### Phase 1: Setup & Core (Day 1)
1. Initialize Vite + React project
2. Setup folder structure
3. Create base layout (Header, Footer)
4. Setup routing
5. Convert CSS to modules
6. Create common components (Button, Card, etc.)

### Phase 2: Pages (Day 2-3)
1. Convert Home page
2. Convert Properties page
3. Convert Listings page
4. Convert Projects page
5. Convert Advisory page
6. Convert other pages

### Phase 3: Interactivity (Day 4)
1. Implement filters with state
2. Add favorites functionality
3. Create search functionality
4. Add animations (number counters, scroll effects)
5. Form handling

### Phase 4: Polish (Day 5)
1. Performance optimization
2. Lazy loading
3. SEO (React Helmet)
4. Error boundaries
5. Loading states
6. Testing

## Key Components to Create

### 1. Layout Components
```jsx
// Layout.jsx
<Layout>
  <Header />
  <main>{children}</main>
  <Footer />
</Layout>
```

### 2. Reusable Components
- Button (gold-btn, outline-btn, text-btn)
- PropertyCard
- ProjectCard
- FilterBar
- SearchForm
- AnimatedNumber
- Toast
- Modal

### 3. Page Components
- Home
- Properties (curated)
- Listings (searchable)
- Projects
- Advisory
- Portal
- Journal
- Contact
- PropertyDetails

## Data Management

### Mock Data (Initial)
```javascript
// data/properties.js
export const properties = [
  {
    id: 1,
    title: "The Olive House",
    location: "Karen · Nairobi",
    price: 145000000,
    beds: 5,
    baths: 6,
    sqm: 1180,
    year: 2024,
    featured: true,
    images: [...],
    description: "...",
  },
  // ...
];
```

### API Integration (Future)
```javascript
// hooks/useProperties.js
export function useProperties(filters) {
  return useQuery(['properties', filters], () =>
    fetch('/api/properties').then(res => res.json())
  );
}
```

## Routing Structure

```jsx
// routes.jsx
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
  <Route path="*" element={<NotFound />} />
</Routes>
```

## State Management

### Context Example
```jsx
// context/FavoritesContext.jsx
export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  
  const addFavorite = (id) => {
    setFavorites([...favorites, id]);
  };
  
  const removeFavorite = (id) => {
    setFavorites(favorites.filter(f => f !== id));
  };
  
  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
```

## Animation Conversion

### Number Counter Hook
```jsx
// hooks/useCountAnimation.js
export function useCountAnimation(target, duration = 2000) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Animation logic here
  }, [target]);
  
  return count;
}
```

### Scroll Animation Hook
```jsx
// hooks/useScrollAnimation.js
export function useScrollAnimation(ref) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(/* ... */);
    // Observer logic
  }, [ref]);
  
  return isVisible;
}
```

## Performance Optimizations

1. **Code Splitting**
```jsx
const Properties = lazy(() => import('./pages/Properties'));
```

2. **Image Optimization**
```jsx
<img 
  src={property.image} 
  loading="lazy"
  srcSet={`${property.image}?w=400 400w, ${property.image}?w=800 800w`}
/>
```

3. **Memoization**
```jsx
const filteredProperties = useMemo(() => 
  properties.filter(p => /* filter logic */),
  [properties, filters]
);
```

## Migration Benefits

### Advantages of React Version
✅ **Component Reusability** - DRY principle, no duplication  
✅ **Better State Management** - Centralized data flow  
✅ **Easier Maintenance** - Single source of truth  
✅ **Better Performance** - Virtual DOM, code splitting  
✅ **Modern Dev Experience** - Hot reload, better debugging  
✅ **Easier Testing** - Component-based testing  
✅ **Type Safety** - Can add TypeScript later  
✅ **SEO** - Can add Next.js for SSR later  

### What We Keep
✅ Design & styling (CSS)  
✅ Animation system  
✅ Current functionality  
✅ All features  

### What Improves
✅ Code organization  
✅ Component reusability  
✅ State management  
✅ Developer experience  
✅ Maintainability  
✅ Scalability  

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

## Next Steps After Conversion

1. **TypeScript Migration** - Add type safety
2. **Next.js** - Add SSR for better SEO
3. **API Integration** - Connect to backend
4. **Authentication** - User login for Portal
5. **CMS Integration** - Content management
6. **Testing** - Unit & integration tests
7. **CI/CD** - Automated deployment

## Estimated Timeline

- **Setup**: 2-4 hours
- **Core Components**: 1 day
- **Page Conversion**: 2-3 days
- **Interactivity**: 1-2 days
- **Polish & Testing**: 1 day

**Total**: 5-7 days for full conversion

## Questions to Consider

1. Do you want TypeScript from the start?
2. Do you need SSR/SEO (Next.js)?
3. Will there be a backend API?
4. Do you need authentication?
5. What's the hosting plan?

---

Ready to proceed with the React conversion?

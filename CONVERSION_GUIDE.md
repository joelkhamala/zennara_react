# HTML Page Conversion Guide

## 🎯 Objective
Convert all existing HTML pages to use the new modular CSS/JS structure with unified navigation.

## 📋 Conversion Checklist

For each HTML file, follow these steps:

### 1. Update `<head>` Section

**REMOVE:**
- All inline `<style>` tags

**REPLACE WITH:**
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

<!-- Core CSS -->
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/buttons.css">
<link rel="stylesheet" href="assets/css/header.css">
<link rel="stylesheet" href="assets/css/footer.css">
<link rel="stylesheet" href="assets/css/hero.css">
<link rel="stylesheet" href="assets/css/forms.css">
<link rel="stylesheet" href="assets/css/components.css">
<link rel="stylesheet" href="assets/css/cards.css">
<link rel="stylesheet" href="assets/css/filters.css">
<link rel="stylesheet" href="assets/css/responsive.css">
```

### 2. Replace Header

**REMOVE:**
```html
<header class="site-header">
  <!-- ... entire header HTML ... -->
</header>
<div class="mobile-menu">
  <!-- ... entire mobile menu ... -->
</div>
```

**REPLACE WITH:**
```html
<div id="header-placeholder"></div>
```

### 3. Keep Main Content
Keep all the main content area as is.

### 4. Replace Footer

**REMOVE:**
```html
<footer>
  <!-- ... entire footer HTML ... -->
</footer>
<div class="toast" id="toast">...</div>
```

**REPLACE WITH:**
```html
<div id="footer-placeholder"></div>
```

### 5. Update JavaScript Section

**REMOVE:**
- All inline `<script>` tags with common functionality

**REPLACE WITH:**
```html
<!-- Core JavaScript -->
<script src="assets/js/utils.js"></script>
<script src="assets/js/navigation.js"></script>
<script src="assets/js/toast.js"></script>
<script src="assets/js/modal.js"></script>

<!-- Load includes -->
<script>
  fetch('includes/header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
    });
  
  fetch('includes/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    });
</script>

<!-- Page-specific JavaScript -->
<script>
  (function() {
    'use strict';
    // Keep page-specific code here
  })();
</script>
```

## 📄 Page-by-Page Conversion

### Pages to Convert:
1. ✅ index.html - Home page
2. ✅ properties.html - Properties listing
3. ✅ listings.html - Live listings
4. ✅ projects.html - Development projects
5. ✅ advisory.html - Advisory services
6. ✅ portal.html - Client portal
7. ✅ journal.html - Blog/Journal
8. ✅ contact.html - Contact page
9. ✅ property_details.html - Property details
10. ✅ ui.html - UI components

## 🔍 What to Keep in Page-Specific Code

### Keep These Scripts:
- Data arrays (property listings, projects, blog posts)
- Filter and search logic
- Pagination functionality
- Form submissions
- Gallery/lightbox interactions
- Any unique page functionality

### Remove These Scripts:
- Header scroll effects (now in navigation.js)
- Mobile menu toggle (now in navigation.js)
- Toast notifications initialization (now in toast.js)
- Modal open/close (now in modal.js)

## ⚠️ Important Notes

1. **Test each page** after conversion to ensure:
   - Navigation works correctly
   - Active page is highlighted
   - Mobile menu functions properly
   - All page-specific features still work

2. **Path corrections**: Ensure all asset paths are relative to the HTML file location

3. **Local Development**: Since we're using `fetch()` for includes, you'll need to:
   - Run a local web server (e.g., VS Code Live Server, Python SimpleHTTPServer)
   - OR use a different method for includes (PHP, server-side includes, build tools)

## 🚀 Quick Conversion Template

Use this template structure for all pages:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Page Title] · ZENNARA</title>
  
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Core CSS -->
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/buttons.css">
  <link rel="stylesheet" href="assets/css/header.css">
  <link rel="stylesheet" href="assets/css/footer.css">
  <link rel="stylesheet" href="assets/css/hero.css">
  <link rel="stylesheet" href="assets/css/forms.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <link rel="stylesheet" href="assets/css/cards.css">
  <link rel="stylesheet" href="assets/css/filters.css">
  <link rel="stylesheet" href="assets/css/responsive.css">
  
  <!-- Page-specific CSS (if needed) -->
  <style>
    /* Add any page-unique styles here */
  </style>
</head>
<body>
  
  <!-- Header -->
  <div id="header-placeholder"></div>
  
  <main>
    <!-- Page content here -->
  </main>
  
  <!-- Footer -->
  <div id="footer-placeholder"></div>
  
  <!-- Core JavaScript -->
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/navigation.js"></script>
  <script src="assets/js/toast.js"></script>
  <script src="assets/js/modal.js"></script>
  
  <!-- Load includes -->
  <script>
    fetch('includes/header.html')
      .then(response => response.text())
      .then(data => document.getElementById('header-placeholder').innerHTML = data);
    
    fetch('includes/footer.html')
      .then(response => response.text())
      .then(data => document.getElementById('footer-placeholder').innerHTML = data);
  </script>
  
  <!-- Page-specific JavaScript -->
  <script>
    (function() {
      'use strict';
      // Page-specific code
    })();
  </script>
</body>
</html>
```

## ✅ Verification Steps

After converting each page:

1. Open the page in a browser
2. Check navigation appears and links work
3. Test mobile menu toggle
4. Verify active page highlighting
5. Test all page-specific features
6. Check console for any errors
7. Test on different screen sizes

## 🛠️ Troubleshooting

### Issue: Includes not loading
**Solution**: You need a local web server. Use:
- VS Code Live Server extension
- `python -m http.server 8000`
- `npx serve`

### Issue: Styles not applying
**Solution**: Check CSS file paths are correct relative to HTML file

### Issue: Navigation script errors
**Solution**: Ensure navigation.js loads after header HTML is inserted

## 📦 Alternative: Using a Build Tool

For production, consider using a build tool:
- **Parcel**: Zero-config bundler
- **Webpack**: Full-featured bundler
- **Gulp**: Task runner for includes
- **11ty**: Static site generator

This allows for true template includes without JavaScript fetch().

/**
 * ZENNARA Includes Loader
 * Loads header and footer HTML includes
 */

(function() {
  'use strict';

  // Load header
  function loadHeader() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
      fetch('includes/header.html')
        .then(response => response.text())
        .then(data => {
          headerPlaceholder.innerHTML = data;
          // Trigger navigation initialization
          if (window.initNavigation) {
            window.initNavigation();
          }
        })
        .catch(error => console.error('Error loading header:', error));
    }
  }

  // Load footer
  function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
      fetch('includes/footer.html')
        .then(response => response.text())
        .then(data => {
          footerPlaceholder.innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      loadHeader();
      loadFooter();
    });
  } else {
    loadHeader();
    loadFooter();
  }

})();

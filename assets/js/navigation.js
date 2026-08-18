/**
 * ZENNARA Navigation Module
 * Handles header scroll effects and mobile menu toggle
 */

(function() {
  'use strict';

  // Header scroll effect
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(function(link) {
      link.addEventListener('click', function() {
        menuToggle.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Set active navigation link based on current page
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-menu a');
    
    navLinks.forEach(function(link) {
      const linkPath = link.getAttribute('href');
      if (linkPath && currentPath.includes(linkPath)) {
        link.classList.add('active');
      }
    });
  }

  // Initialize on page load
  setActiveNav();

})();

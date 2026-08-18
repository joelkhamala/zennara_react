/**
 * ZENNARA Animation & Performance Utilities
 * Shared animations and optimizations for all pages
 */

(function(window) {
  'use strict';

  // === PERFORMANCE: Check for passive event listener support ===
  const passiveSupported = (() => {
    let supported = false;
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: () => { supported = true; }
      });
      window.addEventListener('test', null, opts);
      window.removeEventListener('test', null, opts);
    } catch(e) {}
    return supported;
  })();

  const eventOpts = passiveSupported ? { passive: true } : false;

  // === NUMBER COUNTER ANIMATION ===
  function animateCounter(element) {
    if (element.classList.contains('counted')) return;
    
    const targetStr = element.getAttribute('data-target');
    if (!targetStr) return;

    // Extract number from string (handles formats like "1200+", "98%", "14-18%", etc.)
    const numMatch = targetStr.match(/[\d,]+/);
    if (!numMatch) return;

    const target = parseInt(numMatch[0].replace(/,/g, ''));
    const fullText = element.getAttribute('data-target');
    const duration = 2000; // 2 seconds
    const frameDuration = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4); // Smooth easing
      const current = Math.round(easeOutQuart * target);
      
      // Format with commas if original had them
      let formatted = current.toString();
      if (fullText.includes(',') && current >= 1000) {
        formatted = current.toLocaleString();
      }
      
      // Replace number in original text pattern while preserving symbols
      let displayText = fullText.replace(/[\d,]+/, formatted);
      element.textContent = displayText;

      if (frame === totalFrames) {
        clearInterval(counter);
        element.textContent = fullText;
        element.classList.add('counted');
      }
    }, frameDuration);
  }

  // === INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ===
  function initScrollAnimations() {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
          entry.target.classList.add('animated');
          
          // Animate numbers in this section
          const numbers = entry.target.querySelectorAll('[data-target]');
          numbers.forEach(num => {
            if (!num.classList.contains('counted')) {
              animateCounter(num);
            }
          });

          // Stagger children animations with different selectors
          const animatableChildren = entry.target.querySelectorAll(
            '.process-step, .team-card, .testimonial-card, ' +
            '.stat-item, .property-card, .project-card, ' +
            '.feature-item, .benefit-card, .stats > div'
          );
          
          animatableChildren.forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('fade-in-up');
            }, index * 80); // Stagger by 80ms
          });
          
          // Unobserve after animating to save resources
          animateOnScroll.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all animatable sections
    const sections = document.querySelectorAll(
      '.page-hero-stats, .stats-section, .process-section, ' +
      '.team-section, .testimonial-section, .stats, ' +
      '.property-features, .project-stats, .hero-stats, ' +
      '.features, .detail-meta .features'
    );
    
    sections.forEach(section => {
      if (section) animateOnScroll.observe(section);
    });
    
    // Also trigger animation for elements already in viewport on load
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const isInViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
      
      if (isInViewport) {
        section.classList.add('animated');
        const numbers = section.querySelectorAll('[data-target]');
        numbers.forEach(num => {
          if (!num.classList.contains('counted')) {
            animateCounter(num);
          }
        });
      }
    });
  }

  // === OPTIMIZED SCROLL HANDLER ===
  function initOptimizedScroll(callback) {
    let ticking = false;
    
    function update() {
      callback();
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, eventOpts);
  }

  // === LAZY LOAD IMAGES ===
  function initLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading supported
      const images = document.querySelectorAll('img[data-src]');
      images.forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      // Fallback to Intersection Observer
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  // === PRELOAD CRITICAL RESOURCES ===
  function preloadResources(resources) {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = resource.type || 'image';
      link.href = resource.url;
      if (resource.type === 'font') {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }

  // === DEBOUNCE UTILITY ===
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // === INITIALIZE ON DOM READY ===
  function init() {
    initScrollAnimations();
    initLazyLoading();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // === EXPOSE PUBLIC API ===
  window.ZennaraAnimations = {
    animateCounter,
    initScrollAnimations,
    initOptimizedScroll,
    initLazyLoading,
    preloadResources,
    debounce,
    eventOpts
  };

})(window);

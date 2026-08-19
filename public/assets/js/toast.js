/**
 * ZENNARA Toast Notification Module
 * Handles toast notifications across the site
 */

const ZennaraToast = (function() {
  'use strict';

  let toastElement = null;

  function init() {
    toastElement = document.getElementById('toast');
    if (toastElement) {
      toastElement.addEventListener('click', function() {
        hide();
      });
    }
  }

  function show(message, duration = 3000) {
    if (!toastElement) return;
    
    toastElement.textContent = message;
    toastElement.classList.add('show');
    
    if (duration > 0) {
      setTimeout(function() {
        hide();
      }, duration);
    }
  }

  function hide() {
    if (toastElement) {
      toastElement.classList.remove('show');
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    show: show,
    hide: hide
  };

})();

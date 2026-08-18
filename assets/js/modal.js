/**
 * ZENNARA Modal Module
 * Handles modal and lightbox functionality
 */

const ZennaraModal = (function() {
  'use strict';

  function open(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function close(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  function init() {
    // Handle modal close buttons
    const closeButtons = document.querySelectorAll('.modal-overlay .close, .lightbox .close');
    closeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const modal = btn.closest('.modal-overlay, .lightbox');
        if (modal && modal.id) {
          close(modal.id);
        }
      });
    });

    // Close modal when clicking overlay
    const overlays = document.querySelectorAll('.modal-overlay, .lightbox');
    overlays.forEach(function(overlay) {
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          close(overlay.id);
        }
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    open: open,
    close: close
  };

})();

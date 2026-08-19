/**
 * ZENNARA Utility Functions
 * Common utility functions used across the site
 */

const ZennaraUtils = (function() {
  'use strict';

  /**
   * Format price with currency
   */
  function formatPrice(price, currency = 'KES') {
    if (currency === 'KES') {
      return 'KSh ' + price.toLocaleString();
    }
    return '$' + price.toLocaleString();
  }

  /**
   * Debounce function
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;
      const later = function() {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Smooth scroll to element
   */
  function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 80; // header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  /**
   * Get query parameter from URL
   */
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  /**
   * Toggle element class
   */
  function toggleClass(element, className) {
    if (element) {
      element.classList.toggle(className);
    }
  }

  /**
   * Add event listener to multiple elements
   */
  function addEventListenerList(list, event, fn) {
    for (let i = 0, len = list.length; i < len; i++) {
      list[i].addEventListener(event, fn, false);
    }
  }

  return {
    formatPrice: formatPrice,
    debounce: debounce,
    scrollToElement: scrollToElement,
    getQueryParam: getQueryParam,
    toggleClass: toggleClass,
    addEventListenerList: addEventListenerList
  };

})();

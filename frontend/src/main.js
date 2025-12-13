import './style.css';
import i18next from './i18n.js';
import { $, on, addClass, removeClass } from './utils.js';
import api from './api.js';

// Initialize i18next
i18next.init;

// Function to update all translated elements
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = i18next.t(key);
  });
}

// Initialize translations on page load
updateTranslations();

// Setup language selector
const languageSelector = $('#language-selector');
if (languageSelector) {
  // Set current language
  languageSelector.value = i18next.language;

  // Change language on selection
  on(languageSelector, 'change', (e) => {
    const newLang = e.target.value;
    localStorage.setItem('language', newLang);
    i18next.changeLanguage(newLang, () => {
      updateTranslations();
      // Update HTML lang attribute
      document.documentElement.lang = newLang;
    });
  });
}

// Setup login button
const loginBtn = $('#login-btn');
if (loginBtn) {
  on(loginBtn, 'click', () => {
    window.location.href = '/login.html';
  });
}

// Setup CTA button
const ctaBtn = $('#cta-btn');
if (ctaBtn) {
  on(ctaBtn, 'click', () => {
    window.location.href = '/app.html';
  });
}

// Mobile menu toggle (optional future feature)
const navMenu = $('#nav-menu');
if (navMenu) {
  // Add active state management for nav links
  document.querySelectorAll('.nav-menu a').forEach((link) => {
    on(link, 'click', () => {
      document.querySelectorAll('.nav-menu a').forEach((a) => {
        removeClass(a, 'active');
      });
      addClass(link, 'active');
    });
  });
}

console.log('✨ Frontend loaded successfully!');
console.log('🌐 Current language:', i18next.language);
console.log('🔧 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');

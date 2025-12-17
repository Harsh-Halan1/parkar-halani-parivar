import './style.css';
import i18next from './i18n.js';
import { $, on, addClass, removeClass } from './utils.js';
import api, { auth } from './api.js';
import ModalManager from './modal.js';

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

// Custom language dropdowns (navbar + sidebar)
function setLanguage(newLang) {
    localStorage.setItem('language', newLang);
    i18next.changeLanguage(newLang, () => {
        updateTranslations();
        document.documentElement.lang = newLang;
        const langCurrent = $('#lang-current');
        const sidebarLangCurrent = $('#sidebar-lang-current');
        if (langCurrent) langCurrent.textContent = menuLabelFor(newLang);
        if (sidebarLangCurrent) sidebarLangCurrent.textContent = menuLabelFor(newLang);
    });
}

function menuLabelFor(code) {
    switch (code) {
        case 'gu': return 'Gujarati (ગુજરાતી)';
        case 'hi': return 'Hindi (हिन्दी)';
        default: return 'English';
    }
}

function initLangDropdown(dropdownId, triggerId, menuId) {
    const dropdown = $(dropdownId);
    const trigger = $(triggerId);
    const menu = $(menuId);
    if (!dropdown || !trigger || !menu) return;

    // Set current label
    const currentLabel = dropdown.querySelector('span#' + (dropdownId.includes('sidebar') ? 'sidebar-lang-current' : 'lang-current'));
    if (currentLabel) currentLabel.textContent = menuLabelFor(i18next.language);

    on(trigger, 'click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('active');
        dropdown.setAttribute('aria-expanded', menu.classList.contains('active'));
    });

    menu.querySelectorAll('.lang-item').forEach((item) => {
        on(item, 'click', () => {
            const code = item.getAttribute('data-lang');
            setLanguage(code);
            menu.classList.remove('active');
            dropdown.setAttribute('aria-expanded', 'false');
        });
    });
}

initLangDropdown('#lang-dropdown', '#lang-trigger', '#lang-menu');
initLangDropdown('#sidebar-lang-dropdown', '#sidebar-lang-trigger', '#sidebar-lang-menu');

// Close dropdowns when clicking outside or pressing Escape
on(document, 'click', (e) => {
    ['#lang-menu', '#sidebar-lang-menu'].forEach((id) => {
        const el = $(id);
        if (el) el.classList.remove('active');
    });
    ['#lang-dropdown', '#sidebar-lang-dropdown'].forEach((id) => {
        const dd = $(id);
        if (dd) dd.setAttribute('aria-expanded', 'false');
    });
});

on(document, 'keydown', (e) => {
    if (e.key === 'Escape') {
        ['#lang-menu', '#sidebar-lang-menu'].forEach((id) => {
            const el = $(id);
            if (el) el.classList.remove('active');
        });
        ['#lang-dropdown', '#sidebar-lang-dropdown'].forEach((id) => {
            const dd = $(id);
            if (dd) dd.setAttribute('aria-expanded', 'false');
        });
    }
});

// Sidebar toggle logic
const sidebar = $('#sidebar');
const sidebarToggle = $('#sidebar-toggle');
const sidebarClose = $('#sidebar-close');
if (sidebar && sidebarToggle && sidebarClose) {
    on(sidebarToggle, 'click', () => {
        addClass(sidebar, 'active');
        sidebarToggle.setAttribute('aria-expanded', 'true');
    });
    on(sidebarClose, 'click', () => {
        removeClass(sidebar, 'active');
        sidebarToggle.setAttribute('aria-expanded', 'false');
    });
    // Close sidebar when clicking nav links
    document.querySelectorAll('.sidebar-nav a').forEach((link) => {
        on(link, 'click', () => {
            removeClass(sidebar, 'active');
            sidebarToggle.setAttribute('aria-expanded', 'false');
        });
    });
    // Sync sidebar language selector
    const sidebarLang = $('#sidebar-language-selector');
    if (sidebarLang) {
        sidebarLang.value = i18next.language;
        on(sidebarLang, 'change', (e) => {
            const newLang = e.target.value;
            localStorage.setItem('language', newLang);
            i18next.changeLanguage(newLang, () => {
                updateTranslations();
                document.documentElement.lang = newLang;
            });
        });
    }
    // Sidebar login mirrors main login
    const sidebarLogin = $('#sidebar-login');
    if (sidebarLogin) {
        on(sidebarLogin, 'click', () => {
            removeClass(sidebar, 'active');
            sidebarToggle.setAttribute('aria-expanded', 'false');
            modals.openLogin();
        });
    }
}

// Initialize modal manager
const modals = new ModalManager();

// Setup login button - now opens modal instead of navigating
const loginBtn = $('#login-btn');
if (loginBtn) {
    on(loginBtn, 'click', () => {
        modals.openLogin();
    });
}

// Setup CTA button - now opens signup modal instead of navigating
const ctaBtn = $('#cta-btn');
if (ctaBtn) {
    on(ctaBtn, 'click', () => {
        modals.openSignup();
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

// UI state management
export function updateAuthUI() {
    const isAuth = auth.isAuthenticated();
    const user = auth.getUser();

    // Toggle visibility of logged-in/logged-out elements
    document.querySelectorAll('.auth-logged-out').forEach(el => {
        el.style.display = isAuth ? 'none' : '';
    });
    document.querySelectorAll('.auth-logged-in').forEach(el => {
        el.style.display = isAuth ? '' : 'none';
    });

    // Update user name if logged in
    if (isAuth && user) {
        const userName = user.name || user.email?.split('@')[0] || 'User';
        const userNameEl = $('#user-name');
        const sidebarUserNameEl = $('#sidebar-user-name');
        if (userNameEl) userNameEl.textContent = userName;
        if (sidebarUserNameEl) sidebarUserNameEl.textContent = userName;
    }

    // On the public landing page, send "Home" to the app when authenticated; otherwise keep in-page anchor
    document.querySelectorAll('a[data-i18n="nav.home"]').forEach((link) => {
        const currentHref = link.getAttribute('href') || '';
        if (currentHref.includes('#home')) {
            link.setAttribute('href', isAuth ? '/app.html' : '#home');
        }
    });
}

// Profile Modal handlers
const profileModal = $('#profile-modal');
const profileCloseBtn = $('#profile-close');
const profileBtnMobile = $('#profile-btn-mobile');
const profileBtnDesktop = $('#profile-btn-desktop');
const profileUserGreeting = $('#user-greeting');
const sidebarProfileBtn = $('#sidebar-profile-btn');

function openProfileModal() {
    if (profileModal) {
        const user = auth.getUser();
        const profileName = $('#profile-name');
        const profileEmail = $('#profile-email');
        if (profileName) profileName.textContent = user?.name || 'User';
        if (profileEmail) profileEmail.textContent = user?.email || 'user@email.com';
        profileModal.style.display = 'flex';
    }
}

function closeProfileModal() {
    if (profileModal) profileModal.style.display = 'none';
}

if (profileBtnMobile) {
    on(profileBtnMobile, 'click', openProfileModal);
}

if (profileBtnDesktop) {
    on(profileBtnDesktop, 'click', openProfileModal);
}

if (profileUserGreeting) {
    on(profileUserGreeting, 'click', openProfileModal);
}

if (sidebarProfileBtn) {
    on(sidebarProfileBtn, 'click', (e) => {
        e.preventDefault();
        openProfileModal();
        // Close sidebar after clicking
        removeClass(sidebar, 'active');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
    });
}

if (profileCloseBtn) {
    on(profileCloseBtn, 'click', closeProfileModal);
}

// Close profile modal when clicking outside
const modalOverlay = $('#modal-overlay');
if (profileModal) {
    on(profileModal, 'click', (e) => {
        if (e.target === profileModal) closeProfileModal();
    });
}

// Profile logout button
const profileLogoutBtn = $('#profile-logout-btn');
if (profileLogoutBtn) {
    on(profileLogoutBtn, 'click', () => {
        auth.logout();
        closeProfileModal();
        window.location.href = '/';
    });
}

// Logout button handlers
const logoutBtn = $('#logout-btn');
const sidebarLogoutBtn = $('#sidebar-logout-btn');

if (logoutBtn) {
    on(logoutBtn, 'click', () => {
        auth.logout();
        updateAuthUI();
    });
}

if (sidebarLogoutBtn) {
    on(sidebarLogoutBtn, 'click', () => {
        auth.logout();
        updateAuthUI();
        // Close sidebar after logout
        removeClass(sidebar, 'active');
        if (sidebarToggle) sidebarToggle.setAttribute('aria-expanded', 'false');
    });
}

// Auth state listeners
window.addEventListener('auth:login', (e) => {
    console.log('✅ User logged in:', e.detail);
    updateAuthUI();
});

window.addEventListener('auth:logout', () => {
    console.log('🚪 User logged out');
    updateAuthUI();
});

// Check if user is already authenticated on load
if (auth.isAuthenticated()) {
    const user = auth.getUser();
    console.log('✅ User already authenticated:', user);
}

// Initialize auth UI state
updateAuthUI();

console.log('✨ Frontend loaded successfully!');
console.log('🌐 Current language:', i18next.language);
console.log('🔧 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
console.log('🔐 Modal system initialized');
console.log('🔑 Auth system ready');

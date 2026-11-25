import './style.css';
import i18next from './i18n.js';
import { $, on, addClass, removeClass, setActiveNav } from './utils.js';
import api, { auth } from './api.js';
import ModalManager from './modal.js';
import router from './router.js';

const CONTACT_TOAST_KEYS = {
    dismissed: 'contactInfoToastDismissed',
    expiresAt: 'contactInfoToastExpiresAt',
};
const CONTACT_TOAST_MS = 5 * 60 * 1000; // 5 minutes
let contactToastTimer = null;
// Cache dashboard stats between navigations to avoid flashing zeros
const dashboardStats = { families: null, members: null, announcements: null };

// Initialize i18next
i18next.init;

// Function to update all translated elements
export function updateTranslations() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        el.textContent = i18next.t(key);
    });
}

// Make it available globally for router
window.updateTranslations = updateTranslations;

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
            link.setAttribute('href', isAuth ? '/app' : '#home');
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
        // Show overlay and activate modal like login/signup
        const overlay = $('#modal-overlay');
        if (overlay) overlay.classList.add('active');
        profileModal.classList.add('active');
    }
}

function closeProfileModal() {
    if (profileModal) profileModal.classList.remove('active');
    const overlay = $('#modal-overlay');
    if (overlay) overlay.classList.remove('active');
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

// Contact-info reminder + modal
const contactToast = $('#contact-info-toast');
const contactToastDismissBtn = $('#contact-toast-dismiss');
const contactToastCta = $('#contact-toast-cta');
const contactModal = $('#contact-modal');
const contactCloseBtn = $('#contact-close');
const contactCancelBtn = $('#contact-cancel');
const contactForm = $('#contact-info-form');
const contactEmailInput = $('#contact-email');
const contactPhoneInput = $('#contact-phone');
const contactStatus = $('#contact-status');
const contactSubmitBtn = $('#contact-submit');

function clearContactToastState() {
    sessionStorage.removeItem(CONTACT_TOAST_KEYS.dismissed);
    sessionStorage.removeItem(CONTACT_TOAST_KEYS.expiresAt);
    if (contactToast) contactToast.style.display = 'none';
    if (contactToastTimer) {
        clearTimeout(contactToastTimer);
        contactToastTimer = null;
    }
}

function hideContactToast(reason = 'hidden') {
    if (contactToast) contactToast.style.display = 'none';
    if (contactToastTimer) {
        clearTimeout(contactToastTimer);
        contactToastTimer = null;
    }
    if (reason === 'dismissed' || reason === 'expired') {
        sessionStorage.setItem(CONTACT_TOAST_KEYS.dismissed, '1');
    }
}

function startContactToastTimer(remainingMs) {
    if (contactToastTimer) clearTimeout(contactToastTimer);
    contactToastTimer = setTimeout(() => hideContactToast('expired'), remainingMs);
}

function showContactToast() {
    if (!contactToast) return;
    const now = Date.now();
    const storedExpiresAt = Number(sessionStorage.getItem(CONTACT_TOAST_KEYS.expiresAt) || 0);
    const expiresAt = storedExpiresAt > now ? storedExpiresAt : now + CONTACT_TOAST_MS;
    const remaining = Math.max(0, expiresAt - now);
    sessionStorage.setItem(CONTACT_TOAST_KEYS.expiresAt, expiresAt.toString());

    contactToast.style.display = 'flex';
    startContactToastTimer(remaining || CONTACT_TOAST_MS);
}

function maybeShowContactToast() {
    const user = auth.getUser();
    if (!user?.needsContactInfo) {
        hideContactToast();
        return;
    }

    if (sessionStorage.getItem(CONTACT_TOAST_KEYS.dismissed) === '1') {
        return;
    }

    const expiresAt = Number(sessionStorage.getItem(CONTACT_TOAST_KEYS.expiresAt) || 0);
    if (expiresAt && Date.now() >= expiresAt) {
        hideContactToast('expired');
        return;
    }

    showContactToast();
}

function openContactModal() {
    if (!contactModal) return;
    contactModal.classList.add('active');
    contactModal.setAttribute('aria-hidden', 'false');
    if (modalOverlay) modalOverlay.classList.add('active');
}

function closeContactModal() {
    if (!contactModal) return;
    contactModal.classList.remove('active');
    contactModal.setAttribute('aria-hidden', 'true');
    if (modalOverlay) modalOverlay.classList.remove('active');
}

function setContactStatus(type = '', message = '') {
    if (!contactStatus) return;
    contactStatus.textContent = message;
    contactStatus.className = 'form-status';
    if (type) contactStatus.classList.add(type);
}

function setContactButtonLoading(isLoading) {
    if (!contactSubmitBtn) return;
    if (isLoading) {
        contactSubmitBtn.dataset.originalText = contactSubmitBtn.textContent;
        contactSubmitBtn.textContent = 'Saving...';
        contactSubmitBtn.disabled = true;
    } else {
        contactSubmitBtn.textContent = contactSubmitBtn.dataset.originalText || contactSubmitBtn.textContent;
        contactSubmitBtn.disabled = false;
    }
}

if (contactToastDismissBtn) {
    on(contactToastDismissBtn, 'click', () => hideContactToast('dismissed'));
}

if (contactToastCta) {
    on(contactToastCta, 'click', () => {
        openContactModal();
    });
}

if (contactCloseBtn) {
    on(contactCloseBtn, 'click', closeContactModal);
}

if (contactCancelBtn) {
    on(contactCancelBtn, 'click', (e) => {
        e.preventDefault();
        closeContactModal();
    });
}

if (modalOverlay) {
    on(modalOverlay, 'click', closeContactModal);
}

if (contactForm) {
    on(contactForm, 'submit', async (e) => {
        e.preventDefault();
        setContactStatus('', '');
        const email = contactEmailInput?.value.trim() || '';
        const phone = contactPhoneInput?.value.trim() || '';

        if (!email && !phone) {
            setContactStatus('error', 'Enter at least an email or phone.');
            return;
        }

        const user = auth.getUser();
        if (!user?.id) {
            setContactStatus('error', 'User session missing. Please re-login.');
            return;
        }

        setContactButtonLoading(true);
        try {
            const response = await api.post('/auth/update-contact', {
                userId: user.id,
                email: email || undefined,
                phone: phone || undefined,
            });

            const updatedUser = response.data || {};
            const mergedUser = { ...user, ...updatedUser, needsContactInfo: updatedUser?.needsContactInfo ?? false };
            auth.setUser(mergedUser);
            setContactStatus('success', 'Contact info saved.');
            hideContactToast('dismissed');
            setTimeout(() => closeContactModal(), 400);
        } catch (err) {
            const message = err?.response?.data?.message || 'Could not save contact info. Try again.';
            setContactStatus('error', message);
        } finally {
            setContactButtonLoading(false);
        }
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
    maybeShowContactToast();
});

window.addEventListener('auth:logout', () => {
    console.log('🚪 User logged out');
    clearContactToastState();
    updateAuthUI();
});

// Check if user is already authenticated on load
if (auth.isAuthenticated()) {
    const user = auth.getUser();
    console.log('✅ User already authenticated:', user);
}

// Initialize auth UI state
updateAuthUI();
maybeShowContactToast();

// On home page, redirect authenticated users
if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    if (auth.isAuthenticated()) {
        window.location.href = '/app.html';
    }
}

// SPA Router disabled - using standalone pages instead
// Each page loads and initializes independently

console.log('✨ Frontend loaded successfully!');
console.log('🌐 Current language:', i18next.language);
console.log('🔧 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3001/api');
console.log('🔐 Modal system initialized');
console.log('🔑 Auth system ready');
console.log('🛣️ SPA Router initialized');

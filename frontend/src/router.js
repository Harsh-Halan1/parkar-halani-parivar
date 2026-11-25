/**
 * SPA Router - Client-side routing for single page application
 * Handles navigation without page reloads using History API
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.isTransitioning = false;
        this.contentArea = null;
        this.pageCache = new Map();
        this.pendingRedirect = null; // Store intended destination for post-login redirect
        
        // Define protected routes that require authentication
        this.protectedRoutes = ['/app', '/families', '/members', '/announcements'];
    }

    /**
     * Register a route with its page file
     * @param {string} path - Route path (e.g., '/app', '/families', '/members')
     * @param {string} file - HTML file to load (e.g., 'app.html')
     */
    register(path, file) {
        this.routes.set(path, { file, title: this.getTitleFromFile(file) });
    }

    /**
     * Initialize router - setup content area and event listeners
     * @param {string} contentSelector - CSS selector for content area
     */
    async init(contentSelector = '#app-content') {
        this.contentArea = document.querySelector(contentSelector);
        if (!this.contentArea) {
            console.error('Content area not found:', contentSelector);
            return;
        }

        // Handle all link clicks
        document.addEventListener('click', (e) => this.handleLinkClick(e));

        // Handle back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.navigateTo(e.state?.path || '/', false);
        });

        // Navigate to current URL on load
        const initialPath = this.getPathFromUrl();
        const homeContent = document.querySelector('#home-content');
        
        if (initialPath !== '/') {
            // Hide home content initially for non-home pages
            if (homeContent) homeContent.style.display = 'none';
            this.contentArea.style.display = 'block';
            await this.navigateTo(initialPath, false);
        } else {
            // For home page, check if user is logged in
            if (this.isAuthenticated()) {
                // Redirect logged-in users to /app
                await this.navigateTo('/app', false);
                // Fallback: if SPA navigation didn’t switch, hard redirect
                if (this.currentRoute !== '/app') {
                    window.location.href = '/app';
                    return;
                }
            } else {
                // For logged-out users on home page, show home content
                if (homeContent) homeContent.style.display = 'block';
                this.contentArea.style.display = 'none';
                this.contentArea.style.minHeight = '0';
                this.contentArea.innerHTML = ''; // Clear any content
                this.currentRoute = '/';
                window.history.replaceState({ path: '/' }, 'Home', '/');
                this.updateActiveNav('/');
            }
        }
    }

    /**
     * Handle link click events
     * @param {Event} event - Click event
     */
    handleLinkClick(event) {
        const link = event.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');

        // Ignore external links, anchors, and special links
        if (
            href.startsWith('http') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('#') ||
            href === 'javascript:void(0)'
        ) {
            return;
        }

        // Ignore profile menu link (special handler)
        if (link.id === 'profile-icon' || link.closest('#profile-menu')) {
            return;
        }

        event.preventDefault();
        const path = href.startsWith('/') ? href : '/' + href;
        this.navigateTo(path);
    }

    /**
     * Navigate to a route
     * @param {string} path - Route path
     * @param {boolean} addToHistory - Whether to add to browser history
     */
    async navigateTo(path, addToHistory = true) {
        if (this.isTransitioning || this.currentRoute === path) return;

        const normalizedPath = this.normalizePath(path);
        const route = this.routes.get(normalizedPath);

        if (!route) {
            console.warn('Route not found:', normalizedPath);
            this.navigateTo404();
            return;
        }

        // Redirect logged-in users away from home page
        if (normalizedPath === '/' && this.isAuthenticated()) {
            console.log('Logged-in user on home page, redirecting to /app');
            await this.navigateTo('/app', false);
            return;
        }

        // Check if route requires authentication
        if (this.isProtectedRoute(normalizedPath) && !this.isAuthenticated()) {
            console.log('Protected route, redirecting to login');
            this.pendingRedirect = normalizedPath;
            this.showLoginModal();
            // Redirect to home page in URL
            if (window.location.pathname !== '/') {
                window.history.replaceState({ path: '/' }, 'Home', '/');
            }
            return;
        }

        this.isTransitioning = true;

        try {
            // Add transition out effect
            this.contentArea.classList.add('page-exit');
            await this.sleep(150);

            // Load page content
            let content;
            const homeContent = document.querySelector('#home-content');
            
            if (normalizedPath === '/') {
                // For home page, show the home content div, hide and clear app content
                if (homeContent) {
                    homeContent.style.display = 'block';
                    this.contentArea.style.display = 'none';
                    this.contentArea.style.minHeight = '0';
                }
                content = '';
            } else {
                // Hide home content, show app content
                if (homeContent) {
                    homeContent.style.display = 'none';
                }
                this.contentArea.style.display = 'block';
                content = await this.loadPage(route.file);
            }

            this.contentArea.innerHTML = content;

            // Execute any scripts in the loaded content
            this.executeScripts(this.contentArea);

            // Add transition in effect
            this.contentArea.classList.remove('page-exit');
            this.contentArea.classList.add('page-enter');
            await this.sleep(150);
            this.contentArea.classList.remove('page-enter');

            // Update current route
            this.currentRoute = normalizedPath;

            // Update browser history
            if (addToHistory) {
                window.history.pushState({ path: normalizedPath }, route.title, normalizedPath);
            } else {
                window.history.replaceState({ path: normalizedPath }, route.title, normalizedPath);
            }

            // Update page title
            document.title = `${route.title} - Parakar Halani Parivar`;

            // Update active navigation
            this.updateActiveNav(normalizedPath);

            // Trigger page initialization
            this.initializePage(normalizedPath);

            // Scroll to top
            window.scrollTo(0, 0);

            // Emit custom navigation event
            window.dispatchEvent(new CustomEvent('routeChanged', { detail: { path: normalizedPath } }));
        } catch (error) {
            console.error('Navigation error:', error);
            this.navigateTo404();
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Load page content from HTML file
     * @param {string} file - HTML file to load
     */
    async loadPage(file) {
        // Check cache first
        if (this.pageCache.has(file)) {
            return this.pageCache.get(file);
        }

        try {
            const response = await fetch(file);
            if (!response.ok) throw new Error(`Failed to load ${file}`);

            const html = await response.text();

            // Extract body content only (remove html, head tags)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Remove navbar, sidebar, and other non-content elements
            const navbar = doc.querySelector('nav');
            if (navbar) navbar.remove();
            
            const sidebar = doc.querySelector('aside');
            if (sidebar) sidebar.remove();
            
            const footer = doc.querySelector('footer');
            if (footer) footer.remove();
            
            // Remove modal overlays/modals (they're in the main page)
            doc.querySelectorAll('.modal-overlay, .modal').forEach(el => el.remove());
            
            // Get remaining content (keep script tags for data initialization)
            let bodyContent = doc.body.innerHTML;

            // Cache the content
            this.pageCache.set(file, bodyContent);

            return bodyContent;
        } catch (error) {
            console.error('Error loading page:', file, error);
            return this.get404Content();
        }
    }

    /**
     * Initialize page-specific functionality after content load
     * @param {string} path - Current route path
     */
    initializePage(path) {
        // Skip initialization for home page (content already loaded)
        if (path === '/') return;

        // Re-initialize translations for new content
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            // Import and call updateTranslations from main.js
            window.updateTranslations?.();
        });
    }

    /**
     * Update active navigation state
     * @param {string} path - Current route path
     */
    updateActiveNav(path) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-menu a, .sidebar-nav a').forEach((link) => {
            link.classList.remove('active');
        });

        // Add active class to current path link
        document.querySelectorAll('.nav-menu a, .sidebar-nav a').forEach((link) => {
            const href = link.getAttribute('href');
            if (href === path || href === path + '.html') {
                link.classList.add('active');
            }
        });
    }

    /**
     * Get path from current URL
     */
    getPathFromUrl() {
        const pathname = window.location.pathname;
        // Remove trailing .html and slashes
        return pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    }

    /**
     * Normalize path (ensure it starts with / and remove .html)
     */
    normalizePath(path) {
        let normalized = path.replace(/\.html$/, '');
        if (!normalized.startsWith('/')) normalized = '/' + normalized;
        if (normalized === '/') return '/';
        if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
        return normalized;
    }

    /**
     * Get page name from path for function naming
     */
    getPageName(path) {
        return path
            .split('/')
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join('');
    }

    /**
     * Get title from HTML file name
     */
    getTitleFromFile(file) {
        const name = file.replace('.html', '');
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    /**
     * Navigate to 404 page
     */
    navigateTo404() {
        this.currentRoute = '/404';
        this.contentArea.innerHTML = this.get404Content();
        window.history.replaceState({ path: '/404' }, '404', '/404');
        document.title = '404 - Page Not Found | Parakar Halani Parivar';
        this.isTransitioning = false;
    }

    /**
     * Get 404 page content
     */
    get404Content() {
        return `
            <div class="error-page">
                <div class="error-content">
                    <div class="error-icon">⚠️</div>
                    <div class="error-code">404</div>
                    <div class="error-title" data-i18n="errors.404.title">Page Not Found</div>
                    <div class="error-message" data-i18n="errors.404.message">
                        Sorry, the page you're looking for doesn't exist.
                    </div>
                    <div class="suggestion-links">
                        <a href="/" class="btn btn-primary" data-i18n="errors.goHome">Go Home</a>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Execute scripts in loaded content
     * @param {HTMLElement} container - Container with scripts to execute
     */
    executeScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            
            // Copy attributes
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy content
            newScript.textContent = oldScript.textContent;
            
            // Replace old script with new one (this executes it)
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }

    /**
     * Sleep utility for transitions
     */
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get all registered routes
     */
    getRoutes() {
        return Array.from(this.routes.keys());
    }

    /**
     * Check if a route requires authentication
     */
    isProtectedRoute(path) {
        return this.protectedRoutes.includes(path);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        // Fall back to stored user if token key differs
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token || user);
    }

    /**
     * Show login modal
     */
    showLoginModal() {
        const loginModal = document.getElementById('login-modal');
        const overlay = document.getElementById('modal-overlay');
        if (loginModal && overlay) {
            overlay.classList.add('active');
            loginModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Get pending redirect and clear it
     */
    getPendingRedirect() {
        const redirect = this.pendingRedirect;
        this.pendingRedirect = null;
        return redirect;
    }
}

// Export singleton instance
export default new Router();

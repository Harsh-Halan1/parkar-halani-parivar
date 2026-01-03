/**
 * Breadcrumb Navigation Component
 * Displays page hierarchy for better navigation context
 */

class Breadcrumb {
    constructor() {
        this.breadcrumbs = new Map();
        this.container = null;
    }

    /**
     * Register breadcrumb path for a route
     * @param {string} path - Route path
     * @param {Array} breadcrumbArray - Array of {label, href} objects
     */
    register(path, breadcrumbArray) {
        this.breadcrumbs.set(path, breadcrumbArray);
    }

    /**
     * Initialize breadcrumb container
     * @param {string} containerSelector - CSS selector for container
     */
    init(containerSelector = '#breadcrumb-container') {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            console.warn('Breadcrumb container not found:', containerSelector);
            return;
        }

        // Listen for route changes
        window.addEventListener('routeChanged', (e) => {
            this.render(e.detail.path);
        });
    }

    /**
     * Render breadcrumbs for current route
     * @param {string} path - Current route path
     */
    render(path) {
        if (!this.container) return;

        const breadcrumbs = this.breadcrumbs.get(path);
        if (!breadcrumbs) {
            this.container.innerHTML = '';
            return;
        }

        const html = breadcrumbs
            .map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                if (isLast) {
                    return `
                        <div class="breadcrumb-item active">
                            <span>${item.label}</span>
                        </div>
                    `;
                }
                return `
                    <div class="breadcrumb-item">
                        <a href="${item.href}">${item.label}</a>
                        <span class="breadcrumb-separator">/</span>
                    </div>
                `;
            })
            .join('');

        this.container.innerHTML = `<nav class="breadcrumb">${html}</nav>`;
    }

    /**
     * Get breadcrumbs for a path
     */
    get(path) {
        return this.breadcrumbs.get(path) || [];
    }
}

// Export singleton instance
export default new Breadcrumb();

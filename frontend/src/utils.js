// DOM manipulation helpers
export function $(selector) {
  return document.querySelector(selector);
}

export function $$(selector) {
  return document.querySelectorAll(selector);
}

// Create element with attributes and classes
export function createElement(tag, { id, className, textContent, html, ...attrs } = {}) {
  const el = document.createElement(tag);
  if (id) el.id = id;
  if (className) el.className = className;
  if (textContent) el.textContent = textContent;
  if (html) el.innerHTML = html;
  Object.entries(attrs).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      el.setAttribute(key, val);
    }
  });
  return el;
}

// Set multiple attributes
export function setAttrs(el, attrs) {
  Object.entries(attrs).forEach(([key, val]) => {
    el.setAttribute(key, val);
  });
}

// Add event listeners
export function on(el, event, handler) {
  el.addEventListener(event, handler);
  return () => el.removeEventListener(event, handler);
}

// Toggle class
export function toggleClass(el, className, force) {
  el.classList.toggle(className, force);
}

// Has class
export function hasClass(el, className) {
  return el.classList.contains(className);
}

// Add class
export function addClass(el, className) {
  el.classList.add(className);
}

// Remove class
export function removeClass(el, className) {
  el.classList.remove(className);
}

// Highlight current nav link based on the active pathname/hash
export function setActiveNav() {
  const links = document.querySelectorAll('.nav-menu a, .sidebar-nav a');
  if (!links.length) return;

  const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  const currentHash = window.location.hash;

  links.forEach((link) => removeClass(link, 'active'));

  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (!href) return;

    // Handle on-page anchors (home page)
    if (href.startsWith('#')) {
      if (currentPath === '/' && (!currentHash || currentHash === href || href === '#home')) {
        addClass(link, 'active');
      }
      return;
    }

    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/index\.html$/, '/');
    if (linkPath === currentPath) {
      addClass(link, 'active');
    }
  });
}

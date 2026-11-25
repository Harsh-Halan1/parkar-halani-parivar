// Modal Management
import api, { auth } from './api.js';

// const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true';
const DEV_MODE = false;
export class ModalManager {
  constructor() {
    this.overlay = document.getElementById('modal-overlay');
    this.loginModal = document.getElementById('login-modal');
    this.signupModal = document.getElementById('signup-modal');
    this.progressSteps = Array.from(document.querySelectorAll('.progress-indicator .step'));
    this.progressFill = document.querySelector('.progress-line-fill');
    this.currentSignupStep = 1;
    this.init();
  }

  init() {
    // Login button
    document.getElementById('login-btn').addEventListener('click', () => this.openLogin());
    document.getElementById('cta-btn').addEventListener('click', () => this.openSignup());

    // Modal close buttons
    document.getElementById('login-close').addEventListener('click', () => this.closeAll());
    document.getElementById('signup-close').addEventListener('click', () => this.closeAll());

    // Switch between login and signup
    document.getElementById('switch-to-signup').addEventListener('click', (e) => {
      e.preventDefault();
      this.closeLogin();
      this.openSignup();
    });

    document.getElementById('switch-to-login').addEventListener('click', (e) => {
      e.preventDefault();
      this.closeSignup();
      this.openLogin();
    });

    // Overlay click to close
    this.overlay.addEventListener('click', () => this.closeAll());

    // Password toggle buttons
    document.getElementById('login-toggle-pwd').addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePassword('login-password', 'login-toggle-pwd');
    });

    document.getElementById('signup-toggle-pwd').addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePassword('signup-password', 'signup-toggle-pwd');
    });

    document.getElementById('signup-toggle-confirm').addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePassword('signup-confirm-password', 'signup-toggle-confirm');
    });

    // Signup form steps
    document.querySelectorAll('.next-step').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextSignupStep();
      });
    });

    document.querySelectorAll('.prev-step').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevSignupStep();
      });
    });

    // Live validation to clear resolved errors
    ['signup-first-name', 'signup-last-name', 'signup-email', 'signup-phone', 'signup-password', 'signup-confirm-password'].forEach((id) => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener('input', () => this.handleFieldInput(id));
      }
    });


    // Form submissions
    document.getElementById('login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLoginSubmit();
    });

    document.getElementById('signup-step2').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSignupSubmit();
    });
  }

  openLogin() {
    this.overlay.classList.add('active');
    this.loginModal.classList.add('active');
    this.signupModal.classList.remove('active');
    document.body.style.overflow = 'hidden';
  }

  closeLogin() {
    this.loginModal.classList.remove('active');
  }

  openSignup() {
    this.currentSignupStep = 1;
    this.updateSignupStep();
    this.overlay.classList.add('active');
    this.signupModal.classList.add('active');
    this.loginModal.classList.remove('active');
    document.body.style.overflow = 'hidden';
  }

  closeSignup() {
    this.signupModal.classList.remove('active');
  }

  closeAll() {
    this.overlay.classList.remove('active');
    this.loginModal.classList.remove('active');
    this.signupModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  togglePassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input.type === 'password') {
      // Currently hidden -> show text, set eye
      input.type = 'text';
      btn.textContent = '👁️';
    } else {
      // Currently visible -> hide, set monkey
      input.type = 'password';
      btn.textContent = '🙈';
    }
  }

  async nextSignupStep() {
    if (!this.validateCurrentStep()) return;

    if (this.currentSignupStep >= this.progressSteps.length) {
      // Already on last step; submit
      this.handleSignupSubmit();
      return;
    }

    this.currentSignupStep++;
    this.updateSignupStep();
  }

  prevSignupStep() {
    if (this.currentSignupStep > 1) {
      this.currentSignupStep--;
      this.updateSignupStep();
    }
  }

  validateCurrentStep() {
    if (this.currentSignupStep === 1) {
      this.clearError('signup-first-name');
      this.clearError('signup-last-name');
      this.clearError('signup-email');
      this.clearError('signup-phone');
      const firstName = document.getElementById('signup-first-name').value.trim();
      const lastName = document.getElementById('signup-last-name').value.trim();
      const email = document.getElementById('signup-email').value;
      const phone = document.getElementById('signup-phone').value;

      if (!firstName) {
        this.showError('signup-first-name', 'First name is required');
        return false;
      }

      if (!lastName) {
        this.showError('signup-last-name', 'Last name is required');
        return false;
      }

      if (!this.isValidEmail(email)) {
        this.showError('signup-email', 'Invalid email address');
        return false;
      }

      if (!this.isValidPhone(phone)) {
        this.showError('signup-phone', 'Invalid phone number');
        return false;
      }

      return true;
    }

    if (this.currentSignupStep === 2) {
      this.clearError('signup-password');
      this.clearError('signup-confirm-password');
      const password = document.getElementById('signup-password').value;
      const confirm = document.getElementById('signup-confirm-password').value;

      if (!this.isValidPassword(password)) {
        this.showError('signup-password', 'Password must be at least 8 characters with 1 uppercase and 1 number');
        return false;
      }

      if (password !== confirm) {
        this.showError('signup-confirm-password', 'Passwords do not match');
        return false;
      }

      return true;
    }

    return true;
  }

  isValidEmail(email) {
    return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  }

  isValidPhone(phone) {
    return /^\+?[0-9\s\-()]{7,20}$/.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }


  isValidPassword(password) {
    return /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  }

  showError(inputId, message) {
    const input = document.getElementById(inputId);
    const group = input.closest('.form-group');
    group.classList.add('error');
    
    let errorEl = group.querySelector('.form-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'form-error';
      group.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearErrors() {
    document.querySelectorAll('.form-group').forEach((group) => {
      group.classList.remove('error');
      const err = group.querySelector('.form-error');
      if (err) {
        err.remove();
      }
    });
  }

  clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const group = input.closest('.form-group');
    if (!group) return;
    group.classList.remove('error');
    const err = group.querySelector('.form-error');
    if (err) {
      err.remove();
    }
  }

  setStatus(elementId, type = '', message = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = message;
    el.className = 'form-status';
    if (type) {
      el.classList.add(type);
    }
  }

  setButtonLoading(button, isLoading, loadingText = 'Loading...') {
    if (!button) return;
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText;
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.disabled = false;
      button.classList.remove('loading');
    }
  }


  handleFieldInput(fieldId) {
    const value = document.getElementById(fieldId)?.value || '';

    switch (fieldId) {
      case 'signup-first-name':
      case 'signup-last-name':
        if (value.trim()) this.clearError(fieldId);
        break;
      case 'signup-email':
        if (this.isValidEmail(value)) this.clearError(fieldId);
        break;
      case 'signup-phone':
        if (this.isValidPhone(value)) this.clearError(fieldId);
        break;
      case 'signup-password':
        if (this.isValidPassword(value)) this.clearError(fieldId);
        // Re-check confirm password when base password changes
        this.handleFieldInput('signup-confirm-password');
        break;
      case 'signup-confirm-password': {
        const pwd = document.getElementById('signup-password')?.value || '';
        if (value && value === pwd) this.clearError(fieldId);
        break;
      }
      default:
        this.clearError(fieldId);
    }
  }

  updateSignupStep() {
    this.clearErrors();

    // Hide all steps
    document.querySelectorAll('.signup-step').forEach((step) => {
      step.classList.remove('active');
    });

    // Show current step
    const currentForm = document.getElementById(`signup-step${this.currentSignupStep}`);
    if (currentForm) {
      currentForm.classList.add('active');
    }

    // Update progress indicator classes
    this.progressSteps.forEach((step, idx) => {
      const stepNumber = idx + 1;
      const isActive = stepNumber === this.currentSignupStep;
      const isDone = stepNumber < this.currentSignupStep;
      step.classList.toggle('active', isActive);
      step.classList.toggle('done', isDone);
    });

    // Animate progress line fill
    const totalSteps = this.progressSteps.length;
    const progress = totalSteps > 1 ? ((this.currentSignupStep - 1) / (totalSteps - 1)) * 100 : 0;
    if (this.progressFill) {
      this.progressFill.style.width = `${progress}%`;
    }
  }

  async handleLoginSubmit() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const remember = document.getElementById('login-remember').checked;
    const submitBtn = document.querySelector('#login-form button[type="submit"]');

    this.setStatus('login-status', '', '');
    this.clearError('login-email');
    this.clearError('login-password');

    if (!this.isValidEmail(email)) {
      this.showError('login-email', 'Invalid email address');
      return;
    }

    if (!password) {
      this.showError('login-password', 'Password is required');
      return;
    }

    this.setButtonLoading(submitBtn, true, 'Logging in...');

    try {
      // DEV MODE: Mock successful login
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUser = { 
          id: 1, 
          name: email.split('@')[0], 
          email,
          role: 'user'
        };
        auth.setTokens('mock-access-token', 'mock-refresh-token');
        auth.setUser(mockUser);
        this.setStatus('login-status', 'success', 'Logged in successfully (Dev Mode).');
        setTimeout(() => {
          this.closeAll();
          window.location.href = '/app';
        }, 500);
        this.setButtonLoading(submitBtn, false);
        return;
      }

      const response = await api.post('/auth/email/sign-in', { email, password, rememberMe: remember });
      const { user, tokens, accessToken, refreshToken, access_token, refresh_token } = response.data || {};

      // Be flexible with backend token shapes
      const access = tokens?.accessToken || tokens?.token || accessToken || access_token;
      const refresh = tokens?.refreshToken || tokens?.refresh || refreshToken || refresh_token;

      auth.setTokens(access, refresh);
      if (user) auth.setUser(user);

      this.setStatus('login-status', 'success', 'Logged in successfully.');
      setTimeout(() => {
        this.closeAll();
        
        // Check if there's a pending redirect from router
        const router = window.router;
        const pendingRedirect = router?.getPendingRedirect();
        
        if (pendingRedirect && pendingRedirect !== '/') {
          router.navigateTo(pendingRedirect);
        } else {
          // Prefer SPA navigation to keep shell alive
          if (router) {
            router.navigateTo('/app');
          } else {
            window.location.href = '/app';
          }
        }
      }, 500);
    } catch (error) {
      const message = error?.response?.data?.message || 'Login failed. Please try again.';
      this.setStatus('login-status', 'error', message);
    } finally {
      this.setButtonLoading(submitBtn, false);
    }
  }

  async handleSignupSubmit() {
    const firstName = document.getElementById('signup-first-name').value.trim();
    const lastName = document.getElementById('signup-last-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value;
    const submitBtn = document.querySelector('#signup-step2 button[type="submit"]');

    this.setStatus('signup-step2-status', '', '');

    if (!this.validateCurrentStep()) {
      return;
    }

    this.setButtonLoading(submitBtn, true, 'Creating account...');

    try {
      // DEV MODE: Mock successful signup
      if (DEV_MODE) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUser = { 
          id: 2, 
          name: `${firstName} ${lastName}`.trim(),
          email,
          phone,
          role: 'user'
        };
        auth.setTokens('mock-access-token', 'mock-refresh-token');
        auth.setUser(mockUser);
        this.setStatus('signup-step2-status', 'success', 'Account created (Dev Mode)!');
        setTimeout(() => {
          this.closeAll();
          
          // Check for pending redirect
          const router = window.router;
          const pendingRedirect = router?.getPendingRedirect();
          
          if (pendingRedirect && pendingRedirect !== '/') {
            router.navigateTo(pendingRedirect);
          } else {
            window.location.href = '/app';
          }
        }, 800);
        this.setButtonLoading(submitBtn, false);
        return;
      }
      
      const response = await api.post('/auth/email/sign-up', { email, password, firstName, lastName, phone });
      const { user, tokens, accessToken, refreshToken, access_token, refresh_token } = response.data || {};
      
      const access = tokens?.accessToken || tokens?.token || accessToken || access_token;
      const refresh = tokens?.refreshToken || tokens?.refresh || refreshToken || refresh_token;

      auth.setTokens(access, refresh);
      if (user) auth.setUser(user);
      
      this.setStatus('signup-step2-status', 'success', 'Account created successfully!');
      setTimeout(() => {
        this.closeAll();
        
        // Check for pending redirect
        const router = window.router;
        const pendingRedirect = router?.getPendingRedirect();
        
        if (pendingRedirect && pendingRedirect !== '/') {
          router.navigateTo(pendingRedirect);
        } else {
          if (router) {
            router.navigateTo('/app');
          } else {
            window.location.href = '/app';
          }
        }
      }, 800);
    } catch (error) {
      const message = error?.response?.data?.message || 'Signup failed. Please try again.';
      this.setStatus('signup-step2-status', 'error', message);
    } finally {
      this.setButtonLoading(submitBtn, false);
    }
  }
}

export default ModalManager;

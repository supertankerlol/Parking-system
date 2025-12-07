/**
 * auth.js
 * Handles client-side authentication for login.html and register.html.
 * 
 * Depends on:
 * - config.js (must be loaded first)
 * - api.js (must be loaded first for apiFetch, setToken, removeToken)
 */

(function () {
    'use strict';

    // =========================================================================
    // CORE AUTH FUNCTIONS
    // =========================================================================

    /**
     * Login a user with email and password.
     * @param {string} email - User's email address
     * @param {string} password - User's password
     * @returns {Promise<Object>} The response containing user and token
     * @throws {Error} Error with message from API on failure
     */
    async function login(email, password) {
        const response = await apiFetch('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        // Store the token
        if (response && response.token) {
            setToken(response.token);
        }

        return response;
    }

    /**
     * Register a new user.
     * @param {Object} userData - User registration data
     * @param {string} userData.fullName - User's full name
     * @param {string} userData.email - User's email address
     * @param {string} userData.password - User's password
     * @param {string} [userData.phone] - User's phone number (optional)
     * @param {string} [userData.licensePlate] - User's license plate (optional)
     * @returns {Promise<Object>} The response containing user and token
     * @throws {Error} Error with message from API on failure
     */
    async function signup(userData) {
        const { fullName, email, password, phone, licensePlate } = userData;

        const response = await apiFetch('/auth/signup', {
            method: 'POST',
            body: {
                fullName,
                email,
                password,
                phone: phone || undefined,
                licensePlate: licensePlate || undefined
            }
        });

        // Store the token (auto-login after signup)
        if (response && response.token) {
            setToken(response.token);
        }

        return response;
    }

    /**
     * Logout the current user.
     * Removes the token and redirects to login page.
     * @param {string} [redirectUrl='login.html'] - URL to redirect after logout
     */
    function logout(redirectUrl = 'login.html') {
        // Optionally notify server (fire-and-forget)
        if (isAuthenticated()) {
            apiFetch('/auth/logout', { method: 'POST' }).catch(() => {
                // Ignore errors - we're logging out anyway
            });
        }

        // Remove token from storage
        removeToken();

        // Clear any user data from session/local storage
        sessionStorage.clear();

        console.log('[Auth] User logged out');

        // Redirect to login page
        window.location.href = redirectUrl;
    }

    /**
     * Get the current user's info from the token (if JWT).
     * Note: This is a basic decode, does NOT verify signature.
     * @returns {Object|null} Decoded token payload or null
     */
    function getCurrentUser() {
        const token = getToken();
        if (!token) return null;

        try {
            // JWT structure: header.payload.signature
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded;
        } catch {
            return null;
        }
    }

    /**
     * Check if the current user is an admin.
     * @returns {boolean} True if user has admin role
     */
    function isAdmin() {
        const user = getCurrentUser();
        return user && user.role === 'ADMIN';
    }

    /**
     * Redirect to login if not authenticated.
     * Call this at the start of protected pages.
     * @param {string} [loginUrl='login.html'] - URL of the login page
     * @returns {boolean} True if authenticated, false if redirecting
     */
    function requireAuth(loginUrl = 'login.html') {
        if (!isAuthenticated()) {
            // Store the intended destination for redirect after login
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = loginUrl;
            return false;
        }
        return true;
    }

    // =========================================================================
    // FORM HANDLERS
    // =========================================================================

    /**
     * Handles the login form submission.
     * @param {Event} e - The form submission event
     */
    async function handleLogin(e) {
        e.preventDefault();

        const form = e.target;
        const errorEl = document.getElementById('auth-error');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Login';

        // Clear previous errors
        if (errorEl) errorEl.textContent = '';

        // Get form data
        const email = form.email.value.trim();
        const password = form.password.value;

        // Basic validation
        if (!email || !password) {
            if (errorEl) errorEl.textContent = 'Please enter email and password.';
            return;
        }

        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Logging In...';
        }

        try {
            const response = await login(email, password);

            console.log('[Auth] Login successful:', response.user);

            // Check for redirect URL stored before login
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            sessionStorage.removeItem('redirectAfterLogin');

            // Redirect based on user role or stored URL
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (response.user && response.user.role === 'ADMIN') {
                window.location.href = 'admin/admin-dashboard.html';
            } else {
                window.location.href = 'user-dashboard.html';
            }

        } catch (error) {
            console.error('[Auth] Login failed:', error.message);
            if (errorEl) errorEl.textContent = error.message;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    }

    /**
     * Handles the register form submission.
     * @param {Event} e - The form submission event
     */
    async function handleRegister(e) {
        e.preventDefault();

        const form = e.target;
        const errorEl = document.getElementById('auth-error');
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton ? submitButton.textContent : 'Create Account';

        // Clear previous errors
        if (errorEl) errorEl.textContent = '';

        // Get form data
        const fullName = form.name ? form.name.value.trim() : (form.fullName ? form.fullName.value.trim() : '');
        const email = form.email.value.trim();
        const password = form.password.value;
        const confirmPassword = form.confirmPassword ? form.confirmPassword.value : password;
        const phone = form.phone ? form.phone.value.trim() : '';
        const licensePlate = form.licensePlate ? form.licensePlate.value.trim() : '';

        // Client-side validation
        if (!fullName || !email || !password) {
            if (errorEl) errorEl.textContent = 'Please fill in all required fields.';
            return;
        }

        if (password !== confirmPassword) {
            if (errorEl) errorEl.textContent = 'Passwords do not match.';
            return;
        }

        if (password.length < 8) {
            if (errorEl) errorEl.textContent = 'Password must be at least 8 characters long.';
            return;
        }

        // Show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';
        }

        try {
            const response = await signup({
                fullName,
                email,
                password,
                phone,
                licensePlate
            });

            console.log('[Auth] Registration successful:', response.user);

            // Option 1: Auto-login and redirect to dashboard
            window.location.href = 'user-dashboard.html';

            // Option 2: Redirect to login page (uncomment if preferred)
            // alert('Registration successful! Please log in to continue.');
            // removeToken(); // Don't auto-login
            // window.location.href = 'login.html';

        } catch (error) {
            console.error('[Auth] Registration failed:', error.message);
            if (errorEl) errorEl.textContent = error.message;
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        }
    }

    // =========================================================================
    // AUTO-INITIALIZE FORM LISTENERS
    // =========================================================================

    document.addEventListener('DOMContentLoaded', () => {
        // Attach login form handler
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            console.log('[Auth] Login form handler attached');
        }

        // Attach register form handler
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegister);
            console.log('[Auth] Register form handler attached');
        }

        // Attach logout button handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Export individual functions
    window.login = login;
    window.signup = signup;
    window.logout = logout;
    window.getCurrentUser = getCurrentUser;
    window.isAdmin = isAdmin;
    window.requireAuth = requireAuth;
    window.handleLogin = handleLogin;
    window.handleRegister = handleRegister;

    // Export as namespace
    window.Auth = {
        login,
        signup,
        logout,
        getCurrentUser,
        isAdmin,
        requireAuth,
        handleLogin,
        handleRegister
    };

})();

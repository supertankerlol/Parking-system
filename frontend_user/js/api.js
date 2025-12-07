/**
 * api.js
 * Centralized API helper for the frontend application.
 * Handles token management and API requests.
 * 
 * Depends on: config.js (must be loaded first)
 */

(function () {
    'use strict';

    const TOKEN_KEY = 'authToken';

    /**
     * Save the authentication token to localStorage.
     * @param {string} token - The JWT token to save.
     */
    function setToken(token) {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        }
    }

    /**
     * Retrieve the authentication token from localStorage.
     * @returns {string|null} The stored token, or null if not found.
     */
    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    /**
     * Remove the authentication token from localStorage.
     */
    function removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    }

    /**
     * Check if user is authenticated (has a token).
     * @returns {boolean} True if a token exists.
     */
    function isAuthenticated() {
        return !!getToken();
    }

    /**
     * Make an authenticated API request.
     * 
     * @param {string} path - API endpoint path (e.g., '/auth/login', '/bookings')
     * @param {Object} [options={}] - Fetch options
     * @param {string} [options.method='GET'] - HTTP method
     * @param {Object|FormData} [options.body] - Request body (object for JSON, FormData for uploads)
     * @param {Object} [options.headers] - Additional headers
     * @returns {Promise<any>} Parsed JSON response
     * @throws {Error} Error with message from API response on non-OK status
     * 
     * @example
     * // GET request
     * const user = await apiFetch('/users/me');
     * 
     * @example
     * // POST JSON
     * const result = await apiFetch('/auth/login', {
     *     method: 'POST',
     *     body: { email: 'user@test.com', password: 'password123' }
     * });
     * 
     * @example
     * // POST FormData (file upload)
     * const formData = new FormData();
     * formData.append('file', fileInput.files[0]);
     * const result = await apiFetch('/upload', {
     *     method: 'POST',
     *     body: formData
     * });
     */
    async function apiFetch(path, options = {}) {
        // Ensure config is loaded
        const baseUrl = window.API_BASE;
        if (!baseUrl) {
            throw new Error('API_BASE not configured. Ensure config.js is loaded before api.js');
        }

        // Build full URL
        const url = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

        // Prepare headers
        const headers = { ...options.headers };

        // Attach Authorization header if token exists
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Prepare request options
        const fetchOptions = {
            method: options.method || 'GET',
            headers
        };

        // Handle body
        if (options.body !== undefined) {
            if (options.body instanceof FormData) {
                // FormData: let browser set Content-Type with boundary
                fetchOptions.body = options.body;
            } else if (typeof options.body === 'object') {
                // JSON: stringify and set Content-Type
                headers['Content-Type'] = 'application/json';
                fetchOptions.body = JSON.stringify(options.body);
            } else {
                // Assume string or other primitive
                fetchOptions.body = options.body;
            }
        }

        // Make the request
        const response = await fetch(url, fetchOptions);

        // Handle response
        if (!response.ok) {
            // Try to parse error message from response
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            
            try {
                const errorData = await response.json();
                // Support common error response formats
                errorMessage = errorData.message || errorData.error || errorData.msg || errorMessage;
            } catch {
                // Response wasn't JSON, use default message
            }

            const error = new Error(errorMessage);
            error.status = response.status;
            error.response = response;
            throw error;
        }

        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        // Return null for empty responses (e.g., 204 No Content)
        return null;
    }

    // Export to window for global access
    window.setToken = setToken;
    window.getToken = getToken;
    window.removeToken = removeToken;
    window.isAuthenticated = isAuthenticated;
    window.apiFetch = apiFetch;

    // Also export as a namespace for cleaner imports
    window.API = {
        setToken,
        getToken,
        removeToken,
        isAuthenticated,
        fetch: apiFetch
    };
})();

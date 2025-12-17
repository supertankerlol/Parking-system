/**
 * user-store.js - Centralized User Data Store
 * 
 * Manages user profile data across the application.
 * Provides a single source of truth for user info that syncs
 * between sidebar, profile page, and other components.
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 */

(function () {
    'use strict';

    const USER_CACHE_KEY = 'cachedUser';
    let currentUser = null;
    let listeners = [];

    // =========================================================================
    // CORE FUNCTIONS
    // =========================================================================

    /**
     * Get the current user data.
     * @returns {Object|null} Current user object or null
     */
    function getUser() {
        if (currentUser) return currentUser;
        
        // Try to load from cache
        const cached = sessionStorage.getItem(USER_CACHE_KEY);
        if (cached) {
            try {
                currentUser = JSON.parse(cached);
                return currentUser;
            } catch {
                sessionStorage.removeItem(USER_CACHE_KEY);
            }
        }
        return null;
    }

    /**
     * Set the current user data and notify listeners.
     * @param {Object} user - User data object
     */
    function setUser(user) {
        currentUser = user;
        
        if (user) {
            sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        } else {
            sessionStorage.removeItem(USER_CACHE_KEY);
        }
        
        // Notify all listeners
        notifyListeners(user);
    }

    /**
     * Clear user data (on logout).
     */
    function clearUser() {
        currentUser = null;
        sessionStorage.removeItem(USER_CACHE_KEY);
        notifyListeners(null);
    }

    /**
     * Fetch user profile from API and update store.
     * @returns {Promise<Object>} User data
     */
    async function fetchUser() {
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            clearUser();
            return null;
        }

        try {
            const response = await apiFetch('/users/me');
            const user = response.user || response;
            setUser(user);
            return user;
        } catch (error) {
            console.error('[UserStore] Failed to fetch user:', error);
            if (error.status === 401) {
                clearUser();
            }
            throw error;
        }
    }

    /**
     * Update user profile and sync store.
     * @param {Object} updates - Profile updates
     * @returns {Promise<Object>} Updated user data
     */
    async function updateUser(updates) {
        const response = await apiFetch('/users/me', {
            method: 'PUT',
            body: updates
        });
        
        const user = response.user || response;
        setUser(user);
        return user;
    }

    // =========================================================================
    // LISTENER MANAGEMENT
    // =========================================================================

    /**
     * Subscribe to user data changes.
     * @param {Function} callback - Function to call when user changes
     * @returns {Function} Unsubscribe function
     */
    function subscribe(callback) {
        listeners.push(callback);
        
        // Immediately call with current data
        const user = getUser();
        if (user) {
            callback(user);
        }
        
        // Return unsubscribe function
        return () => {
            listeners = listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners of user data change.
     * @param {Object|null} user - Updated user data
     */
    function notifyListeners(user) {
        listeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('[UserStore] Listener error:', error);
            }
        });
        
        // Also dispatch a custom event for components that prefer events
        window.dispatchEvent(new CustomEvent('user:updated', { detail: user }));
    }

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    /**
     * Get user initials from name.
     * @param {string} name - Full name
     * @returns {string} Initials (up to 2 characters)
     */
    function getInitials(name) {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    /**
     * Get full avatar URL.
     * @param {string} avatarUrl - Avatar URL from user object
     * @returns {string|null} Full avatar URL or null
     */
    function getAvatarUrl(avatarUrl) {
        if (!avatarUrl) return null;
        if (avatarUrl.startsWith('http')) return avatarUrl;
        const base = window.API_BASE?.replace('/api', '') || '';
        return `${base}${avatarUrl}`;
    }

    /**
     * Update sidebar with user data.
     * Called automatically when user data changes.
     * @param {Object} user - User data
     */
    function updateSidebarProfile(user) {
        const nameEl = document.querySelector('.sidebar__user-name');
        const emailEl = document.querySelector('.sidebar__user-email');
        const avatarImg = document.querySelector('.sidebar__avatar');

        if (nameEl) {
            nameEl.textContent = user?.fullName || 'User';
        }

        if (emailEl) {
            emailEl.textContent = user?.email || '';
        }

        if (avatarImg && user) {
            const avatarUrl = getAvatarUrl(user.avatarUrl);
            if (avatarUrl) {
                avatarImg.src = avatarUrl;
                avatarImg.onerror = () => {
                    // Fallback to default avatar on error
                    avatarImg.src = '../assets/images/user.png';
                };
            } else {
                avatarImg.src = '../assets/images/user.png';
            }
        }
    }

    // =========================================================================
    // VALIDATION HELPERS
    // =========================================================================

    /**
     * Validate email format.
     * @param {string} email - Email to validate
     * @returns {boolean} True if valid
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number format.
     * @param {string} phone - Phone to validate
     * @returns {boolean} True if valid
     */
    function isValidPhone(phone) {
        if (!phone) return true; // Phone is optional
        // Allow various formats: +1 555 123 4567, (555) 123-4567, 5551234567, etc.
        const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
        return phoneRegex.test(phone);
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    // Auto-subscribe sidebar updates
    subscribe(updateSidebarProfile);

    // =========================================================================
    // EXPORTS
    // =========================================================================

    window.UserStore = {
        getUser,
        setUser,
        clearUser,
        fetchUser,
        updateUser,
        subscribe,
        getInitials,
        getAvatarUrl,
        updateSidebarProfile,
        isValidEmail,
        isValidPhone
    };

})();


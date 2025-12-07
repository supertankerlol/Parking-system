/**
 * Main JavaScript file for the application.
 * This file handles:
 * 1. Loading reusable HTML components (sidebar, header, footer).
 * 2. Setting the active state for sidebar navigation.
 * 3. Setting dynamic page titles.
 * 4. Handling global event listeners (like logout).
 * 5. Theme toggle functionality.
 * 6. WebSocket connection for real-time updates.
 * 
 * Depends on:
 * - config.js (optional, for SOCKET_URL)
 * - socket-client.js (optional, for real-time updates)
 */

// --- GLOBAL VARIABLES ---
let currentTheme = localStorage.getItem('theme') || 'system';

// Apply theme immediately on page load (before DOM is ready)
applyThemeOnLoad();

// Wait for the DOM (HTML structure) to be fully loaded before running any scripts.
document.addEventListener("DOMContentLoaded", () => {
    // --- 1. DEFINE BASE PATH ---
    // This is crucial for correctly finding component files 
    // from different folder depths (e.g., /pages/ vs /pages/admin/).
    const isAdminPage = window.location.pathname.includes('/admin/');
    const basePath = isAdminPage ? '../../' : '../';

    // --- 2. LOAD ALL COMPONENTS ---
    loadSidebar(basePath, isAdminPage);
    loadHeader(basePath);
    loadFooter(basePath);

    // --- 3. INITIALIZE WEBSOCKET CONNECTION ---
    initializeSocketConnection();
});

/**
 * Apply theme immediately when script loads (before DOM ready)
 * to prevent flash of wrong theme
 */
function applyThemeOnLoad() {
    const theme = currentTheme;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Initialize WebSocket connection for real-time updates.
 * Uses initSocket from socket-client.js if available.
 */
function initializeSocketConnection() {
    // Check if socket-client.js is loaded
    if (typeof initSocket !== 'function') {
        console.log('[Main] Socket client not available, skipping real-time connection');
        return;
    }

    // Check if user is authenticated (optional - connect anyway for public updates)
    const hasToken = typeof getToken === 'function' ? !!getToken() : !!localStorage.getItem('authToken');

    // Initialize socket with handlers
    try {
        initSocket(
            // onConnect callback
            (socket) => {
                console.log('[Main] WebSocket connected:', socket.id);
                
                // Dispatch connection event
                window.dispatchEvent(new CustomEvent('socket:connected', {
                    detail: { socketId: socket.id }
                }));
            },
            // Custom event handlers
            {
                // Handle spot updates - dispatch as window CustomEvent
                'spot:update': (payload) => {
                    console.log('[Main] Received spot:update:', payload);
                    window.dispatchEvent(new CustomEvent('spot:update', {
                        detail: payload
                    }));
                },
                
                // Handle booking updates
                'booking:update': (payload) => {
                    console.log('[Main] Received booking:update:', payload);
                    window.dispatchEvent(new CustomEvent('booking:update', {
                        detail: payload
                    }));
                },
                
                // Handle general notifications
                'notification': (payload) => {
                    console.log('[Main] Received notification:', payload);
                    window.dispatchEvent(new CustomEvent('notification', {
                        detail: payload
                    }));
                    
                    // Optionally show notification to user
                    if (payload.message) {
                        showNotification(payload.message, payload.type || 'info');
                    }
                }
            }
        );

        console.log('[Main] WebSocket initialization started');

    } catch (error) {
        console.error('[Main] Failed to initialize WebSocket:', error);
    }
}

/**
 * Show a notification to the user (toast-style).
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
 */
function showNotification(message, type = 'info') {
    // Check if there's a notification container
    let container = document.getElementById('notification-container');
    
    if (!container) {
        // Create container if it doesn't exist
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        padding: 12px 20px;
        border-radius: 8px;
        background: var(--bg-secondary, #333);
        color: var(--text-primary, #fff);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 350px;
    `;
    notification.textContent = message;

    // Add type-specific styling
    if (type === 'success') {
        notification.style.borderLeft = '4px solid #10B981';
    } else if (type === 'error') {
        notification.style.borderLeft = '4px solid #EF4444';
    } else if (type === 'warning') {
        notification.style.borderLeft = '4px solid #F59E0B';
    } else {
        notification.style.borderLeft = '4px solid #3B82F6';
    }

    container.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

/**
 * Fetches and injects the correct sidebar (User or Admin).
 * @param {string} basePath - The relative path to the project root (e.g., '../' or '../../').
 * @param {boolean} isAdminPage - Flag to determine which sidebar to load.
 */
function loadSidebar(basePath, isAdminPage) {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    if (!sidebarPlaceholder) return;

    const sidebarUrl = isAdminPage 
        ? `${basePath}components/sidebar-admin.html` 
        : `${basePath}components/sidebar-user.html`;

    fetch(sidebarUrl)
        .then(response => response.text())
        .then(data => {
            sidebarPlaceholder.innerHTML = data;
            
            // --- 3. POST-LOAD ACTIONS ---
            // These functions can only run *after* the sidebar HTML is loaded.
            setActiveSidebarLink();
            addLogoutListener(isAdminPage);
            
            // Initialize theme toggle (buttons are inside sidebar)
            initializeThemeToggle(); 
        })
        .catch(error => console.error('Error loading sidebar:', error));
}

/**
 * Fetches and injects the reusable header.
 * @param {string} basePath - The relative path to the project root.
 */
function loadHeader(basePath) {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (!headerPlaceholder) return;

    const headerUrl = `${basePath}components/header.html`;

    fetch(headerUrl)
        .then(response => response.text())
        .then(data => {
            headerPlaceholder.innerHTML = data;
            // Set the page title after the header is loaded
            setPageTitle();
        })
        .catch(error => console.error('Error loading header:', error));
}

/**
 * Fetches and injects the reusable footer.
 * @param {string} basePath - The relative path to the project root.
 */
function loadFooter(basePath) {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerUrl = `${basePath}components/footer.html`;

    fetch(footerUrl)
        .then(response => response.text())
        .then(data => {
            footerPlaceholder.innerHTML = data;
            // Set the copyright year after the footer is loaded
            setCopyrightYear();
        })
        .catch(error => console.error('Error loading footer:', error));
}


// --- HELPER FUNCTIONS (Called after components are loaded) ---

/**
 * Finds the <h1> in the loaded header and sets its text
 * to the content of the page's <title> tag.
 */
function setPageTitle() {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = document.title;
    }
}

/**
 * Finds the copyright year span in the loaded footer
 * and sets it to the current year.
 */
function setCopyrightYear() {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

/**
 * Finds the correct sidebar link that matches the current page
 * and gives it the 'active' class.
 */
function setActiveSidebarLink() {
    // Get the path of the current page (e.g., "/pages/user-dashboard.html")
    const currentPagePath = window.location.pathname;
    
    // Get all the links in the sidebar
    const sidebarLinks = document.querySelectorAll('.sidebar__menu-link');

    sidebarLinks.forEach(link => {
        // Get the full URL from the link (e.g., "http://.../pages/user-dashboard.html")
        // and convert it to just its path.
        const linkPath = new URL(link.href).pathname;

        // Remove any old active class
        link.classList.remove('sidebar__menu-link--active');

        // Check if the link's path is part of the current page's path
        if (currentPagePath.includes(linkPath)) {
            link.classList.add('sidebar__menu-link--active');
        }
    });
}

/**
 * Adds a click event listener to the logout button.
 * @param {boolean} isAdminPage - Flag to determine where to redirect.
 */
function addLogoutListener(isAdminPage) {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Stop the link from trying to navigate
            
            console.log('[Main] User logging out...');
            
            // Use logout function from auth.js if available
            if (typeof logout === 'function') {
                const loginPage = isAdminPage ? 'admin-login.html' : 'login.html';
                logout(loginPage);
                return;
            }
            
            // Fallback: manual logout
            // Clear token
            if (typeof removeToken === 'function') {
                removeToken();
            } else {
                localStorage.removeItem('authToken');
            }
            
            // Disconnect socket
            if (typeof disconnectSocket === 'function') {
                disconnectSocket();
            }

            // Determine the correct login page to redirect to.
            const loginPage = isAdminPage ? 'admin-login.html' : 'login.html';
            
            // Redirect the user
            window.location.href = loginPage;
        });
    }
}


// --- THEME TOGGLE LOGIC ---

/**
 * Sets up event listeners for the theme toggle buttons
 * and sets the initial active button state.
 */
function initializeThemeToggle() {
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    const systemBtn = document.getElementById('theme-system');

    // If theme buttons don't exist on this page, skip initialization
    if (!lightBtn || !darkBtn || !systemBtn) {
        return;
    }

    lightBtn.addEventListener('click', () => setTheme('light'));
    darkBtn.addEventListener('click', () => setTheme('dark'));
    systemBtn.addEventListener('click', () => setTheme('system'));

    // Set the initial active button based on the current theme
    updateToggleButtonStates();

    // Also listen for changes in OS preference if 'system' is selected
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentTheme === 'system') {
            // Re-apply theme based on new OS preference
            applyTheme();
        }
    });
}

/**
 * Updates the theme preference in localStorage and applies the theme.
 * @param {'light' | 'dark' | 'system'} theme
 */
function setTheme(theme) {
    currentTheme = theme; // Update global variable
    localStorage.setItem('theme', theme); // Save preference
    applyTheme(); // Apply the visual changes
    updateToggleButtonStates(); // Update which button is active
    
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
}

/**
 * Applies the theme by adding/removing the '.dark' class on the <html> element.
 * This logic should mirror the logic in theme.js
 */
function applyTheme() {
    const theme = currentTheme; // Use the global variable
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * Updates the visual state (active class) of the theme toggle buttons.
 */
function updateToggleButtonStates() {
    const lightBtn = document.getElementById('theme-light');
    const darkBtn = document.getElementById('theme-dark');
    const systemBtn = document.getElementById('theme-system');

    if (!lightBtn || !darkBtn || !systemBtn) return;

    // Remove active class from all buttons first
    lightBtn.classList.remove('active');
    darkBtn.classList.remove('active');
    systemBtn.classList.remove('active');

    // Add active class to the currently selected theme button
    if (currentTheme === 'light') {
        lightBtn.classList.add('active');
    } else if (currentTheme === 'dark') {
        darkBtn.classList.add('active');
    } else { // System
        systemBtn.classList.add('active');
    }
}

// --- EXPORTS ---
// Export functions for external use if needed
window.showNotification = showNotification;
window.initializeSocketConnection = initializeSocketConnection;

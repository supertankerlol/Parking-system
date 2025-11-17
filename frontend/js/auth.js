/**
 * auth.js
 * Handles client-side logic for login.html and register.html.
 * 
 * This file manages both forms by checking which one exists on the current page.
 * Now connected to Node.js/Express backend API!
 */

// Backend API base URL
const API_BASE_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the login page
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Check if we are on the register page
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

/**
 * Handles the login form submission.
 * @param {Event} e - The form submission event.
 */
async function handleLogin(e) {
    e.preventDefault(); // Stop the form from reloading the page

    const errorEl = document.getElementById('auth-error');
    const submitButton = e.target.querySelector('button[type="submit"]');
    errorEl.textContent = ''; // Clear previous errors

    // --- Get form data ---
    const email = e.target.email.value;
    const password = e.target.password.value;

    // --- Show loading state ---
    submitButton.disabled = true;
    submitButton.textContent = 'Logging In...';

    try {
        // --- 1. REAL API CALL (Backend) ---
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        // --- 2. Handle Response ---
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
        }

        // --- 3. SUCCESS ---
        console.log('Login successful:', data);

        // Save tokens to localStorage
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        // Save user info
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Redirect based on user role
        if (data.data.user.role === 'ADMIN') {
            window.location.href = 'admin/admin-dashboard.html'; // Go to Admin Dashboard
        } else {
            window.location.href = 'user-dashboard.html'; // Go to User Dashboard
        }

    } catch (error) {
        // --- 4. FAILURE ---
        console.error('Login error:', error);
        errorEl.textContent = error.message || 'Invalid email or password';
    } finally {
        // --- 5. CLEANUP ---
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

/**
 * Handles the register form submission.
 * @param {Event} e - The form submission event.
 */
async function handleRegister(e) {
    e.preventDefault(); // Stop the form from reloading the page

    const errorEl = document.getElementById('auth-error');
    const submitButton = e.target.querySelector('button[type="submit"]');
    errorEl.textContent = ''; // Clear previous errors

    // --- Get form data ---
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    // --- 1. Client-Side Validation ---
    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match.';
        return;
    }
    if (password.length < 6) {
        errorEl.textContent = 'Password must be at least 6 characters long.';
        return;
    }

    // Split name into first and last name (basic)
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // If no last name, use first name

    // --- Show loading state ---
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
        // --- 2. REAL API CALL (Backend) ---
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                firstName,
                lastName,
                phoneNumber: '' // Optional: add phone input to your form
            })
        });

        const data = await response.json();

        // --- 3. Handle Response ---
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Registration failed');
        }

        // --- 4. SUCCESS ---
        console.log('Registration successful:', data);

        // Save tokens (auto-login after registration)
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));

        // Show success message and redirect
        alert('Registration successful! Welcome to the parking system.');
        window.location.href = 'user-dashboard.html'; // Go directly to dashboard

    } catch (error) {
        // --- 5. FAILURE ---
        console.error('Registration error:', error);
        errorEl.textContent = error.message || 'Registration failed. Please try again.';
    } finally {
        // --- 6. CLEANUP ---
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
}

/**
 * Utility: Get current user from localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Utility: Check if user is logged in
 */
function isLoggedIn() {
    return !!localStorage.getItem('accessToken');
}

/**
 * Utility: Logout
 */
async function logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    const accessToken = localStorage.getItem('accessToken');

    if (refreshToken && accessToken) {
        try {
            // Call backend logout endpoint
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ refreshToken })
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = 'login.html';
}

// Export utilities for use in other scripts
window.authUtils = {
    getCurrentUser,
    isLoggedIn,
    logout,
    API_BASE_URL
};

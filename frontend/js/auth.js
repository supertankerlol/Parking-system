/**
 * auth.js
 * Handles client-side logic for login.html and register.html.
 *
 * This one file manages both forms by checking which one exists on the current page.
 */

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
        // --- 1. FAKE API CALL (Simulating backend) ---
        const response = await fakeApiLogin(email, password);

        // --- 2. SUCCESS ---
        // In a real app, you would save the token:
        // localStorage.setItem('authToken', response.token);
        
        console.log('Login successful:', response);

        // Redirect to the correct dashboard
        if (response.isAdmin) {
            window.location.href = 'admin/admin-dashboard.html'; // Go to Admin Dashboard
        } else {
            window.location.href = 'user-dashboard.html'; // Go to User Dashboard
        }

    } catch (error) {
        // --- 3. FAILURE ---
        errorEl.textContent = error.message;
    } finally {
        // --- 4. CLEANUP ---
        // Re-enable the button regardless of success or failure
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
    // const licensePlate = e.target.licensePlate.value; // You can pass this too

    // --- 1. Client-Side Validation ---
    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match.';
        return;
    }
    if (password.length < 8) {
        errorEl.textContent = 'Password must be at least 8 characters long.';
        return;
    }

    // --- Show loading state ---
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
        // --- 2. FAKE API CALL (Simulating backend) ---
        await fakeApiRegister(name, email, password);

        // --- 3. SUCCESS ---
        // For an MVP, an alert is simple. A real app might show a success message.
        alert('Registration successful! Please log in to continue.');
        window.location.href = 'login.html'; // Redirect to login page

    } catch (error) {
        // --- 4. FAILURE ---
        errorEl.textContent = error.message;
    } finally {
        // --- 5. CLEANUP ---
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
}


// --- FAKE BACKEND API SIMULATION ---
// (You can delete this section when you have a real backend)

/**
 * Simulates a network request to a login API.
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
function fakeApiLogin(email, password) {
    console.log(`Attempting login for: ${email}`);
    
    // We create a promise to simulate the network delay
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // --- Define your test users here ---
            if (email === 'admin@test.com' && password === 'admin123') {
                resolve({ 
                    success: true, 
                    isAdmin: true, 
                    token: 'fake-admin-token-xyz' 
                });
            } else if (email === 'user@test.com' && password === 'user123') {
                resolve({ 
                    success: true, 
                    isAdmin: false, 
                    token: 'fake-user-token-abc' 
                });
            } else {
                reject(new Error('Invalid email or password.'));
            }
        }, 1000); // 1-second delay
    });
}

/**
 * Simulates a network request to a register API.
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
function fakeApiRegister(name, email, password) {
    console.log(`Attempting to register: ${email}`);
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate a "user already exists" error
            if (email === 'user@test.com' || email === 'admin@test.com') {
                reject(new Error('This email address is already in use.'));
            } else {
                // On success, the backend would create the user
                console.log('Fake API: User created', { name, email, password });
                resolve({ success: true });
            }
        }, 1000); // 1-second delay
    });
}

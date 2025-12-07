/**
 * profile.js - User Profile Page Management
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 */

(function () {
    'use strict';

    let currentUser = null;

    // =========================================================================
    // API FUNCTIONS
    // =========================================================================

    /**
     * Load user profile from the backend API.
     * GET /api/users/me
     * @returns {Promise<Object>} User profile data
     */
    async function loadProfile() {
        console.log('[Profile] Loading user profile...');

        const response = await apiFetch('/users/me');
        currentUser = response.user;

        console.log('[Profile] Profile loaded:', currentUser);

        // Populate the form with user data
        populateProfileForm(currentUser);

        return currentUser;
    }

    /**
     * Update user profile.
     * PUT /api/users/me
     * @param {Object} profileData - Profile data to update
     * @param {string} [profileData.fullName] - User's full name
     * @param {string} [profileData.phone] - User's phone number
     * @param {string} [profileData.defaultLicense] - User's default license plate
     * @returns {Promise<Object>} Updated user data
     */
    async function updateProfile(profileData) {
        console.log('[Profile] Updating profile:', profileData);

        const response = await apiFetch('/users/me', {
            method: 'PUT',
            body: profileData
        });

        currentUser = response.user;
        console.log('[Profile] Profile updated:', currentUser);

        return currentUser;
    }

    /**
     * Upload user avatar.
     * PUT /api/users/me/avatar
     * @param {File} file - Image file to upload
     * @returns {Promise<Object>} Response with updated user and message
     */
    async function uploadAvatar(file) {
        console.log('[Profile] Uploading avatar:', file.name);

        const formData = new FormData();
        formData.append('avatar', file);

        const response = await apiFetch('/users/me/avatar', {
            method: 'PUT',
            body: formData
        });

        currentUser = response.user;
        console.log('[Profile] Avatar uploaded:', response.message);

        return response;
    }

    /**
     * Update user password.
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response
     */
    async function updatePassword(currentPassword, newPassword) {
        console.log('[Profile] Updating password...');

        const response = await apiFetch('/users/me/password', {
            method: 'PUT',
            body: {
                currentPassword,
                newPassword
            }
        });

        console.log('[Profile] Password updated');
        return response;
    }

    /**
     * Get user payment history.
     * GET /api/users/payments
     * @returns {Promise<Array>} Array of payments
     */
    async function getPaymentHistory() {
        console.log('[Profile] Loading payment history...');

        const response = await apiFetch('/users/payments');
        return response.payments || [];
    }

    /**
     * Get user parking history.
     * GET /api/users/history
     * @returns {Promise<Array>} Array of parking history entries
     */
    async function getParkingHistory() {
        console.log('[Profile] Loading parking history...');

        const response = await apiFetch('/users/history');
        return response.history || [];
    }

    // =========================================================================
    // UI POPULATION
    // =========================================================================

    /**
     * Populate profile form with user data.
     * @param {Object} user - User data
     */
    function populateProfileForm(user) {
        if (!user) return;

        const nameInput = document.getElementById('profile-name');
        const emailInput = document.getElementById('profile-email');
        const phoneInput = document.getElementById('profile-phone');
        const avatarImage = document.getElementById('avatar-image');
        const avatarInitials = document.getElementById('avatar-initials');

        if (nameInput && user.fullName) {
            nameInput.value = user.fullName;
        }

        if (emailInput && user.email) {
            emailInput.value = user.email;
            // Email is typically read-only after registration
            emailInput.readOnly = true;
        }

        if (phoneInput && user.phone) {
            phoneInput.value = user.phone;
        }

        // Update avatar
        if (user.avatarUrl) {
            if (avatarImage) {
                // Prepend API base for relative URLs
                const avatarSrc = user.avatarUrl.startsWith('http') 
                    ? user.avatarUrl 
                    : `${window.API_BASE?.replace('/api', '') || ''}${user.avatarUrl}`;
                avatarImage.src = avatarSrc;
                avatarImage.classList.remove('hidden');
            }
            if (avatarInitials) {
                avatarInitials.classList.add('hidden');
            }
        } else {
            // Show initials
            updateInitials(user.fullName);
        }
    }

    /**
     * Update avatar initials display.
     * @param {string} [name] - User's name
     */
    function updateInitials(name) {
        const avatarInitials = document.getElementById('avatar-initials');
        const avatarImage = document.getElementById('avatar-image');

        if (!avatarInitials) return;

        const displayName = name || document.getElementById('profile-name')?.value || 'User';
        const initials = displayName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        avatarInitials.textContent = initials || 'U';

        // Show initials, hide image if no avatar
        if (!currentUser?.avatarUrl) {
            avatarInitials.classList.remove('hidden');
            if (avatarImage) avatarImage.classList.add('hidden');
        }
    }

    /**
     * Populate payment history table.
     * @param {Array} payments - Array of payment data
     */
    function populatePaymentHistory(payments) {
        const tableBody = document.getElementById('receipt-table-body');
        if (!tableBody) return;

        if (!payments || payments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">No payment history found.</td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = payments.map(payment => {
            const date = new Date(payment.createdAt || payment.date).toLocaleDateString();
            const spotName = payment.spotName || payment.spot?.name || 'N/A';
            const duration = payment.duration || calculateDuration(payment.startTime, payment.endTime);
            const total = payment.amount ? `$${payment.amount.toFixed(2)}` : 'N/A';

            return `
                <tr>
                    <td>${date}</td>
                    <td>${spotName}</td>
                    <td>${duration}</td>
                    <td>${total}</td>
                    <td>
                        <button class="btn btn-small btn-secondary" onclick="downloadReceipt('${payment.id}')">
                            Download
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Calculate duration string from start and end times.
     * @param {string} startTime - Start time
     * @param {string} endTime - End time
     * @returns {string} Duration string
     */
    function calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return 'N/A';

        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
        }
        return `${minutes}m`;
    }

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    /**
     * Show message in a form.
     * @param {string} elementId - Message element ID
     * @param {string} message - Message text
     * @param {string} type - Message type ('success' or 'error')
     */
    function showMessage(elementId, message, type = 'success') {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `form-message ${type}`;
            messageEl.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Hide message element.
     * @param {string} elementId - Message element ID
     */
    function hideMessage(elementId) {
        const messageEl = document.getElementById(elementId);
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }

    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================

    /**
     * Handle profile form submission.
     * @param {Event} e - Form submit event
     */
    async function handleProfileSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Save Changes';

        hideMessage('profile-message');

        // Get form data
        const fullName = document.getElementById('profile-name')?.value.trim();
        const phone = document.getElementById('profile-phone')?.value.trim();

        if (!fullName) {
            showMessage('profile-message', 'Name is required.', 'error');
            return;
        }

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Saving...';
        }

        try {
            await updateProfile({ fullName, phone });
            showMessage('profile-message', 'Profile updated successfully!', 'success');
            updateInitials(fullName);
        } catch (error) {
            console.error('[Profile] Update failed:', error);
            showMessage('profile-message', error.message || 'Failed to update profile.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    /**
     * Handle password form submission.
     * @param {Event} e - Form submit event
     */
    async function handlePasswordSubmit(e) {
        e.preventDefault();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent || 'Update Password';

        hideMessage('password-message');

        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('password-message', 'All fields are required.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('password-message', 'New passwords do not match.', 'error');
            return;
        }

        if (newPassword.length < 8) {
            showMessage('password-message', 'Password must be at least 8 characters long.', 'error');
            return;
        }

        // Show loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';
        }

        try {
            await updatePassword(currentPassword, newPassword);
            showMessage('password-message', 'Password updated successfully!', 'success');
            form.reset();
        } catch (error) {
            console.error('[Profile] Password update failed:', error);
            showMessage('password-message', error.message || 'Failed to update password.', 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    /**
     * Handle avatar file selection.
     * @param {Event} e - File input change event
     */
    async function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const avatarImage = document.getElementById('avatar-image');
        const avatarInitials = document.getElementById('avatar-initials');

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB.');
            return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = function (event) {
            if (avatarImage) {
                avatarImage.src = event.target.result;
                avatarImage.classList.remove('hidden');
            }
            if (avatarInitials) {
                avatarInitials.classList.add('hidden');
            }
        };
        reader.readAsDataURL(file);

        // Upload to server
        try {
            const response = await uploadAvatar(file);
            console.log('[Profile] Avatar uploaded successfully');
            
            // Update the image src with server URL
            if (avatarImage && response.user?.avatarUrl) {
                const avatarSrc = response.user.avatarUrl.startsWith('http')
                    ? response.user.avatarUrl
                    : `${window.API_BASE?.replace('/api', '') || ''}${response.user.avatarUrl}`;
                avatarImage.src = avatarSrc;
            }
        } catch (error) {
            console.error('[Profile] Avatar upload failed:', error);
            alert(error.message || 'Failed to upload avatar. Please try again.');
            
            // Revert to previous state
            if (currentUser?.avatarUrl) {
                if (avatarImage) avatarImage.src = currentUser.avatarUrl;
            } else {
                if (avatarImage) avatarImage.classList.add('hidden');
                if (avatarInitials) avatarInitials.classList.remove('hidden');
            }
        }
    }

    /**
     * Handle vehicle form submission.
     * @param {Event} e - Form submit event
     */
    async function handleAddVehicle(e) {
        e.preventDefault();

        const plateInput = document.getElementById('new-plate');
        const plate = plateInput?.value.trim().toUpperCase();

        if (!plate) return;

        try {
            // Update profile with new license plate
            await updateProfile({ defaultLicense: plate });
            
            plateInput.value = '';
            renderVehicles();
            
            alert('Vehicle added successfully!');
        } catch (error) {
            console.error('[Profile] Failed to add vehicle:', error);
            alert(error.message || 'Failed to add vehicle.');
        }
    }

    /**
     * Render vehicles list.
     */
    function renderVehicles() {
        const vehicleList = document.getElementById('vehicle-list');
        const noVehicles = document.getElementById('no-vehicles');

        // Get vehicles from current user
        const vehicles = [];
        if (currentUser?.defaultLicense) {
            vehicles.push(currentUser.defaultLicense);
        }

        if (vehicles.length === 0) {
            if (vehicleList) vehicleList.innerHTML = '';
            if (noVehicles) noVehicles.classList.remove('hidden');
        } else {
            if (noVehicles) noVehicles.classList.add('hidden');
            if (vehicleList) {
                vehicleList.innerHTML = vehicles.map(vehicle => `
                    <li class="item-list-row">
                        <span>${vehicle}</span>
                        <button type="button" class="btn btn-danger btn-small" onclick="removeVehicle('${vehicle}')">
                            Remove
                        </button>
                    </li>
                `).join('');
            }
        }
    }

    /**
     * Remove a vehicle.
     * @param {string} plate - License plate to remove
     */
    async function removeVehicle(plate) {
        if (!confirm(`Remove vehicle ${plate}?`)) return;

        try {
            await updateProfile({ defaultLicense: null });
            renderVehicles();
        } catch (error) {
            console.error('[Profile] Failed to remove vehicle:', error);
            alert(error.message || 'Failed to remove vehicle.');
        }
    }

    /**
     * Download a receipt.
     * @param {string} paymentId - Payment ID
     */
    function downloadReceipt(paymentId) {
        // TODO: Implement receipt download
        console.log('[Profile] Downloading receipt:', paymentId);
        alert('Receipt download coming soon!');
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize profile page.
     */
    async function initProfile() {
        console.log('[Profile] Initializing...');

        // Check authentication
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            console.log('[Profile] Not authenticated, redirecting to login');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        // Setup form handlers
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', handleProfileSubmit);
        }

        const passwordForm = document.getElementById('password-form');
        if (passwordForm) {
            passwordForm.addEventListener('submit', handlePasswordSubmit);
        }

        const avatarInput = document.getElementById('avatar-input');
        if (avatarInput) {
            avatarInput.addEventListener('change', handleAvatarChange);
        }

        const changePhotoBtn = document.getElementById('change-photo-btn');
        if (changePhotoBtn && avatarInput) {
            changePhotoBtn.addEventListener('click', () => avatarInput.click());
        }

        const addVehicleForm = document.getElementById('add-vehicle-form');
        if (addVehicleForm) {
            addVehicleForm.addEventListener('submit', handleAddVehicle);
        }

        // Update initials when name changes
        const profileNameInput = document.getElementById('profile-name');
        if (profileNameInput) {
            profileNameInput.addEventListener('input', () => updateInitials());
        }

        // Load profile data
        try {
            await loadProfile();
            renderVehicles();

            // Load payment history
            try {
                const payments = await getPaymentHistory();
                populatePaymentHistory(payments);
            } catch (error) {
                console.warn('[Profile] Could not load payment history:', error.message);
            }
        } catch (error) {
            console.error('[Profile] Failed to load profile:', error);
            
            if (error.status === 401) {
                // Token expired or invalid
                if (typeof removeToken === 'function') removeToken();
                window.location.href = 'login.html';
            }
        }

        console.log('[Profile] Initialization complete');
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initProfile);

    // Export functions for external use
    window.loadProfile = loadProfile;
    window.updateProfile = updateProfile;
    window.uploadAvatar = uploadAvatar;
    window.updatePassword = updatePassword;
    window.getPaymentHistory = getPaymentHistory;
    window.getParkingHistory = getParkingHistory;
    window.removeVehicle = removeVehicle;
    window.downloadReceipt = downloadReceipt;

    // Export as namespace
    window.Profile = {
        load: loadProfile,
        update: updateProfile,
        uploadAvatar,
        updatePassword,
        getPayments: getPaymentHistory,
        getHistory: getParkingHistory
    };

})();

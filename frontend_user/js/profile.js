// Profile page functionality

// Avatar functionality
document.addEventListener('DOMContentLoaded', function() {
    const avatarInput = document.getElementById('avatar-input');
    const changePhotoBtn = document.getElementById('change-photo-btn');
    const avatarImage = document.getElementById('avatar-image');
    const avatarInitials = document.getElementById('avatar-initials');
    const profileNameInput = document.getElementById('profile-name');

    // Initialize avatar with user's initials
    function updateInitials() {
        const name = profileNameInput?.value || 'User';
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        avatarInitials.textContent = initials || 'U';
    }

    // Initialize on page load
    updateInitials();

    // Update initials when name changes
    if (profileNameInput) {
        profileNameInput.addEventListener('input', updateInitials);
    }

    // Handle "Change Photo" button click
    if (changePhotoBtn && avatarInput) {
        changePhotoBtn.addEventListener('click', function() {
            avatarInput.click();
        });
    }

    // Handle file selection
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
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

                // Create preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    avatarImage.src = e.target.result;
                    avatarImage.classList.remove('hidden');
                    avatarInitials.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const messageEl = document.getElementById('profile-message');
            
            // TODO: Implement backend API call
            // For now, just show success message
            if (messageEl) {
                messageEl.textContent = 'Profile updated successfully!';
                messageEl.className = 'form-message success';
                messageEl.style.display = 'block';
                
                // Update initials if name changed
                updateInitials();
                
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Password form submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const messageEl = document.getElementById('password-message');
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Validation
            if (newPassword !== confirmPassword) {
                if (messageEl) {
                    messageEl.textContent = 'New passwords do not match.';
                    messageEl.className = 'form-message error';
                    messageEl.style.display = 'block';
                }
                return;
            }

            if (newPassword.length < 8) {
                if (messageEl) {
                    messageEl.textContent = 'Password must be at least 8 characters long.';
                    messageEl.className = 'form-message error';
                    messageEl.style.display = 'block';
                }
                return;
            }

            // TODO: Implement backend API call
            // For now, just show success message
            if (messageEl) {
                messageEl.textContent = 'Password updated successfully!';
                messageEl.className = 'form-message success';
                messageEl.style.display = 'block';
                passwordForm.reset();
                
                setTimeout(() => {
                    messageEl.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Vehicle management
    const addVehicleForm = document.getElementById('add-vehicle-form');
    const vehicleList = document.getElementById('vehicle-list');
    const noVehicles = document.getElementById('no-vehicles');

    function renderVehicles() {
        // TODO: Load vehicles from backend
        // For now, use empty array
        const vehicles = [];
        
        if (vehicles.length === 0) {
            if (vehicleList) vehicleList.innerHTML = '';
            if (noVehicles) noVehicles.classList.remove('hidden');
        } else {
            if (noVehicles) noVehicles.classList.add('hidden');
            if (vehicleList) {
                vehicleList.innerHTML = vehicles.map(vehicle => `
                    <li class="item-list-row">
                        <span>${vehicle}</span>
                        <button type="button" class="btn btn-danger btn-small" data-plate="${vehicle}">Remove</button>
                    </li>
                `).join('');
            }
        }
    }

    if (addVehicleForm) {
        addVehicleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const plateInput = document.getElementById('new-plate');
            const plate = plateInput.value.trim().toUpperCase();

            if (plate) {
                // TODO: Add vehicle via backend API
                // For now, just clear the input
                plateInput.value = '';
                
                // Re-render vehicles (will be empty until backend is implemented)
                renderVehicles();
            }
        });
    }

    // Initialize vehicles list
    renderVehicles();
});

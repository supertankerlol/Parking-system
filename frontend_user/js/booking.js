// js/booking.js - Booking Page Management

let bookingSpotData = null;
let spotId = null;

// Initialize booking system
function initBookingSystem() {
    console.log('Booking system initialized');

    // Check authentication
    if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        alert('Please log in to book a parking spot.');
        window.location.href = 'login.html';
        return;
    }

    // Get spot ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    spotId = urlParams.get('spotId');

    if (!spotId) {
        // Try to get from sessionStorage (from pending booking)
        spotId = sessionStorage.getItem('pendingBookingSpotId');
    }

    if (!spotId) {
        console.error('No spot ID provided');
        showError('No parking spot selected. Please select a spot from the map.');
        return;
    }

    // Load spot data
    loadSpotData();

    // Setup form handlers
    setupBookingForm();

    // Set default times
    setDefaultBookingTimes();
}

// Check if user is authenticated
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Load spot data from sessionStorage or construct from spotId
function loadSpotData() {
    try {
        // Try to get from sessionStorage first (set by parking.js)
        const storedData = sessionStorage.getItem('bookingSpotData');
        
        if (storedData) {
            bookingSpotData = JSON.parse(storedData);
            console.log('Loaded spot data from sessionStorage:', bookingSpotData);
        } else {
            // Fallback: construct basic data from spotId
            // In a real app, you'd fetch from API
            bookingSpotData = {
                spotId: spotId,
                spotName: `Parking Spot ${spotId}`,
                spotAddress: 'Address not available',
                price: 5.00, // Default rate
                dayRate: null,
                earlyBirdRate: null
            };
            console.warn('No stored spot data found, using defaults');
        }

        // Populate booking details
        populateBookingDetails(bookingSpotData);

    } catch (error) {
        console.error('Error loading spot data:', error);
        showError('Failed to load spot details. Please try again.');
    }
}

// Populate booking details section
function populateBookingDetails(data) {
    const lotNameElement = document.getElementById('booking-lot-name');
    const addressElement = document.getElementById('booking-address');
    const spotIdElement = document.getElementById('booking-spot-id');
    const hourlyRateElement = document.getElementById('booking-hourly-rate');
    const dayRateElement = document.getElementById('booking-day-rate');
    const dayRateContainer = document.getElementById('booking-day-rate-container');
    const earlyBirdElement = document.getElementById('booking-early-bird');
    const earlyBirdContainer = document.getElementById('booking-early-bird-container');
    const rateElement = document.getElementById('summary-rate');

    if (lotNameElement && data.spotName) {
        lotNameElement.textContent = data.spotName;
    }

    if (addressElement && data.spotAddress) {
        addressElement.textContent = data.spotAddress;
    }

    if (spotIdElement && data.spotId) {
        spotIdElement.textContent = data.spotId;
    }

    const hourlyRate = data.price || 5.00;
    if (hourlyRateElement) {
        hourlyRateElement.textContent = hourlyRate === 0 ? 'Free' : `$${hourlyRate.toFixed(2)}/hr`;
    }

    if (rateElement) {
        rateElement.textContent = hourlyRate === 0 ? 'Free' : `$${hourlyRate.toFixed(2)}/hr`;
    }

    // Show day rate if available
    if (data.dayRate !== null && data.dayRate !== undefined) {
        if (dayRateElement) {
            dayRateElement.textContent = `$${data.dayRate.toFixed(2)}`;
        }
        if (dayRateContainer) {
            dayRateContainer.style.display = 'flex';
        }
    }

    // Show early bird rate if available
    if (data.earlyBirdRate !== null && data.earlyBirdRate !== undefined) {
        if (earlyBirdElement) {
            earlyBirdElement.textContent = `$${data.earlyBirdRate.toFixed(2)}`;
        }
        if (earlyBirdContainer) {
            earlyBirdContainer.style.display = 'flex';
        }
    }
}

// Setup booking form handlers
function setupBookingForm() {
    const form = document.getElementById('booking-form');
    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');

    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }

    if (startInput) {
        startInput.addEventListener('change', calculateBookingCost);
    }

    if (endInput) {
        endInput.addEventListener('change', calculateBookingCost);
    }
}

// Set default booking times (now + 1 hour)
function setDefaultBookingTimes() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');

    if (startInput) {
        startInput.value = formatDateTimeLocal(now);
        startInput.min = formatDateTimeLocal(now); // Prevent past dates
    }

    if (endInput) {
        endInput.value = formatDateTimeLocal(oneHourLater);
        endInput.min = formatDateTimeLocal(oneHourLater); // End time must be after start
    }

    // Calculate initial cost
    calculateBookingCost();
}

// Format date for datetime-local input
function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Calculate booking cost
function calculateBookingCost() {
    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');
    const durationElement = document.getElementById('summary-duration');
    const totalElement = document.getElementById('summary-total');

    if (!startInput || !endInput || !bookingSpotData) return;

    const startTime = new Date(startInput.value);
    const endTime = new Date(endInput.value);

    // Update end time min when start time changes
    if (startInput.value) {
        const minEndTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour minimum
        endInput.min = formatDateTimeLocal(minEndTime);
    }

    if (startTime && endTime && endTime > startTime) {
        const durationMs = endTime - startTime;
        const durationHours = durationMs / (1000 * 60 * 60);
        const ratePerHour = bookingSpotData.price || 5.00;
        const totalCost = durationHours * ratePerHour;

        if (durationElement) {
            if (durationHours < 1) {
                const minutes = Math.round(durationHours * 60);
                durationElement.textContent = `${minutes} minutes`;
            } else {
                durationElement.textContent = `${durationHours.toFixed(1)} hours`;
            }
        }

        if (totalElement) {
            totalElement.textContent = `$${totalCost.toFixed(2)}`;
        }
    } else {
        if (durationElement) {
            durationElement.textContent = '--';
        }
        if (totalElement) {
            totalElement.textContent = '$0.00';
        }
    }
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('booking-error');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();

    console.log('Confirming booking...');

    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');
    const confirmButton = document.getElementById('confirm-booking-btn');

    if (!startInput || !endInput) return;

    const startTime = startInput.value;
    const endTime = endInput.value;

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (start < now) {
        showError('Start time cannot be in the past.');
        return;
    }

    if (end <= start) {
        showError('End time must be after start time.');
        return;
    }

    // Disable button and show loading state
    if (confirmButton) {
        confirmButton.disabled = true;
        confirmButton.textContent = 'Processing...';
    }

    try {
        // Prepare booking data
        const bookingData = {
            spotId: bookingSpotData.spotId,
            spotName: bookingSpotData.spotName,
            spotAddress: bookingSpotData.spotAddress,
            startTime: startTime,
            endTime: endTime,
            totalCost: document.getElementById('summary-total').textContent,
            bookingId: generateBookingId(),
            timestamp: new Date().toISOString()
        };

        // Store booking data for payment page
        sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

        console.log('Booking confirmed, redirecting to payment:', bookingData);

        // Clear pending booking spot ID
        sessionStorage.removeItem('pendingBookingSpotId');
        sessionStorage.removeItem('bookingSpotData');

        // Redirect to payment page
        window.location.href = '../pages/payment.html';

    } catch (error) {
        console.error('Booking error:', error);
        showError('An error occurred while processing your booking. Please try again.');

        // Re-enable button
        if (confirmButton) {
            confirmButton.disabled = false;
            confirmButton.textContent = 'Confirm Booking';
        }
    }
}

// Generate a unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `BK-${timestamp}-${random}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initBookingSystem();
});

// Export functions for external use
window.initBookingSystem = initBookingSystem;

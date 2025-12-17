/**
 * booking.js - Booking Page Management
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated, getToken)
 */

(function () {
    'use strict';

    let bookingSpotData = null;
    let spotId = null;

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize booking system.
     */
    function initBookingSystem() {
        console.log('[Booking] System initialized');

        // Check authentication using api.js helper
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            alert('Please log in to book a parking spot.');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
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
            console.error('[Booking] No spot ID provided');
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

    // =========================================================================
    // API FUNCTIONS
    // =========================================================================

    /**
     * Create a booking via the backend API.
     * @param {string} spotId - The parking spot ID
     * @param {string} startTime - Start time (ISO string or datetime-local format)
     * @param {string} endTime - End time (ISO string or datetime-local format)
     * @returns {Promise<Object>} The created booking data
     * @throws {Error} Error with message from API on failure
     */
    async function createBooking(spotId, startTime, endTime) {
        console.log('[Booking] Creating booking:', { spotId, startTime, endTime });

        // Convert datetime-local format to ISO if needed
        const startISO = new Date(startTime).toISOString();
        const endISO = new Date(endTime).toISOString();

        const response = await apiFetch('/bookings', {
            method: 'POST',
            body: {
                spotId,
                startTime: startISO,
                endTime: endISO
            }
        });

        console.log('[Booking] Booking created successfully:', response);

        return response;
    }

    /**
     * Get user's bookings from the backend API.
     * @returns {Promise<Array>} Array of user's bookings
     */
    async function getUserBookings() {
        console.log('[Booking] Fetching user bookings');

        const response = await apiFetch('/bookings');

        return response.bookings || [];
    }

    /**
     * Load spot details from API.
     * @param {string} id - Spot ID
     * @returns {Promise<Object|null>} Spot data or null
     */
    async function loadSpotFromAPI(id) {
        try {
            const spot = await apiFetch(`/parking/${id}`);
            return spot;
        } catch (error) {
            console.warn('[Booking] Could not load spot from API:', error.message);
            return null;
        }
    }

    // =========================================================================
    // DATA LOADING
    // =========================================================================

    /**
     * Load spot data from sessionStorage or API.
     */
    async function loadSpotData() {
        try {
            // Try to get from sessionStorage first (set by parking.js)
            const storedData = sessionStorage.getItem('bookingSpotData');

            if (storedData) {
                bookingSpotData = JSON.parse(storedData);
                console.log('[Booking] Loaded spot data from sessionStorage:', bookingSpotData);
            } else {
                // Try to fetch from API
                console.log('[Booking] No stored data, fetching from API...');
                const apiSpot = await loadSpotFromAPI(spotId);

                if (apiSpot) {
                    bookingSpotData = {
                        spotId: apiSpot.id,
                        spotName: apiSpot.name || `Parking Spot ${apiSpot.spotNumber || apiSpot.id}`,
                        spotAddress: apiSpot.address || '',
                        price: apiSpot.hourlyRate || apiSpot.price || 5.00,
                        dayRate: apiSpot.dayRate || null,
                        earlyBirdRate: apiSpot.earlyBirdRate || null,
                        garageId: apiSpot.garageId,
                        floorId: apiSpot.floorId
                    };
                } else {
                    // Fallback: construct basic data from spotId
                    bookingSpotData = {
                        spotId: spotId,
                        spotName: `Parking Spot ${spotId}`,
                        spotAddress: 'Address not available',
                        price: 5.00,
                        dayRate: null,
                        earlyBirdRate: null
                    };
                    console.warn('[Booking] Using fallback data');
                }
            }

            // Populate booking details
            populateBookingDetails(bookingSpotData);

        } catch (error) {
            console.error('[Booking] Error loading spot data:', error);
            showError('Failed to load spot details. Please try again.');
        }
    }

    /**
     * Populate booking details section in the UI.
     * @param {Object} data - Spot data
     */
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

    // =========================================================================
    // FORM HANDLING
    // =========================================================================

    /**
     * Setup booking form handlers.
     */
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

    /**
     * Set default booking times (now + 1 hour).
     */
    function setDefaultBookingTimes() {
        const now = new Date();
        const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

        const startInput = document.getElementById('start-time');
        const endInput = document.getElementById('end-time');

        if (startInput) {
            startInput.value = formatDateTimeLocal(now);
            startInput.min = formatDateTimeLocal(now);
        }

        if (endInput) {
            endInput.value = formatDateTimeLocal(oneHourLater);
            endInput.min = formatDateTimeLocal(oneHourLater);
        }

        calculateBookingCost();
    }

    /**
     * Format date for datetime-local input.
     * @param {Date} date - Date to format
     * @returns {string} Formatted date string
     */
    function formatDateTimeLocal(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    /**
     * Calculate booking cost based on selected times.
     */
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
            const minEndTime = new Date(startTime.getTime() + 60 * 60 * 1000);
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

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    /**
     * Show error message.
     * @param {string} message - Error message to display
     */
    function showError(message) {
        const errorElement = document.getElementById('booking-error');

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Hide error message.
     */
    function hideError() {
        const errorElement = document.getElementById('booking-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Show success message.
     * @param {string} message - Success message to display
     */
    function showSuccess(message) {
        const successElement = document.getElementById('booking-success');

        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            successElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    // =========================================================================
    // FORM SUBMISSION
    // =========================================================================

    /**
     * Handle booking form submission.
     * @param {Event} e - Form submit event
     */
    async function handleBookingSubmit(e) {
        e.preventDefault();

        console.log('[Booking] Confirming booking...');

        hideError();

        const startInput = document.getElementById('start-time');
        const endInput = document.getElementById('end-time');
        const confirmButton = document.getElementById('confirm-booking-btn');
        const originalButtonText = confirmButton ? confirmButton.textContent : 'Confirm Booking';

        if (!startInput || !endInput) return;

        const startTime = startInput.value;
        const endTime = endInput.value;

        // Validate times
        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();
        
        // Allow 2 minute tolerance for "start now" selections
        const tolerance = 2 * 60 * 1000; // 2 minutes in ms
        if (start.getTime() < now.getTime() - tolerance) {
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
            // Call the API to create the booking
            const response = await createBooking(
                bookingSpotData.spotId || spotId,
                startTime,
                endTime
            );

            console.log('[Booking] Booking created:', response);

            // Prepare booking data for payment page
            const bookingData = {
                bookingId: response.booking?.id || generateBookingId(),
                spotId: bookingSpotData.spotId || spotId,
                spotName: bookingSpotData.spotName,
                spotAddress: bookingSpotData.spotAddress,
                startTime: startTime,
                endTime: endTime,
                totalCost: document.getElementById('summary-total')?.textContent || '$0.00',
                hourlyRate: bookingSpotData.price,
                garageId: bookingSpotData.garageId,
                floorId: bookingSpotData.floorId,
                timestamp: new Date().toISOString(),
                // Include API response data
                apiBooking: response.booking
            };

            // Store booking data for payment page
            sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

            // Clear pending booking data
            sessionStorage.removeItem('pendingBookingSpotId');
            sessionStorage.removeItem('bookingSpotData');

            // Show success message
            showSuccess(response.message || 'Booking created successfully!');

            console.log('[Booking] Redirecting to payment page...');

            // Redirect to payment page after short delay
            setTimeout(() => {
                window.location.href = 'payment.html';
            }, 500);

        } catch (error) {
            console.error('[Booking] Booking error:', error);
            showError(error.message || 'An error occurred while processing your booking. Please try again.');

            // Re-enable button
            if (confirmButton) {
                confirmButton.disabled = false;
                confirmButton.textContent = originalButtonText;
            }
        }
    }

    /**
     * Generate a unique booking ID (fallback).
     * @returns {string} Unique booking ID
     */
    function generateBookingId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `BK-${timestamp}-${random}`;
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        initBookingSystem();
    });

    // Export functions for external use
    window.createBooking = createBooking;
    window.getUserBookings = getUserBookings;
    window.initBookingSystem = initBookingSystem;

    // Export as namespace
    window.Booking = {
        create: createBooking,
        getAll: getUserBookings,
        init: initBookingSystem
    };

})();

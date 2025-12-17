/**
 * indoor.js - Indoor Parking Layout Management
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 */

(function () {
    'use strict';

    let currentGarageData = null;
    let currentFloor = null;
    let selectedSpot = null;

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize indoor layout system.
     * Checks URL params for garageId and loads data if present.
     */
    function initIndoorSystem() {
        setupBackButton();
        initBookingModal();

        // Check URL params for garageId
        const urlParams = new URLSearchParams(window.location.search);
        const garageId = urlParams.get('garageId') || urlParams.get('garage');

        if (garageId) {
            console.log('[Indoor] Found garageId in URL:', garageId);
            loadGarageFromAPI(garageId);
        }

        console.log('[Indoor] System initialized');
    }

    // =========================================================================
    // API FUNCTIONS
    // =========================================================================

    /**
     * Load garage data from the backend API.
     * @param {string} garageId - The garage ID to load
     * @returns {Promise<Object|null>} Garage data or null on error
     */
    async function loadGarageFromAPI(garageId) {
        console.log('[Indoor] Loading garage from API:', garageId);

        try {
            // Show loading state
            showLoadingState();

            // Call the backend API
            const response = await apiFetch(`/parking/garage/${garageId}`);
            
            // Handle response format - API returns { garage: {...} }
            const garage = response?.garage || response;

            if (!garage) {
                console.error('[Indoor] No data returned for garage:', garageId);
                showErrorState('Garage not found');
                return null;
            }

            console.log('[Indoor] Garage data loaded:', garage);

            // Render the garage
            renderGarage(garage);

            return garage;

        } catch (error) {
            console.error('[Indoor] Failed to load garage:', error.message);
            showErrorState(error.message || 'Failed to load garage data');
            return null;
        }
    }

    /**
     * Show loading state in the indoor layout container.
     */
    function showLoadingState() {
        const grid = document.getElementById('parking-spot-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading parking layout...</p>
                </div>
            `;
        }
    }

    /**
     * Show error state in the indoor layout container.
     * @param {string} message - Error message to display
     */
    function showErrorState(message) {
        const grid = document.getElementById('parking-spot-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h3>Failed to load parking layout</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    // =========================================================================
    // RENDER FUNCTIONS
    // =========================================================================

    /**
     * Render the garage layout with floors and spots.
     * @param {Object} garage - Garage data from API
     */
    function renderGarage(garage) {
        console.log('[Indoor] Rendering garage:', garage.name || garage.id);

        // Normalize garage data
        currentGarageData = normalizeGarageData(garage);

        // Update garage name
        const garageNameElement = document.getElementById('indoor-lot-name');
        if (garageNameElement) {
            garageNameElement.textContent = currentGarageData.name;
        }

        // Update garage address if element exists
        const addressElement = document.getElementById('indoor-lot-address');
        if (addressElement) {
            addressElement.textContent = currentGarageData.address || '';
        }

        // Render floor buttons
        if (currentGarageData.floors && currentGarageData.floors.length > 0) {
            renderFloorButtons(currentGarageData.floors);

            // Render first floor by default
            renderFloor(currentGarageData.floors[0]);
        } else {
            showErrorState('No floors available for this garage');
        }

        // Show indoor layout
        showIndoorLayout();
    }

    /**
     * Normalize garage data from API to expected format.
     * @param {Object} garage - Raw garage data from API
     * @returns {Object} Normalized garage data
     */
    function normalizeGarageData(garage) {
        return {
            id: garage.id,
            name: garage.name || `Garage ${garage.id}`,
            address: garage.address || '',
            floors: (garage.floors || []).map(floor => ({
                id: floor.id,
                name: floor.name || floor.floorNumber || `Floor ${floor.id}`,
                label: floor.label || floor.name || `Floor ${floor.floorNumber || floor.id}`,
                totalSpots: floor.totalSpots || (floor.spots ? floor.spots.length : 0),
                spots: (floor.spots || []).map((spot, index) => normalizeSpotData(spot, index, floor))
            }))
        };
    }

    /**
     * Normalize spot data from API to expected format.
     * @param {Object} spot - Raw spot data from API
     * @param {number} index - Spot index for grid positioning
     * @param {Object} floor - Parent floor data
     * @returns {Object} Normalized spot data
     */
    function normalizeSpotData(spot, index, floor) {
        // Calculate grid position if not provided
        const cols = 8; // Default columns
        const row = spot.row !== undefined ? spot.row : Math.floor(index / cols);
        const col = spot.col !== undefined ? spot.col : index % cols;

        // Normalize status
        let status = 'available';
        if (spot.status) {
            const statusLower = spot.status.toLowerCase();
            if (statusLower === 'occupied' || statusLower === 'unavailable') {
                status = 'occupied';
            } else if (statusLower === 'reserved' || statusLower === 'booked') {
                status = 'reserved';
            } else if (statusLower === 'available' || statusLower === 'free') {
                status = 'available';
            }
        }

        return {
            id: spot.id,
            number: spot.spotNumber || spot.number || index + 1,
            label: spot.label || `#${spot.spotNumber || spot.number || index + 1}`,
            status: status,
            row: row,
            col: col,
            type: spot.type || spot.spotType || 'standard',
            hourlyRate: spot.hourlyRate || spot.price || 5.00,
            floorId: floor.id,
            garageId: floor.garageId
        };
    }

    // =========================================================================
    // NAVIGATION FUNCTIONS
    // =========================================================================

    /**
     * Setup back button to return to outdoor map.
     */
    function setupBackButton() {
        const backBtn = document.getElementById('back-to-outdoor-map');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                hideIndoorLayout();
                showOutdoorMap();
            });
        }
    }

    /**
     * Show outdoor map and hide indoor layout.
     */
    function showOutdoorMap() {
        const outdoorMap = document.getElementById('outdoor-map-container');
        const indoorLayout = document.getElementById('indoor-layout-container');

        if (outdoorMap) outdoorMap.classList.remove('hidden');
        if (indoorLayout) indoorLayout.classList.add('hidden');

        console.log('[Indoor] Switched to outdoor map');
    }

    /**
     * Hide outdoor map and show indoor layout.
     */
    function showIndoorLayout() {
        const outdoorMap = document.getElementById('outdoor-map-container');
        const indoorLayout = document.getElementById('indoor-layout-container');

        if (outdoorMap) outdoorMap.classList.add('hidden');
        if (indoorLayout) indoorLayout.classList.remove('hidden');

        console.log('[Indoor] Switched to indoor layout');
    }

    /**
     * Hide indoor layout.
     */
    function hideIndoorLayout() {
        const indoorLayout = document.getElementById('indoor-layout-container');
        if (indoorLayout) indoorLayout.classList.add('hidden');
    }

    // =========================================================================
    // LEGACY SUPPORT - loadIndoorLayout
    // =========================================================================

    /**
     * Load indoor layout for a specific garage.
     * This function supports both API calls and fallback mock data.
     * @param {string} garageId - The garage ID to load
     */
    async function loadIndoorLayout(garageId) {
        console.log('[Indoor] Loading indoor layout for garage:', garageId);

        try {
            // Try to load from API first
            const garage = await loadGarageFromAPI(garageId);

            if (garage) {
                return; // Successfully loaded from API
            }

            // Fallback to mock data if API fails or returns nothing
            console.log('[Indoor] Falling back to mock data');
            const mockData = getMockGarageData(garageId);

            if (mockData) {
                renderGarage(mockData);
            } else {
                showErrorState('Garage not found');
            }

        } catch (error) {
            console.error('[Indoor] Error loading indoor layout:', error);

            // Fallback to mock data
            const mockData = getMockGarageData(garageId);
            if (mockData) {
                renderGarage(mockData);
            } else {
                showErrorState(error.message || 'Failed to load parking layout');
            }
        }
    }

    /**
     * Get mock garage data for development/fallback.
     * @param {string} garageId - Garage ID
     * @returns {Object|null} Mock garage data or null
     */
    function getMockGarageData(garageId) {
        const mockData = {
            'spot-1': {
                id: 'spot-1',
                name: 'Outdoor surface car park',
                address: '9 Corinthian Drive, Almaty',
                floors: [
                    {
                        id: 'b1',
                        name: 'B1',
                        label: 'Basement 1',
                        totalSpots: 48,
                        spots: generateMockSpots('B1', 6, 8)
                    },
                    {
                        id: 'b2',
                        name: 'B2',
                        label: 'Basement 2',
                        totalSpots: 48,
                        spots: generateMockSpots('B2', 6, 8)
                    }
                ]
            },
            'spot-2': {
                id: 'spot-2',
                name: 'Free Almaty Parks',
                address: '55 Corinthion Drive, Almaty',
                floors: [
                    {
                        id: '1',
                        name: '1',
                        label: 'Floor 1',
                        totalSpots: 40,
                        spots: generateMockSpots('1', 5, 8)
                    }
                ]
            },
            'spot-3': {
                id: 'spot-3',
                name: '22 Corinthian Drive (Outdoor)',
                address: '22 Corinthian Drive, Almaty',
                floors: [
                    {
                        id: 'l1',
                        name: 'L1',
                        label: 'Level 1',
                        totalSpots: 56,
                        spots: generateMockSpots('L1', 7, 8)
                    },
                    {
                        id: 'l2',
                        name: 'L2',
                        label: 'Level 2',
                        totalSpots: 56,
                        spots: generateMockSpots('L2', 7, 8)
                    }
                ]
            },
            'spot-4': {
                id: 'spot-4',
                name: '22 Corinthian Drive (Indoor)',
                address: '22 Corinthian Drive, Almaty',
                floors: [
                    {
                        id: 'b1',
                        name: 'B1',
                        label: 'Basement 1',
                        totalSpots: 64,
                        spots: generateMockSpots('B1', 8, 8)
                    },
                    {
                        id: 'b2',
                        name: 'B2',
                        label: 'Basement 2',
                        totalSpots: 64,
                        spots: generateMockSpots('B2', 8, 8)
                    }
                ]
            }
        };

        return mockData[garageId] || null;
    }

    /**
     * Generate mock parking spots for development.
     * @param {string} floorPrefix - Floor prefix for spot IDs
     * @param {number} rows - Number of rows
     * @param {number} cols - Number of columns
     * @returns {Array} Array of mock spot data
     */
    function generateMockSpots(floorPrefix, rows, cols) {
        const spots = [];
        const statuses = ['available', 'occupied', 'reserved'];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const spotNumber = row * cols + col + 1;
                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                spots.push({
                    id: `${floorPrefix}-${spotNumber}`,
                    number: spotNumber,
                    label: `#${spotNumber}`,
                    status: randomStatus,
                    row: row,
                    col: col,
                    type: 'standard',
                    hourlyRate: 5.00
                });
            }
        }

        return spots;
    }

    // =========================================================================
    // FLOOR RENDERING
    // =========================================================================

    /**
     * Render floor selection buttons.
     * @param {Array} floors - Array of floor data
     */
    function renderFloorButtons(floors) {
        const container = document.getElementById('floor-buttons-container');
        if (!container) return;

        // Clear existing buttons
        container.innerHTML = '';

        // Create button for each floor
        floors.forEach((floor, index) => {
            const button = document.createElement('button');
            button.className = `floor-btn ${index === 0 ? 'active' : ''}`;
            button.setAttribute('data-floor', floor.id);
            button.textContent = floor.name;

            // Add click handler
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                container.querySelectorAll('.floor-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Add active class to clicked button
                button.classList.add('active');

                // Render this floor
                renderFloor(floor);
            });

            container.appendChild(button);
        });
    }

    /**
     * Render parking spots for a specific floor.
     * @param {Object} floorData - Floor data with spots
     */
    function renderFloor(floorData) {
        console.log('[Indoor] Rendering floor:', floorData.name);
        currentFloor = floorData;

        const grid = document.getElementById('parking-spot-grid');
        if (!grid) return;

        // Clear existing spots
        grid.innerHTML = '';

        if (!floorData.spots || floorData.spots.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>No parking spots on this floor</p>
                </div>
            `;
            return;
        }

        // Calculate grid dimensions
        const rows = Math.max(...floorData.spots.map(s => s.row)) + 1;
        const cols = Math.max(...floorData.spots.map(s => s.col)) + 1;

        // Set CSS grid template
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        // Create spot elements
        floorData.spots.forEach(spot => {
            const spotElement = createSpotElement(spot);
            grid.appendChild(spotElement);
        });

        // Update statistics
        updateParkingStats(floorData.spots);
    }

    /**
     * Create a single parking spot element.
     * @param {Object} spotData - Spot data
     * @returns {HTMLElement} Spot button element
     */
    function createSpotElement(spotData) {
        const spot = document.createElement('button');
        spot.className = `parking-spot parking-spot--${spotData.status}`;
        spot.setAttribute('data-spot-id', spotData.id);
        spot.setAttribute('data-status', spotData.status);

        // Add disabled attribute if occupied or reserved
        if (spotData.status !== 'available') {
            spot.setAttribute('disabled', 'true');
        }

        // Create spot structure
        spot.innerHTML = `
            <div class="spot-border">
                <div class="spot-number">${spotData.label}</div>
                <div class="spot-indicator">
                    <div class="spot-circle"></div>
                </div>
            </div>
        `;

        // Add click handler for available spots
        if (spotData.status === 'available') {
            spot.addEventListener('click', () => {
                handleSpotClick(spotData);
            });
        }

        // Set grid position
        spot.style.gridColumn = spotData.col + 1;
        spot.style.gridRow = spotData.row + 1;

        return spot;
    }

    /**
     * Handle parking spot click.
     * @param {Object} spotData - Clicked spot data
     */
    function handleSpotClick(spotData) {
        console.log('[Indoor] Spot clicked:', spotData);

        // Check authentication
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            const shouldLogin = confirm(
                'You need to log in to book a parking spot.\n\nWould you like to log in now?'
            );

            if (shouldLogin) {
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                sessionStorage.setItem('pendingBookingSpotId', spotData.id);
                window.location.href = 'login.html';
            }
            return;
        }

        // Highlight selected spot
        document.querySelectorAll('.parking-spot').forEach(spot => {
            spot.classList.remove('parking-spot--selected');
        });

        const spotElement = document.querySelector(`[data-spot-id="${spotData.id}"]`);
        if (spotElement) {
            spotElement.classList.add('parking-spot--selected');
        }

        selectedSpot = spotData;

        // Open booking modal
        openBookingModal(spotData);
    }

    /**
     * Update parking statistics display.
     * @param {Array} spots - Array of spot data
     */
    function updateParkingStats(spots) {
        const filledCount = spots.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
        const emptyCount = spots.filter(s => s.status === 'available').length;

        const filledElement = document.getElementById('filled-count');
        const emptyElement = document.getElementById('empty-count');

        if (filledElement) filledElement.textContent = filledCount;
        if (emptyElement) emptyElement.textContent = emptyCount;
    }

    // =========================================================================
    // BOOKING MODAL
    // =========================================================================

    /**
     * Open booking modal for a spot.
     * @param {Object} spotData - Spot to book
     */
    function openBookingModal(spotData) {
        const modal = document.getElementById('booking-modal');
        const spotNameElement = document.getElementById('modal-spot-name');
        const rateElement = document.getElementById('summary-rate');

        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        if (spotNameElement) {
            spotNameElement.textContent = spotData.label || spotData.id;
        }

        if (rateElement && spotData.hourlyRate) {
            rateElement.textContent = `$${spotData.hourlyRate.toFixed(2)}/hr`;
        }

        setDefaultBookingTimes();
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
        const ratePerHour = selectedSpot ? (selectedSpot.hourlyRate || 5.00) : 5.00;

        if (!startInput || !endInput) return;

        const startTime = new Date(startInput.value);
        const endTime = new Date(endInput.value);

        if (startTime && endTime && endTime > startTime) {
            const durationMs = endTime - startTime;
            const durationHours = durationMs / (1000 * 60 * 60);
            const totalCost = durationHours * ratePerHour;

            if (durationElement) {
                durationElement.textContent = `${durationHours.toFixed(1)} hours`;
            }

            if (totalElement) {
                totalElement.textContent = `$${totalCost.toFixed(2)}`;
            }
        }
    }

    /**
     * Close booking modal.
     */
    function closeBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }

        selectedSpot = null;

        document.querySelectorAll('.parking-spot').forEach(spot => {
            spot.classList.remove('parking-spot--selected');
        });
    }

    /**
     * Initialize booking modal handlers.
     */
    function initBookingModal() {
        const modal = document.getElementById('booking-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        const cancelBtn = document.getElementById('modal-cancel-btn');
        const form = document.getElementById('booking-form');
        const startInput = document.getElementById('start-time');
        const endInput = document.getElementById('end-time');

        if (closeBtn) {
            closeBtn.addEventListener('click', closeBookingModal);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', closeBookingModal);
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeBookingModal();
                }
            });
        }

        if (startInput) {
            startInput.addEventListener('change', calculateBookingCost);
        }

        if (endInput) {
            endInput.addEventListener('change', calculateBookingCost);
        }

        if (form) {
            form.addEventListener('submit', handleBookingSubmit);
        }
    }

    /**
     * Handle booking form submission.
     * @param {Event} e - Form submit event
     */
    async function handleBookingSubmit(e) {
        e.preventDefault();

        const startTime = document.getElementById('start-time').value;
        const endTime = document.getElementById('end-time').value;
        const totalCost = document.getElementById('summary-total').textContent;

        console.log('[Indoor] Booking submitted:', {
            spot: selectedSpot,
            startTime,
            endTime,
            totalCost
        });

        // Disable submit button during processing
        const submitBtn = e.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating booking...';
        }

        try {
            // Create booking via API
            const response = await apiFetch('/bookings', {
                method: 'POST',
                body: {
                    spotId: selectedSpot?.id,
                    garageId: currentGarageData?.id,
                    floorId: currentFloor?.id,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date(endTime).toISOString()
                }
            });

            console.log('[Indoor] Booking created:', response);

            // Prepare booking data for payment page
            const bookingData = {
                spotId: selectedSpot ? selectedSpot.id : '',
                spotName: selectedSpot ? selectedSpot.label : '',
                lotName: currentGarageData ? currentGarageData.name : '',
                lotAddress: currentGarageData ? currentGarageData.address : '',
                floorName: currentFloor ? currentFloor.name : '',
                garageId: currentGarageData ? currentGarageData.id : '',
                floorId: currentFloor ? currentFloor.id : '',
                startTime: startTime,
                endTime: endTime,
                totalCost: totalCost,
                hourlyRate: selectedSpot ? selectedSpot.hourlyRate : 5.00,
                bookingId: response.booking?.id,
                apiBooking: response.booking,
                timestamp: new Date().toISOString()
            };

            // Store booking data in sessionStorage for payment page
            sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

            console.log('[Indoor] Booking data saved:', bookingData);

            // Redirect to payment page
            window.location.href = 'payment.html';

        } catch (error) {
            console.error('[Indoor] Booking error:', error);
            alert(error.message || 'Failed to create booking. Please try again.');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Book Now';
            }
        }
    }

    /**
     * Generate a unique booking ID.
     * @returns {string} Unique booking ID
     */
    function generateBookingId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `BK-${timestamp}-${random}`;
    }

    // =========================================================================
    // REAL-TIME UPDATES
    // =========================================================================

    // Listen for spot updates via WebSocket
    window.addEventListener('spot:update', (event) => {
        const { spotId, status } = event.detail;
        console.log('[Indoor] Real-time spot update:', spotId, status);

        // Update spot in current floor data
        if (currentFloor && currentFloor.spots) {
            const spot = currentFloor.spots.find(s => s.id === spotId);
            if (spot) {
                spot.status = status.toLowerCase();

                // Update the DOM element
                const spotElement = document.querySelector(`[data-spot-id="${spotId}"]`);
                if (spotElement) {
                    spotElement.className = `parking-spot parking-spot--${spot.status}`;
                    spotElement.setAttribute('data-status', spot.status);

                    if (spot.status !== 'available') {
                        spotElement.setAttribute('disabled', 'true');
                    } else {
                        spotElement.removeAttribute('disabled');
                    }
                }

                // Update stats
                updateParkingStats(currentFloor.spots);
            }
        }
    });

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => {
        initIndoorSystem();
    });

    // Export functions for external use
    window.loadIndoorLayout = loadIndoorLayout;
    window.loadGarageFromAPI = loadGarageFromAPI;
    window.renderGarage = renderGarage;
    window.showIndoorLayout = showIndoorLayout;
    window.hideIndoorLayout = hideIndoorLayout;
    window.showOutdoorMap = showOutdoorMap;
    window.closeBookingModal = closeBookingModal;

    // Export as namespace
    window.Indoor = {
        loadLayout: loadIndoorLayout,
        loadFromAPI: loadGarageFromAPI,
        render: renderGarage,
        show: showIndoorLayout,
        hide: hideIndoorLayout,
        showOutdoor: showOutdoorMap
    };

})();

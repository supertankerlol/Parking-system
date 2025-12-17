/**
 * user-dashboard.js - User Dashboard Management
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 * - socket-client.js (for real-time updates)
 */

(function () {
    'use strict';

    let bookings = [];
    let payments = [];

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    /**
     * Initialize the dashboard.
     */
    function initDashboard() {
        console.log('[Dashboard] Initializing...');

        // Check authentication
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            console.log('[Dashboard] Not authenticated, redirecting to login');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        // Load data
        loadDashboardData();

        // Setup WebSocket listeners
        setupSocketListeners();

        // Setup search
        setupSearch();

        console.log('[Dashboard] Initialized');
    }

    /**
     * Load all dashboard data.
     */
    async function loadDashboardData() {
        try {
            await Promise.all([
                loadBookings(),
                loadPaymentHistory()
            ]);
        } catch (error) {
            console.error('[Dashboard] Error loading data:', error);
        }
    }

    // =========================================================================
    // BOOKINGS
    // =========================================================================

    /**
     * Load user bookings from API.
     */
    async function loadBookings() {
        console.log('[Dashboard] Loading bookings...');

        try {
            const response = await apiFetch('/bookings');
            bookings = response.bookings || response || [];
            console.log('[Dashboard] Loaded', bookings.length, 'bookings');
            renderBookings();
        } catch (error) {
            console.error('[Dashboard] Error loading bookings:', error);
            bookings = [];
            renderBookings();
        }
    }

    /**
     * Render bookings to the UI.
     */
    function renderBookings() {
        console.log('[Dashboard] Rendering bookings:', bookings);
        
        const reservationList = document.getElementById('reservation-list');
        const noReservations = document.getElementById('no-reservations');
        const statusNotParked = document.getElementById('status-not-parked');
        const statusParked = document.getElementById('status-parked');

        console.log('[Dashboard] DOM elements found:', {
            reservationList: !!reservationList,
            noReservations: !!noReservations,
            statusNotParked: !!statusNotParked,
            statusParked: !!statusParked
        });

        // Filter active bookings (confirmed or pending)
        const activeBookings = bookings.filter(b => 
            b.status === 'confirmed' || b.status === 'pending' || b.status === 'active'
        );
        
        console.log('[Dashboard] Active bookings:', activeBookings.length);

        // Check for currently active parking
        const currentParking = bookings.find(b => b.status === 'active');

        // Update current status
        if (currentParking && statusNotParked && statusParked) {
            statusNotParked.classList.add('hidden');
            statusParked.classList.remove('hidden');
            const spotName = statusParked.querySelector('.status-spot-name');
            if (spotName) {
                spotName.textContent = currentParking.spot?.name || currentParking.spotId || 'Unknown';
            }
        } else if (statusNotParked && statusParked) {
            statusNotParked.classList.remove('hidden');
            statusParked.classList.add('hidden');
        }

        // Render reservation list
        if (reservationList) {
            if (activeBookings.length === 0) {
                reservationList.innerHTML = '';
                if (noReservations) noReservations.classList.remove('hidden');
            } else {
                if (noReservations) noReservations.classList.add('hidden');
                reservationList.innerHTML = activeBookings.map(booking => {
                    const startTime = formatDateTime(booking.startTime);
                    const endTime = formatDateTime(booking.endTime);
                    const statusClass = getStatusClass(booking.status);
                    const spotName = booking.spot?.name || booking.spotId || 'Unknown';
                    const garageName = booking.spot?.garage?.name || '';

                    return `
                        <li class="reservation-item">
                            <div class="reservation-info">
                                <span class="reservation-spot" title="${spotName}${garageName ? ` - ${garageName}` : ''}">${spotName}${garageName ? ` - ${garageName}` : ''}</span>
                                <span class="reservation-time" title="${startTime} - ${endTime}">${startTime} - ${endTime}</span>
                            </div>
                            <div class="reservation-status ${statusClass}">${booking.status}</div>
                        </li>
                    `;
                }).join('');
            }
        }

        // Render history table
        renderHistory();
    }

    /**
     * Render parking history table.
     */
    function renderHistory() {
        const historyBody = document.getElementById('history-table-body');
        if (!historyBody) return;

        // Show all bookings in history (most recent first, already sorted by API)
        const historyBookings = bookings;

        if (historyBookings.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4">No parking history found.</td></tr>';
            return;
        }

        historyBody.innerHTML = historyBookings.slice(0, 10).map(booking => {
            const date = formatDate(booking.startTime || booking.createdAt);
            const spotName = booking.spot?.name || booking.spotId || 'Unknown';
            const duration = calculateDuration(booking.startTime, booking.endTime);
            const cost = typeof booking.totalCost === 'number' ? `$${booking.totalCost.toFixed(2)}` : 
                        (booking.payment?.amount ? `$${booking.payment.amount.toFixed(2)}` : 'N/A');

            return `
                <tr>
                    <td>${date}</td>
                    <td>${spotName}</td>
                    <td>${duration}</td>
                    <td>${cost}</td>
                </tr>
            `;
        }).join('');
    }

    // =========================================================================
    // PAYMENTS
    // =========================================================================

    /**
     * Load payment history from API.
     */
    async function loadPaymentHistory() {
        console.log('[Dashboard] Loading payment history...');

        try {
            const response = await apiFetch('/users/payments');
            payments = response.payments || response || [];
            console.log('[Dashboard] Loaded', payments.length, 'payments');
        } catch (error) {
            console.warn('[Dashboard] Could not load payments:', error.message);
            payments = [];
        }
    }

    // =========================================================================
    // WEBSOCKET HANDLERS
    // =========================================================================

    /**
     * Setup WebSocket event listeners for real-time updates.
     */
    function setupSocketListeners() {
        if (typeof initSocket !== 'function') {
            console.warn('[Dashboard] Socket client not available');
            return;
        }

        // Initialize socket with handlers
        initSocket(
            () => console.log('[Dashboard] Socket connected'),
            {
                'booking:update': handleBookingUpdate,
                'booking:created': handleBookingUpdate,
                'booking:confirmed': handleBookingUpdate,
                'payment:completed': handlePaymentUpdate
            }
        );

        // Also listen via window events (fallback)
        window.addEventListener('booking:update', (e) => handleBookingUpdate(e.detail));
        window.addEventListener('payment:completed', (e) => handlePaymentUpdate(e.detail));
    }

    /**
     * Handle booking update event.
     * @param {Object} data - Updated booking data
     */
    function handleBookingUpdate(data) {
        console.log('[Dashboard] Booking update received:', data);

        if (!data) return;

        // Find and update the booking in our local array
        const index = bookings.findIndex(b => b.id === data.id || b.id === data.bookingId);
        if (index >= 0) {
            bookings[index] = { ...bookings[index], ...data };
        } else if (data.id) {
            bookings.unshift(data);
        }

        // Re-render the UI
        renderBookings();
    }

    /**
     * Handle payment update event.
     * @param {Object} data - Payment data
     */
    function handlePaymentUpdate(data) {
        console.log('[Dashboard] Payment update received:', data);

        // Refresh bookings to get updated status
        loadBookings();
    }

    // =========================================================================
    // UTILITY FUNCTIONS
    // =========================================================================

    /**
     * Format datetime for display.
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date/time
     */
    function formatDateTime(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Format date only.
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    }

    /**
     * Calculate duration between two times.
     * @param {string} start - Start time
     * @param {string} end - End time
     * @returns {string} Duration string
     */
    function calculateDuration(start, end) {
        if (!start || !end) return 'N/A';
        try {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const diffMs = endDate - startDate;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffHours > 0) {
                return `${diffHours}h ${diffMinutes}m`;
            }
            return `${diffMinutes}m`;
        } catch {
            return 'N/A';
        }
    }

    /**
     * Get CSS class for booking status.
     * @param {string} status - Booking status
     * @returns {string} CSS class
     */
    function getStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'active': 'status-active',
            'completed': 'status-completed',
            'cancelled': 'status-cancelled'
        };
        return statusClasses[status] || 'status-default';
    }

    // =========================================================================
    // SEARCH
    // =========================================================================

    /**
     * Setup search functionality.
     */
    function setupSearch() {
        const searchForm = document.getElementById('header-search-form');
        const searchInput = document.getElementById('header-search');

        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                filterBookings(searchInput?.value || '');
                return false;
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterBookings(e.target.value);
            });
            
            // Prevent Enter from submitting/reloading
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    filterBookings(e.target.value);
                }
            });
        }
    }

    /**
     * Filter bookings by search term.
     * @param {string} term - Search term
     */
    function filterBookings(term) {
        const query = term.toLowerCase().trim();
        const historyBody = document.getElementById('history-table-body');
        
        if (!historyBody || bookings.length === 0) return;

        if (!query) {
            // Show all bookings
            renderHistory();
            return;
        }

        // Filter bookings matching spot name, garage name, date, or status
        const filtered = bookings.filter(b => {
            const spotName = (b.spot?.name || b.spotId || '').toLowerCase();
            const garageName = (b.spot?.garage?.name || '').toLowerCase();
            const status = (b.status || '').toLowerCase();
            const date = formatDate(b.startTime || b.createdAt).toLowerCase();
            
            return spotName.includes(query) || 
                   garageName.includes(query) || 
                   status.includes(query) ||
                   date.includes(query);
        });

        if (filtered.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="4">No matching records found.</td></tr>';
            return;
        }

        historyBody.innerHTML = filtered.slice(0, 10).map(booking => {
            const date = formatDate(booking.startTime || booking.createdAt);
            const spotName = booking.spot?.name || booking.spotId || 'Unknown';
            const duration = calculateDuration(booking.startTime, booking.endTime);
            const cost = typeof booking.totalCost === 'number' ? `$${booking.totalCost.toFixed(2)}` : 
                        (booking.payment?.amount ? `$${booking.payment.amount.toFixed(2)}` : 'N/A');

            return `
                <tr>
                    <td>${date}</td>
                    <td>${spotName}</td>
                    <td>${duration}</td>
                    <td>${cost}</td>
                </tr>
            `;
        }).join('');
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initDashboard);

    // Export for external use
    window.Dashboard = {
        init: initDashboard,
        refresh: loadDashboardData,
        loadBookings: loadBookings
    };

})();

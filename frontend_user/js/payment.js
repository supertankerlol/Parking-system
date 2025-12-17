/**
 * payment.js - Payment Page Management
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 */

(function () {
    'use strict';

    let bookingData = null;

    // =========================================================================
    // API FUNCTIONS
    // =========================================================================

    /**
     * Load user's payment history from the backend API.
     * GET /api/users/payments
     * @returns {Promise<Array>} Array of payment records
     */
    async function loadPayments() {
        console.log('[Payment] Loading payment history...');

        const response = await apiFetch('/users/payments');
        const payments = response.payments || [];

        console.log('[Payment] Loaded', payments.length, 'payments');

        // Render payments if a render function exists
        if (typeof renderPayments === 'function') {
            renderPayments(payments);
        }

        return payments;
    }

    /**
     * Process a payment via the backend API.
     * POST /api/payments
     * @param {Object} paymentData - Payment data
     * @param {string} paymentData.bookingId - Booking ID
     * @param {number} paymentData.amount - Payment amount
     * @param {string} paymentData.paymentMethod - Payment method (card, etc.)
     * @param {Object} [paymentData.cardDetails] - Card details (last 4 digits only)
     * @returns {Promise<Object>} Payment result
     */
    async function processPaymentAPI(paymentData) {
        console.log('[Payment] Processing payment via API...');

        const response = await apiFetch('/payments', {
            method: 'POST',
            body: paymentData
        });

        console.log('[Payment] Payment processed:', response);
        return response;
    }

    // confirmBookingPayment removed - use processPaymentAPI with /api/payments instead

    /**
     * Render payments list/table.
     * @param {Array} payments - Array of payment records
     */
    function renderPayments(payments) {
        const container = document.getElementById('payments-list') || 
                          document.getElementById('payment-history');

        if (!container) {
            console.log('[Payment] No payment list container found');
            return;
        }

        if (!payments || payments.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No payment history found.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = payments.map(payment => {
            const date = new Date(payment.createdAt || payment.date).toLocaleDateString();
            const amount = payment.amount ? `$${payment.amount.toFixed(2)}` : 'N/A';
            const status = payment.status || 'completed';

            return `
                <div class="payment-item">
                    <div class="payment-date">${date}</div>
                    <div class="payment-amount">${amount}</div>
                    <div class="payment-status status-${status}">${status}</div>
                </div>
            `;
        }).join('');
    }

    // =========================================================================
    // BOOKING DATA
    // =========================================================================

    /**
     * Initialize payment system.
     */
    function initPaymentSystem() {
        console.log('[Payment] System initialized');

        // Check authentication
        if (typeof isAuthenticated === 'function' && !isAuthenticated()) {
            console.log('[Payment] Not authenticated, redirecting to login');
            sessionStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'login.html';
            return;
        }

        // Load booking data from sessionStorage
        loadBookingData();

        // Setup form handlers
        setupPaymentForm();

        // Setup card input formatting
        setupCardFormatting();

        // Optionally load payment history
        loadPayments().catch(err => {
            console.warn('[Payment] Could not load payment history:', err.message);
        });
    }

    /**
     * Load booking data from storage.
     */
    function loadBookingData() {
        try {
            const storedData = sessionStorage.getItem('bookingData');

            if (storedData) {
                bookingData = JSON.parse(storedData);
                console.log('[Payment] Loaded booking data:', bookingData);
                populatePaymentSummary(bookingData);
            } else {
                console.warn('[Payment] No booking data found in sessionStorage');
                useDefaultSummaryData();
            }
        } catch (error) {
            console.error('[Payment] Error loading booking data:', error);
            useDefaultSummaryData();
        }
    }

    /**
     * Populate payment summary with booking data.
     * @param {Object} data - Booking data
     */
    function populatePaymentSummary(data) {
        const lotNameElement = document.getElementById('summary-lot-name');
        if (lotNameElement && (data.lotName || data.spotName)) {
            lotNameElement.textContent = data.lotName || data.spotName;
        }

        const spotNameElement = document.getElementById('summary-spot-name');
        if (spotNameElement && data.spotId) {
            spotNameElement.textContent = data.spotId;
        }

        const startTimeElement = document.getElementById('summary-start-time');
        if (startTimeElement && data.startTime) {
            startTimeElement.textContent = formatDisplayDateTime(data.startTime);
        }

        const endTimeElement = document.getElementById('summary-end-time');
        if (endTimeElement && data.endTime) {
            endTimeElement.textContent = formatDisplayDateTime(data.endTime);
        }

        const totalElement = document.getElementById('summary-total');
        const payButton = document.getElementById('pay-now-btn');

        if (totalElement && data.totalCost) {
            totalElement.textContent = data.totalCost;

            if (payButton) {
                payButton.textContent = `Pay Now (${data.totalCost})`;
            }
        }
    }

    /**
     * Use default summary data if no booking data available.
     */
    function useDefaultSummaryData() {
        console.log('[Payment] Using default summary data');
    }

    /**
     * Format datetime for display.
     * @param {string} datetimeString - Datetime string
     * @returns {string} Formatted datetime
     */
    function formatDisplayDateTime(datetimeString) {
        try {
            const date = new Date(datetimeString);
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            };
            return date.toLocaleString('en-US', options);
        } catch (error) {
            console.error('[Payment] Error formatting date:', error);
            return datetimeString;
        }
    }

    // =========================================================================
    // FORM HANDLING
    // =========================================================================

    /**
     * Setup payment form handlers.
     */
    function setupPaymentForm() {
        const form = document.getElementById('payment-form');
        if (form) {
            form.addEventListener('submit', handlePaymentSubmit);
        }
    }

    /**
     * Setup card input formatting.
     */
    function setupCardFormatting() {
        const cardNumberInput = document.getElementById('card-number');
        const cardExpiryInput = document.getElementById('card-expiry');
        const cardCvcInput = document.getElementById('card-cvc');

        // Format card number (add spaces every 4 digits)
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                value = value.substring(0, 16);
                const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        // Format expiry date (MM / YY)
        if (cardExpiryInput) {
            cardExpiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                value = value.substring(0, 4);
                if (value.length >= 2) {
                    value = value.substring(0, 2) + ' / ' + value.substring(2);
                }
                e.target.value = value;
            });
        }

        // Format CVC (3-4 digits only)
        if (cardCvcInput) {
            cardCvcInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.substring(0, 4);
                e.target.value = value;
            });
        }
    }

    /**
     * Validate payment form.
     * @returns {boolean} True if valid
     */
    function validatePaymentForm() {
        const cardName = document.getElementById('card-name')?.value.trim();
        const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry')?.value.replace(/\s/g, '').replace(/\//g, '');
        const cardCvc = document.getElementById('card-cvc')?.value.trim();

        hideError();

        // Validate cardholder name
        if (!cardName || cardName.length < 3) {
            showError('Please enter a valid cardholder name');
            return false;
        }

        // Validate card number (16 digits)
        if (!cardNumber || cardNumber.length !== 16 || !/^\d{16}$/.test(cardNumber)) {
            showError('Please enter a valid 16-digit card number');
            return false;
        }

        // Validate Luhn algorithm
        if (!validateLuhn(cardNumber)) {
            showError('Invalid card number');
            return false;
        }

        // Validate expiry date (MMYY format)
        if (!cardExpiry || cardExpiry.length !== 4 || !/^\d{4}$/.test(cardExpiry)) {
            showError('Please enter a valid expiry date (MM / YY)');
            return false;
        }

        const month = parseInt(cardExpiry.substring(0, 2), 10);
        const year = parseInt('20' + cardExpiry.substring(2, 4), 10);

        if (month < 1 || month > 12) {
            showError('Invalid expiry month');
            return false;
        }

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            showError('Card has expired');
            return false;
        }

        // Validate CVC (3-4 digits)
        if (!cardCvc || cardCvc.length < 3 || cardCvc.length > 4 || !/^\d{3,4}$/.test(cardCvc)) {
            showError('Please enter a valid CVC (3-4 digits)');
            return false;
        }

        return true;
    }

    /**
     * Luhn algorithm for card number validation.
     * @param {string} cardNumber - Card number
     * @returns {boolean} True if valid
     */
    function validateLuhn(cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber.charAt(i), 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return (sum % 10) === 0;
    }

    // =========================================================================
    // UI HELPERS
    // =========================================================================

    /**
     * Show error message.
     * @param {string} message - Error message
     */
    function showError(message) {
        const errorElement = document.getElementById('payment-error');
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
        const errorElement = document.getElementById('payment-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Show success message.
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        const successElement = document.getElementById('payment-success');
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        } else {
            alert(message);
        }
    }

    // =========================================================================
    // PAYMENT SUBMISSION
    // =========================================================================

    /**
     * Handle payment form submission.
     * @param {Event} e - Form submit event
     */
    async function handlePaymentSubmit(e) {
        e.preventDefault();

        console.log('[Payment] Processing payment...');

        if (!validatePaymentForm()) {
            return;
        }

        const cardName = document.getElementById('card-name')?.value.trim();
        const cardNumber = document.getElementById('card-number')?.value.replace(/\s/g, '');
        const cardExpiry = document.getElementById('card-expiry')?.value.trim();

        const payButton = document.getElementById('pay-now-btn');
        const originalButtonText = payButton?.textContent || 'Pay Now';

        if (payButton) {
            payButton.disabled = true;
            payButton.textContent = 'Processing...';
        }

        try {
            // Get the real booking ID from the API response
            const realBookingId = bookingData?.apiBooking?.id || bookingData?.bookingId;
            
            if (!realBookingId || realBookingId.startsWith('BK-')) {
                // BK- prefix indicates a fake generated ID, not a real DB ID
                showError('No valid booking found. Please create a booking first.');
                resetPayButton(payButton, originalButtonText);
                return;
            }

            // Calculate payment amount - prefer backend's totalCost (number) over frontend's string
            let amount = 0;
            // Priority: apiBooking.totalCost (from backend) > totalCost string > baseCost
            const backendCost = bookingData?.apiBooking?.totalCost ?? bookingData?.apiBooking?.baseCost;
            const frontendCost = bookingData?.totalCost;
            
            if (typeof backendCost === 'number' && backendCost > 0) {
                amount = backendCost;
            } else if (typeof frontendCost === 'number') {
                amount = frontendCost;
            } else if (typeof frontendCost === 'string') {
                amount = parseFloat(frontendCost.replace(/[^0-9.]/g, '')) || 0;
            }
            
            console.log('[Payment] Calculated amount:', amount, 'backend:', backendCost, 'frontend:', frontendCost);

            // Prepare payment data
            const paymentData = {
                bookingId: realBookingId,
                amount: amount,
                paymentMethod: 'card',
                cardDetails: {
                    cardholderName: cardName,
                    lastFour: cardNumber.substring(cardNumber.length - 4),
                    expiry: cardExpiry
                }
            };

            // Process via API
            try {
                await processPaymentAPI(paymentData);
                console.log('[Payment] Payment successful!');
                sessionStorage.removeItem('bookingData');
                showPaymentSuccess();
            } catch (apiError) {
                console.error('[Payment] API payment failed:', apiError.message);
                showError(apiError.message || 'Payment failed. Please try again.');
                resetPayButton(payButton, originalButtonText);
            }

        } catch (error) {
            console.error('[Payment] Payment error:', error);
            showError(error.message || 'An error occurred while processing your payment.');
            resetPayButton(payButton, originalButtonText);
        }
    }

    /**
     * Reset pay button to original state.
     * @param {HTMLElement} button - Pay button element
     * @param {string} originalText - Original button text
     */
    function resetPayButton(button, originalText) {
        if (button) {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    /**
     * Process payment (simulated fallback).
     * @param {Object} paymentData - Payment data
     * @returns {Promise<boolean>} Success status
     */
    async function processPaymentSimulated(paymentData) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('[Payment] Simulated payment data:', paymentData);
        // 90% success rate for demo
        return Math.random() > 0.1;
    }

    /**
     * Show payment success and redirect.
     */
    function showPaymentSuccess() {
        showSuccess('Payment successful! Your parking spot has been reserved.');

        // Redirect to dashboard after delay
        setTimeout(() => {
            window.location.href = 'user-dashboard.html';
        }, 1500);
    }

    // =========================================================================
    // EXPORTS
    // =========================================================================

    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', initPaymentSystem);

    // Export functions for external use
    window.loadPayments = loadPayments;
    window.processPaymentAPI = processPaymentAPI;
    window.renderPayments = renderPayments;
    window.initPaymentSystem = initPaymentSystem;
    window.loadBookingData = loadBookingData;

    // Export as namespace
    window.Payment = {
        loadHistory: loadPayments,
        process: processPaymentAPI,
        render: renderPayments,
        init: initPaymentSystem
    };

})();

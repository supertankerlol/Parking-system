// js/payment.js - Payment Page Management

let bookingData = null;

// Initialize payment system
function initPaymentSystem() {
    console.log('Payment system initialized');

    // Load booking data from sessionStorage or localStorage
    loadBookingData();

    // Setup form handlers
    setupPaymentForm();

    // Setup card input formatting
    setupCardFormatting();
}

// Load booking data from storage
function loadBookingData() {
    try {
        // Try to get booking data from sessionStorage
        const storedData = sessionStorage.getItem('bookingData');

        if (storedData) {
            bookingData = JSON.parse(storedData);
            console.log('Loaded booking data:', bookingData);

            // Populate payment summary
            populatePaymentSummary(bookingData);
        } else {
            console.warn('No booking data found in sessionStorage');
            // Use default/placeholder data
            useDefaultSummaryData();
        }
    } catch (error) {
        console.error('Error loading booking data:', error);
        useDefaultSummaryData();
    }
}

// Populate payment summary with booking data
function populatePaymentSummary(data) {
    // Update parking lot name
    const lotNameElement = document.getElementById('summary-lot-name');
    if (lotNameElement && data.lotName) {
        lotNameElement.textContent = data.lotName;
    }

    // Update spot name
    const spotNameElement = document.getElementById('summary-spot-name');
    if (spotNameElement && data.spotId) {
        spotNameElement.textContent = data.spotId;
    }

    // Update start time
    const startTimeElement = document.getElementById('summary-start-time');
    if (startTimeElement && data.startTime) {
        startTimeElement.textContent = formatDisplayDateTime(data.startTime);
    }

    // Update end time
    const endTimeElement = document.getElementById('summary-end-time');
    if (endTimeElement && data.endTime) {
        endTimeElement.textContent = formatDisplayDateTime(data.endTime);
    }

    // Update total cost
    const totalElement = document.getElementById('summary-total');
    const payButton = document.getElementById('pay-now-btn');

    if (totalElement && data.totalCost) {
        totalElement.textContent = data.totalCost;

        // Also update button text
        if (payButton) {
            payButton.textContent = `Pay Now (${data.totalCost})`;
        }
    }
}

// Use default summary data if no booking data available
function useDefaultSummaryData() {
    console.log('Using default summary data');
    // The HTML already has default values, so we don't need to do anything
}

// Format datetime for display
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
        console.error('Error formatting date:', error);
        return datetimeString;
    }
}

// Setup payment form handlers
function setupPaymentForm() {
    const form = document.getElementById('payment-form');

    if (form) {
        form.addEventListener('submit', handlePaymentSubmit);
    }
}

// Setup card input formatting
function setupCardFormatting() {
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvcInput = document.getElementById('card-cvc');

    // Format card number (add spaces every 4 digits)
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, ''); // Remove spaces
            value = value.replace(/\D/g, ''); // Remove non-digits

            // Limit to 16 digits
            value = value.substring(0, 16);

            // Add space every 4 digits
            const formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;

            e.target.value = formattedValue;
        });
    }

    // Format expiry date (MM / YY)
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, ''); // Remove spaces
            value = value.replace(/\D/g, ''); // Remove non-digits

            // Limit to 4 digits (MMYY)
            value = value.substring(0, 4);

            // Add slash after 2 digits
            if (value.length >= 2) {
                value = value.substring(0, 2) + ' / ' + value.substring(2);
            }

            e.target.value = value;
        });
    }

    // Format CVC (3-4 digits only)
    if (cardCvcInput) {
        cardCvcInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

            // Limit to 4 digits
            value = value.substring(0, 4);

            e.target.value = value;
        });
    }
}

// Validate payment form
function validatePaymentForm() {
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value.replace(/\s/g, '').replace(/\//g, '');
    const cardCvc = document.getElementById('card-cvc').value.trim();
    const errorElement = document.getElementById('payment-error');

    // Clear previous errors
    if (errorElement) {
        errorElement.textContent = '';
    }

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

    // Validate Luhn algorithm (basic card number validation)
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

    // Check if card is expired
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

// Luhn algorithm for card number validation
function validateLuhn(cardNumber) {
    let sum = 0;
    let isEven = false;

    // Loop through values starting from the rightmost digit
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

// Show error message
function showError(message) {
    const errorElement = document.getElementById('payment-error');

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';

        // Scroll to error
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Handle payment form submission
async function handlePaymentSubmit(e) {
    e.preventDefault();

    console.log('Processing payment...');

    // Validate form
    if (!validatePaymentForm()) {
        return;
    }

    // Get form data
    const cardName = document.getElementById('card-name').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value.trim();
    const cardCvc = document.getElementById('card-cvc').value.trim();

    // Get payment button
    const payButton = document.getElementById('pay-now-btn');

    // Disable button and show loading state
    if (payButton) {
        payButton.disabled = true;
        payButton.textContent = 'Processing...';
    }

    try {
        // Prepare payment data
        const paymentData = {
            booking: bookingData,
            payment: {
                cardName: cardName,
                cardNumber: cardNumber.substring(cardNumber.length - 4), // Only send last 4 digits
                cardExpiry: cardExpiry,
                timestamp: new Date().toISOString()
            }
        };

        // Send payment to backend
        const success = await processPayment(paymentData);

        if (success) {
            // Payment successful
            console.log('Payment successful!');

            // Clear booking data from storage
            sessionStorage.removeItem('bookingData');

            // Redirect to confirmation page or show success message
            showPaymentSuccess();
        } else {
            // Payment failed
            showError('Payment failed. Please try again.');

            // Re-enable button
            if (payButton) {
                payButton.disabled = false;
                const total = document.getElementById('summary-total').textContent;
                payButton.textContent = `Pay Now (${total})`;
            }
        }

    } catch (error) {
        console.error('Payment error:', error);
        showError('An error occurred while processing your payment. Please try again.');

        // Re-enable button
        if (payButton) {
            payButton.disabled = false;
            const total = document.getElementById('summary-total').textContent;
            payButton.textContent = `Pay Now (${total})`;
        }
    }
}

// Process payment (simulated backend call)
async function processPayment(paymentData) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Payment data sent to backend:', paymentData);

    // TODO: Replace with actual API call
    // const response = await fetch('/api/process-payment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(paymentData)
    // });
    // 
    // const result = await response.json();
    // return result.success;

    // Simulated success (90% success rate for demo)
    return Math.random() > 0.1;
}

// Show payment success
function showPaymentSuccess() {
    // Option 1: Redirect to confirmation page
    // window.location.href = '../pages/confirmation.html';

    // Option 2: Show success modal (for demo purposes)
    alert('Payment successful!\n\nYour parking spot has been reserved.\n\nA confirmation email has been sent to your registered email address.');

    // Redirect to dashboard or parking page
    window.location.href = '../pages/parking.html';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initPaymentSystem();
});

// Export functions for external use
window.initPaymentSystem = initPaymentSystem;
window.loadBookingData = loadBookingData;

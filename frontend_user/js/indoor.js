// js/indoor.js - Indoor Parking Layout Management

let currentGarageData = null;
let currentFloor = null;
let selectedSpot = null;

// Initialize indoor layout system
function initIndoorSystem() {
    setupBackButton();
    console.log('Indoor system initialized');
}

// Setup back button to return to outdoor map
function setupBackButton() {
    const backBtn = document.getElementById('back-to-outdoor-map');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            hideIndoorLayout();
            showOutdoorMap();
        });
    }
}

// Show outdoor map and hide indoor layout
function showOutdoorMap() {
    const outdoorMap = document.getElementById('outdoor-map-container');
    const indoorLayout = document.getElementById('indoor-layout-container');
    
    if (outdoorMap) outdoorMap.classList.remove('hidden');
    if (indoorLayout) indoorLayout.classList.add('hidden');
    
    console.log('Switched to outdoor map');
}

// Hide outdoor map and show indoor layout
function showIndoorLayout() {
    const outdoorMap = document.getElementById('outdoor-map-container');
    const indoorLayout = document.getElementById('indoor-layout-container');
    
    if (outdoorMap) outdoorMap.classList.add('hidden');
    if (indoorLayout) indoorLayout.classList.remove('hidden');
    
    console.log('Switched to indoor layout');
}

// Hide indoor layout
function hideIndoorLayout() {
    const indoorLayout = document.getElementById('indoor-layout-container');
    if (indoorLayout) indoorLayout.classList.add('hidden');
}

// Load indoor layout for a specific garage
async function loadIndoorLayout(garageId) {
    console.log('Loading indoor layout for garage:', garageId);
    
    try {
        // Fetch garage data from backend (simulated)
        const garageData = await fetchGarageData(garageId);
        
        if (!garageData) {
            console.error('No data found for garage:', garageId);
            return;
        }
        
        currentGarageData = garageData;
        
        // Update garage name
        const garageNameElement = document.getElementById('indoor-lot-name');
        if (garageNameElement) {
            garageNameElement.textContent = garageData.name;
        }
        
        // Render floor buttons
        renderFloorButtons(garageData.floors);
        
        // Render first floor by default
        if (garageData.floors && garageData.floors.length > 0) {
            renderFloor(garageData.floors[0]);
        }
        
        // Show indoor layout
        showIndoorLayout();
        
    } catch (error) {
        console.error('Error loading indoor layout:', error);
        alert('Failed to load parking layout. Please try again.');
    }
}

// Fetch garage data (simulated backend call)
async function fetchGarageData(garageId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock data - Replace with actual API call: fetch(`/api/parking-lot-${garageId}.json`)
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
                    spots: generateMockSpots('B1', 6, 8) // 6 rows, 8 columns
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
    
    return mockData[garageId] || mockData['spot-1'];
}

// Generate mock parking spots
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
                status: randomStatus, // available, occupied, reserved
                row: row,
                col: col,
                type: 'standard' // standard, disabled, ev-charging
            });
        }
    }
    
    return spots;
}

// Render floor selection buttons
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

// Render parking spots for a specific floor
function renderFloor(floorData) {
    console.log('Rendering floor:', floorData.name);
    currentFloor = floorData;
    
    const grid = document.getElementById('parking-spot-grid');
    if (!grid) return;
    
    // Clear existing spots
    grid.innerHTML = '';
    
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

// Create a single parking spot element
function createSpotElement(spotData) {
    const spot = document.createElement('button');
    spot.className = `parking-spot parking-spot--${spotData.status}`;
    spot.setAttribute('data-spot-id', spotData.id);
    spot.setAttribute('data-status', spotData.status);
    
    // Add disabled attribute if occupied or reserved
    if (spotData.status !== 'available') {
        spot.setAttribute('disabled', 'true');
    }
    
    // Create spot structure matching your design
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

// Handle parking spot click
function handleSpotClick(spotData) {
    console.log('Spot clicked:', spotData);
    
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

// Update parking statistics
function updateParkingStats(spots) {
    const filledCount = spots.filter(s => s.status === 'occupied' || s.status === 'reserved').length;
    const emptyCount = spots.filter(s => s.status === 'available').length;
    
    const filledElement = document.getElementById('filled-count');
    const emptyElement = document.getElementById('empty-count');
    
    if (filledElement) filledElement.textContent = filledCount;
    if (emptyElement) emptyElement.textContent = emptyCount;
}

// Open booking modal
function openBookingModal(spotData) {
    const modal = document.getElementById('booking-modal');
    const spotNameElement = document.getElementById('modal-spot-name');
    
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
    
    if (spotNameElement) {
        spotNameElement.textContent = spotData.id;
    }
    
    // Set default times
    setDefaultBookingTimes();
}

// Set default booking times (now + 1 hour)
function setDefaultBookingTimes() {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');
    
    if (startInput) {
        startInput.value = formatDateTimeLocal(now);
    }
    
    if (endInput) {
        endInput.value = formatDateTimeLocal(oneHourLater);
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
    const ratePerHour = 5.00; // $5/hour
    
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

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scroll
    }
    
    selectedSpot = null;
    
    // Remove selection highlight
    document.querySelectorAll('.parking-spot').forEach(spot => {
        spot.classList.remove('parking-spot--selected');
    });
}

// Initialize booking modal handlers
function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const form = document.getElementById('booking-form');
    const startInput = document.getElementById('start-time');
    const endInput = document.getElementById('end-time');
    
    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBookingModal);
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeBookingModal);
    }
    
    // Click outside modal to close
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBookingModal();
            }
        });
    }
    
    // Time change handlers
    if (startInput) {
        startInput.addEventListener('change', calculateBookingCost);
    }
    
    if (endInput) {
        endInput.addEventListener('change', calculateBookingCost);
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handleBookingSubmit);
    }
}

// Handle booking form submission
function handleBookingSubmit(e) {
    e.preventDefault();

    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    const totalCost = document.getElementById('summary-total').textContent;

    console.log('Booking submitted:', {
        spot: selectedSpot,
        startTime,
        endTime,
        totalCost
    });

    // Prepare booking data for payment page
    const bookingData = {
        lotName: currentGarageData ? currentGarageData.name : 'Main St. Garage',
        lotAddress: currentGarageData ? currentGarageData.address : '',
        spotId: selectedSpot ? selectedSpot.id : '',
        floorName: currentFloor ? currentFloor.name : '',
        startTime: startTime,
        endTime: endTime,
        totalCost: totalCost,
        bookingId: generateBookingId(),
        timestamp: new Date().toISOString()
    };

    // Store booking data in sessionStorage for payment page
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    console.log('Booking data saved to sessionStorage:', bookingData);

    // Redirect to payment page
    window.location.href = '../pages/payment.html';
}

// Generate a unique booking ID
function generateBookingId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `BK-${timestamp}-${random}`;
}


// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initIndoorSystem();
    initBookingModal();
});

// Export functions for use in parking.js
window.loadIndoorLayout = loadIndoorLayout;
window.showIndoorLayout = showIndoorLayout;
window.hideIndoorLayout = hideIndoorLayout;
window.showOutdoorMap = showOutdoorMap;

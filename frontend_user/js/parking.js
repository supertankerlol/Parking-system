/**
 * parking.js - Mapbox GL JS Integration with Theme Support & Search Autocomplete
 * 
 * Depends on:
 * - config.js (for API_BASE)
 * - api.js (for apiFetch, isAuthenticated)
 * - auth.js (for requireAuth - optional)
 * - Mapbox GL JS
 * - Mapbox GL Geocoder
 */

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoibnVyeWsyMDA0IiwiYSI6ImNtajRpM2txYzE3dHkzZXI3MzhzbXA1YTUifQ.ZivO4brO-dW8uMmJtDuRdA';

let map;
let currentMapTheme = 'light';
let geocoder;
let markers = []; // Store search markers for cleanup
let parkingMarkers = []; // Store parking spot markers
let userLocationMarker = null;
let userLocation = null;
let radiusMeters = 2000; // 2km radius

// Store loaded parking spots from API
let parkingSpots = [];

// =========================================================================
// MAPBOX STYLE CONFIGURATION
// =========================================================================

// Light mode style - Mapbox Streets (closest to Google Maps default)
const LIGHT_STYLE = 'mapbox://styles/mapbox/streets-v12';

// Dark mode style - Navigation Night has better icon/POI visibility than dark-v11
// NOTE: If built-in POI icons still don't appear, navigation-night-v1 may have fewer
// POI layers than streets-v12. In that case, consider using streets-v12 with a dark
// overlay, or accept that some built-in icons may differ between light/dark modes.
const DARK_STYLE = 'mapbox://styles/mapbox/navigation-night-v1';

// Style comparison:
// - streets-v12: Full POI coverage, light theme
// - navigation-night-v1: Navigation-focused, dark theme, good POI coverage
// - dark-v11: Minimal style, reduced POI visibility (not recommended)

// =========================================================================
// API FUNCTIONS
// =========================================================================

/**
 * Load parking spots from the backend API.
 * Groups spots by garage to avoid showing duplicate markers for indoor spots.
 * @param {Object} [options] - Query options
 * @param {number} [options.lat] - Latitude for location-based search
 * @param {number} [options.lng] - Longitude for location-based search
 * @param {number} [options.radius] - Radius in meters
 * @param {string} [options.status] - Filter by status (AVAILABLE, OCCUPIED, etc.)
 * @returns {Promise<Array>} Array of parking spots (grouped by garage)
 */
async function loadSpots(options = {}) {
    try {
        // Build query string
        const params = new URLSearchParams();
        if (options.lat) params.append('lat', options.lat);
        if (options.lng) params.append('lng', options.lng);
        if (options.radius) params.append('radius', options.radius);
        if (options.status) params.append('status', options.status);
        if (options.garageId) params.append('garageId', options.garageId);

        const queryString = params.toString();
        const endpoint = queryString ? `/parking?${queryString}` : '/parking';

        console.log('[Parking] Loading spots from API:', endpoint);

        const response = await apiFetch(endpoint);

        // Handle different response formats
        const spots = Array.isArray(response) ? response : (response.spots || response.data || []);

        // Group spots by garage to avoid duplicates on the map
        const garageMap = new Map();
        
        spots.forEach(spot => {
            const garage = spot.garage || {};
            const garageId = spot.garageId || garage.id || spot.id;
            const spotLat = spot.latitude || spot.lat || garage.lat;
            const spotLng = spot.longitude || spot.lng || garage.lng;
            
            // Skip spots without valid coordinates
            if (!spotLat || !spotLng || isNaN(spotLat) || isNaN(spotLng)) {
                console.warn('[Parking] Spot missing coordinates:', spot.id, { spotLat, spotLng, garage });
                return;
            }
            
            if (garageMap.has(garageId)) {
                // Update existing garage entry - count available spots
                const existing = garageMap.get(garageId);
                if (spot.status === 'AVAILABLE') {
                    existing.availableSpots++;
                }
                existing.totalSpots++;
            } else {
                // Create new garage entry
                garageMap.set(garageId, {
                    id: garageId,
                    lat: spotLat,
                    lng: spotLng,
                    price: spot.hourlyRate || spot.price || garage.hourlyRate || 0,
                    name: garage.name || spot.name || `Parking ${garageId}`,
                    address: garage.address || spot.address || '',
                    dayRate: spot.dayRate || garage.dayRate || null,
                    earlyBirdRate: spot.earlyBirdRate || garage.earlyBirdRate || null,
                    status: spot.status || 'AVAILABLE',
                    garageId: garageId,
                    floorId: spot.floorId || null,
                    spotNumber: spot.spotNumber || null,
                    garageName: garage.name || null,
                    garageType: garage.type || null,
                    availableSpots: spot.status === 'AVAILABLE' ? 1 : 0,
                    totalSpots: 1
                });
            }
        });
        
        // Convert map to array
        parkingSpots = Array.from(garageMap.values());

        console.log('[Parking] Loaded', spots.length, 'spots, grouped into', parkingSpots.length, 'garages');

        return parkingSpots;

    } catch (error) {
        console.error('[Parking] Failed to load spots:', error.message);
        return [];
    }
}

/**
 * Load spots and render them on the map.
 * @param {number} centerLat - Center latitude
 * @param {number} centerLng - Center longitude
 * @param {boolean} [autoCenter=false] - If true and no spots in radius, center on first spot
 */
async function loadAndRenderSpots(centerLat, centerLng, autoCenter = false) {
    // API expects radius in kilometers, convert from meters
    const radiusKm = radiusMeters / 1000;
    
    await loadSpots({
        lat: centerLat,
        lng: centerLng,
        radius: radiusKm
    });

    // If autoCenter is enabled and we have spots, check if any are in radius
    if (autoCenter && parkingSpots.length > 0) {
        const spotsInRadius = parkingSpots.filter(spot => {
            const distance = calculateDistance(centerLat, centerLng, spot.lat, spot.lng);
            return distance <= radiusMeters;
        });
        
        // If no spots in radius, fly to the first spot's location
        if (spotsInRadius.length === 0 && parkingSpots[0].lat && parkingSpots[0].lng) {
            console.log('[Parking] No spots in radius, centering on first parking spot');
            const firstSpot = parkingSpots[0];
            
            map.flyTo({
                center: [firstSpot.lng, firstSpot.lat],
                zoom: 14,
                duration: 1500
            });
            
            // Re-render with new center after fly completes
            map.once('moveend', () => {
                addParkingSpotsInRadius(firstSpot.lat, firstSpot.lng);
            });
            return;
        }
    }

    // Render the loaded spots
    addParkingSpotsInRadius(centerLat, centerLng);
}

// =========================================================================
// BOOKING FUNCTIONS
// =========================================================================

/**
 * Handle booking a parking spot.
 * @param {string} spotId - The spot ID to book
 * @param {number} price - The hourly price
 */
function handleBookNow(spotId, price) {
    console.log('[Parking] Booking spot:', spotId, 'at price:', price);

    if (!isAuthenticated()) {
        console.log('[Parking] User not authenticated, showing login prompt');
        showLoginPrompt(spotId);
        return;
    }

    proceedToBooking(spotId);
}

/**
 * Show login prompt modal or redirect to login.
 * @param {string} spotId - The spot ID user wanted to book
 */
function showLoginPrompt(spotId) {
    sessionStorage.setItem('pendingBookingSpotId', spotId);

    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.classList.remove('hidden');
        loginModal.style.display = 'flex';
        return;
    }

    const shouldLogin = confirm(
        'You need to log in to book a parking spot.\n\nWould you like to log in now?'
    );

    if (shouldLogin) {
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
    }
}

/**
 * Proceed to the booking page with spot data.
 * @param {string} spotId - The spot ID to book
 */
function proceedToBooking(spotId) {
    const spot = parkingSpots.find(s => s.id === spotId);

    if (!spot) {
        console.error('[Parking] Spot not found:', spotId);
        alert('Parking spot not found. Please try again.');
        return;
    }

    const bookingData = {
        spotId: spot.id,
        spotName: spot.name,
        spotAddress: spot.address,
        price: spot.price,
        dayRate: spot.dayRate,
        earlyBirdRate: spot.earlyBirdRate,
        garageId: spot.garageId,
        floorId: spot.floorId,
        spotNumber: spot.spotNumber
    };

    sessionStorage.setItem('bookingSpotData', JSON.stringify(bookingData));

    window.location.href = `booking.html?spotId=${spotId}`;
}

// =========================================================================
// MAP HELPER FUNCTIONS
// =========================================================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

/**
 * Format distance for display
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return Math.round(meters) + ' m';
    } else {
        return (meters / 1000).toFixed(1) + ' km';
    }
}

/**
 * Create HTML element for parking marker
 */
function createParkingMarkerElement(price) {
    let priceClass = 'price-medium';
    if (price === 0) {
        priceClass = 'price-free';
    } else if (price < 2) {
        priceClass = 'price-low';
    } else if (price >= 2 && price < 5) {
        priceClass = 'price-medium';
    } else {
        priceClass = 'price-high';
    }
    
    const el = document.createElement('div');
    el.className = `parking-marker ${priceClass}`;
    el.innerHTML = `
        <div class="car-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
        <div class="price">${price === 0 ? 'FREE' : '$' + price.toFixed(2)}</div>
    `;
    
    return el;
}

/**
 * Create a Mapbox marker for a parking spot
 */
function createParkingMarker(spot) {
    // Validate coordinates before creating marker
    if (!spot.lat || !spot.lng || isNaN(spot.lat) || isNaN(spot.lng)) {
        console.error('[Parking] Cannot create marker - invalid coordinates:', spot.id, { lat: spot.lat, lng: spot.lng });
        return null;
    }
    
    // Validate coordinate ranges
    if (spot.lat < -90 || spot.lat > 90 || spot.lng < -180 || spot.lng > 180) {
        console.error('[Parking] Cannot create marker - coordinates out of range:', spot.id, { lat: spot.lat, lng: spot.lng });
        return null;
    }
    
    console.log('[Parking] Creating marker for spot:', spot.id, 'at', [spot.lng, spot.lat]);
    
    // Inner visual element for the marker
    const innerEl = createParkingMarkerElement(spot.price);

    // Wrapper used by Mapbox for positioning (it will receive translate() transforms)
    const container = document.createElement('div');
    container.className = 'marker-container';

    // Scaler element so we can change size without touching Mapbox's transform
    const scaler = document.createElement('div');
    scaler.className = 'marker-scaler';

    scaler.appendChild(innerEl);
    container.appendChild(scaler);
    
    // Create the marker using the outer container element
    const marker = new mapboxgl.Marker({
        element: container,
        anchor: 'bottom'
    })
    .setLngLat([spot.lng, spot.lat]);
    
    // Store spot data on marker for reference
    marker.spotData = spot;
    
    // Add click handler
    innerEl.addEventListener('click', (e) => {
            e.stopPropagation();
        highlightParkingCard(spot.id);
        map.flyTo({
            center: [spot.lng, spot.lat],
            zoom: 17,
            duration: 500
        });
    });
    
    // Trigger drop animation - use double rAF to ensure element is in DOM
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            innerEl.classList.add('animate-drop');
        });
    });
    
    return marker;
}

/**
 * Update parking window with cards
 */
function updateParkingWindow(nearbySpots) {
    const parkingWindow = document.querySelector('.parking-window');
    
    if (!parkingWindow) return;
    
    parkingWindow.innerHTML = '';
    
    if (nearbySpots.length === 0) {
        parkingWindow.innerHTML = `
            <div class="no-parks-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M9 11V6a3 3 0 0 1 6 0v5" />
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                </svg>
                <h3>No parks nearby</h3>
                <p>Try moving the map or searching a different location</p>
            </div>
        `;
        return;
    }
    
    nearbySpots.forEach(spot => {
        const card = createParkingCard(spot);
        parkingWindow.appendChild(card);
    });
}

/**
 * Create parking card element
 */
function createParkingCard(spot) {
    const card = document.createElement('div');
    card.className = 'parking-card';
    card.setAttribute('data-spot-id', spot.id);
    
    const hourlyRate = spot.price === 0 ? 'Free' : `$${spot.price.toFixed(2)}/hour`;
    const dayRateHTML = spot.dayRate ? `Day rate: $${spot.dayRate.toFixed(2)}` : '';
    const earlyBirdHTML = spot.earlyBirdRate ? `<br>Early bird rate: $${spot.earlyBirdRate.toFixed(2)}` : '';
    const availabilityHTML = spot.totalSpots ? `<span class="spots-available">${spot.availableSpots}/${spot.totalSpots} spots</span>` : '';
    
    card.innerHTML = `
        <div class="parking-card-header">
            <h3 class="parking-card-title">${spot.name}</h3>
            <span class="parking-status">${hourlyRate}</span>
        </div>
        <div class="parking-card-body">
            <div class="parking-info-row">
                <div class="parking-info-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span>${spot.distance || 'N/A'}</span>
                </div>
                ${availabilityHTML ? `<div class="parking-info-item">${availabilityHTML}</div>` : ''}
            </div>
            <div class="parking-address">
                ${spot.address || 'Address not available'}
            </div>
            ${dayRateHTML || earlyBirdHTML ? `
                <div class="parking-rates">
                    ${dayRateHTML}${earlyBirdHTML}
                </div>
            ` : ''}
        </div>
        <div class="parking-card-footer">
            <button class="btn btn-outline btn-sm view-details-btn" data-spot-id="${spot.id}">
                View Details
            </button>
            <button class="btn btn-primary btn-sm book-now-btn" data-spot-id="${spot.id}" data-price="${spot.price}">
                Book Now
            </button>
        </div>
    `;
    
    // Add click handler to pan to marker
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            map.flyTo({
                center: [spot.lng, spot.lat],
                zoom: 17,
                duration: 500
            });
            highlightParkingCard(spot.id);
        }
    });
    
    return card;
}

/**
 * Highlight parking card
 */
function highlightParkingCard(spotId) {
    document.querySelectorAll('.parking-card').forEach(card => {
        card.classList.remove('highlighted');
    });
    
    const card = document.querySelector(`[data-spot-id="${spotId}"]`);
    if (card) {
        card.classList.add('highlighted');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

/**
 * Add parking spots within radius
 */
function addParkingSpotsInRadius(centerLat, centerLng) {
    // Find all spots within radius
    const validSpotsInRadius = [];
    
    parkingSpots.forEach((spot) => {
        // Skip spots without valid coordinates
        if (!spot.lat || !spot.lng || isNaN(spot.lat) || isNaN(spot.lng)) {
            console.warn('[Parking] Skipping spot without valid coordinates:', spot.id);
            return;
        }
        
        const distance = calculateDistance(centerLat, centerLng, spot.lat, spot.lng);
        
        if (distance <= radiusMeters) {
            spot.distance = formatDistance(distance);
            spot.distanceMeters = distance;
            validSpotsInRadius.push(spot);
        }
    });
    
    // Sort by distance
    validSpotsInRadius.sort((a, b) => a.distanceMeters - b.distanceMeters);
    
    // Update the sidebar list
    updateParkingWindow(validSpotsInRadius);
    
    // --- SMART MARKER MANAGEMENT ---
    
    const validSpotIds = new Set(validSpotsInRadius.map(s => s.id));
    
    // Remove markers no longer in radius
    parkingMarkers = parkingMarkers.filter(marker => {
        const stillVisible = validSpotIds.has(marker.spotData.id);
        
        if (!stillVisible) {
            marker.remove();
            return false;
        }
        return true;
    });
    
    // Add only new markers
    const existingMarkerIds = new Set(parkingMarkers.map(m => m.spotData.id));
    
    let delayCounter = 0;
    
    validSpotsInRadius.forEach((spot) => {
        if (!existingMarkerIds.has(spot.id)) {
            setTimeout(() => {
                if (existingMarkerIds.has(spot.id)) return;

                try {
                    const marker = createParkingMarker(spot);
                    
                    // Skip if marker creation failed (invalid coordinates)
                    if (!marker) {
                        console.warn('[Parking] Skipping spot with invalid marker:', spot.id);
                        return;
                    }
                    
                    marker.addTo(map);
                    parkingMarkers.push(marker);
                    existingMarkerIds.add(spot.id);
                    
                    console.log('[Parking] Marker added for spot:', spot.id);
                } catch (error) {
                    console.error('[Parking] Marker creation failed:', error);
                }
                
            }, delayCounter * 50);
            
            delayCounter++;
        }
    });
    
    console.log(`[Parking] Map updated: ${parkingMarkers.length} active markers (${delayCounter} new).`);
}

/**
 * Clear all parking markers
 */
function clearParkingMarkers() {
    parkingMarkers.forEach(marker => {
        marker.remove();
    });
    parkingMarkers = [];
}

/**
 * Clear search markers
 */
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// =========================================================================
// MAP INITIALIZATION
// =========================================================================

/**
 * Initialize Mapbox map when page loads
 */
async function initMap() {
    const defaultCenter = [76.669139, 43.207079]; // [lng, lat] - Almaty, Kazakhstan
    const mapContainer = document.getElementById('mapbox-map');
    
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    
    // Determine initial theme
    const savedTheme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
    currentMapTheme = isDark ? 'dark' : 'light';
    
    // Create the map
    map = new mapboxgl.Map({
        container: 'mapbox-map',
        style: isDark ? DARK_STYLE : LIGHT_STYLE,
        center: defaultCenter,
        zoom: 14,
        
        // Interaction options (matching Google Maps 'greedy' gesture handling)
        dragRotate: false, // Disable rotation for simpler UX
        touchZoomRotate: true,
        scrollZoom: true,
        doubleClickZoom: true,
        touchPitch: false,
        
        // Attribution control
        attributionControl: false
    });
    
    // Add navigation controls (zoom buttons) - positioned bottom-right to avoid overlap with parking window
    map.addControl(new mapboxgl.NavigationControl({
        showCompass: false, // Hide compass for cleaner look like Google Maps
        visualizePitch: false
    }), 'bottom-right');
    
    // Add fullscreen control - also bottom-right
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');
    
    // Add attribution in bottom-left (required by Mapbox ToS)
    map.addControl(new mapboxgl.AttributionControl({
        compact: true
    }), 'bottom-left');
    
    // Wait for map to load before adding features
    map.on('load', async () => {
        console.log('[Parking] Mapbox map loaded');
        
        // Initialize geocoder (search autocomplete)
        initGeocoder();
    
    // Initialize "Find Me" button
    initFindMeButton();
    
        // Setup map listeners
    setupMapListeners();
    
    // Setup button click delegation
    setupButtonHandlers();
    
    // Load parking spots from API and render (autoCenter=true to fly to spots if none nearby)
        await loadAndRenderSpots(defaultCenter[1], defaultCenter[0], true);

    console.log('[Parking] Map initialized successfully with', currentMapTheme, 'theme');
    });
    
    // Handle map style load errors
    map.on('error', (e) => {
        console.error('[Parking] Map error:', e.error);
    });
}

/**
 * Initialize custom search with Mapbox Geocoding API
 * Uses our own input and dropdown - no built-in Mapbox geocoder UI
 */
function initGeocoder() {
    const searchInput = document.getElementById('map-search');
    
    if (!searchInput) {
        console.error('Search input not found!');
                return;
            }
            
    // Create custom suggestions dropdown
    let suggestionsContainer = document.getElementById('search-suggestions');
    if (!suggestionsContainer) {
        suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'search-suggestions';
        searchInput.parentNode.appendChild(suggestionsContainer);
    }
    
    let debounceTimer = null;
    let selectedIndex = -1;
    let currentSuggestions = [];
    
    // Handle input changes with debounce
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        
        clearTimeout(debounceTimer);
        
        if (query.length < 2) {
            hideSuggestions();
        return;
    }
    
        debounceTimer = setTimeout(() => {
            searchPlaces(query);
        }, 300);
    });
    
    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsContainer.classList.contains('visible')) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, currentSuggestions.length - 1);
                updateSelectedSuggestion();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                updateSelectedSuggestion();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && currentSuggestions[selectedIndex]) {
                    selectPlace(currentSuggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                hideSuggestions();
                break;
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            hideSuggestions();
        }
    });
    
    // Search places using Mapbox Geocoding API
    async function searchPlaces(query) {
        try {
            const center = map.getCenter();
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                `access_token=${mapboxgl.accessToken}` +
                `&proximity=${center.lng},${center.lat}` +
                `&limit=5` +
                `&types=place,locality,neighborhood,address,poi`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                currentSuggestions = data.features;
                showSuggestions(data.features);
        } else {
                hideSuggestions();
            }
        } catch (error) {
            console.error('[Parking] Geocoding error:', error);
            hideSuggestions();
        }
    }
    
    // Show suggestions dropdown
    function showSuggestions(features) {
        selectedIndex = -1;
        suggestionsContainer.innerHTML = features.map((feature, index) => `
            <div class="suggestion-item" data-index="${index}">
                <div class="suggestion-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                    </svg>
                </div>
                <div class="suggestion-text">
                    <div class="suggestion-title">${feature.text || feature.place_name.split(',')[0]}</div>
                    <div class="suggestion-address">${feature.place_name}</div>
                </div>
            </div>
        `).join('');
        
        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                selectPlace(features[index]);
            });
        });
        
        suggestionsContainer.classList.add('visible');
    }
    
    // Hide suggestions dropdown
    function hideSuggestions() {
        suggestionsContainer.classList.remove('visible');
        currentSuggestions = [];
        selectedIndex = -1;
    }
    
    // Update selected suggestion highlight
    function updateSelectedSuggestion() {
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });
    }
    
    // Select a place from suggestions
    async function selectPlace(feature) {
        hideSuggestions();
        
        // Update search input
        searchInput.value = feature.place_name;
        
        // Clear existing search markers
        clearMarkers();
        
        // Fly to location
        map.flyTo({
            center: feature.center,
            zoom: 17,
            duration: 500
        });
        
        // Add marker at selected location
        const marker = new mapboxgl.Marker({
            color: '#5562E9'
        })
        .setLngLat(feature.center)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: 600;">${feature.text || feature.place_name.split(',')[0]}</h3>
                    <p style="margin: 0; font-size: 14px; color: #666;">${feature.place_name}</p>
                </div>
            `)
        )
        .addTo(map);
        
        marker.togglePopup();
        markers.push(marker);
        
        // Load spots for the new location
        const [lng, lat] = feature.center;
        await loadAndRenderSpots(lat, lng);
        
        console.log('[Parking] Place selected:', feature);
    }
}

/**
 * Initialize "Find Me" button (geolocation)
 */
function initFindMeButton() {
    const findMeBtn = document.getElementById('find-me-btn');
    
    if (!findMeBtn) return;
    
    findMeBtn.addEventListener('click', async () => {
        if (navigator.geolocation) {
            // Show loading state
            findMeBtn.disabled = true;
            findMeBtn.style.opacity = '0.6';
            
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    userLocation = pos;
                    
                    // Fly to user location
                    map.flyTo({
                        center: [pos.lng, pos.lat],
                        zoom: 15,
                        duration: 1000
                    });
                    
                    // Clear existing search markers
                    clearMarkers();
                    
                    // Remove previous user location marker
                    if (userLocationMarker) {
                        userLocationMarker.remove();
                    }
                    
                    // Create custom user location marker element
                    const el = document.createElement('div');
                    el.className = 'user-location-marker';
                    el.innerHTML = `
                        <div class="user-location-dot"></div>
                        <div class="user-location-pulse"></div>
                    `;
                    
                    // Add marker at user location
                    userLocationMarker = new mapboxgl.Marker({
                        element: el,
                        anchor: 'center'
                    })
                    .setLngLat([pos.lng, pos.lat])
                    .addTo(map);
                    
                    // Load and show nearby parking spots
                    await loadAndRenderSpots(pos.lat, pos.lng);
                    
                    console.log('[Parking] User location found:', pos);
                    
                    // Reset button state
                    findMeBtn.disabled = false;
                    findMeBtn.style.opacity = '1';
                },
                (error) => {
                    console.error('[Parking] Geolocation error:', error);
                    alert('Error: The Geolocation service failed.');
                    findMeBtn.disabled = false;
                    findMeBtn.style.opacity = '1';
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    });
}

/**
 * Setup map event listeners
 */
function setupMapListeners() {
    let moveTimeout;
    let isZooming = false;
    
    // Detect zoom start
    map.on('zoomstart', () => {
        isZooming = true;
    });
    
    map.on('zoomend', () => {
        // Update marker sizes based on zoom level
        updateMarkerSizes();
    });
    
    // Map idle event (after pan/zoom complete)
    map.on('idle', () => {
        clearTimeout(moveTimeout);
        
        moveTimeout = setTimeout(async () => {
            if (!isZooming) {
                const center = map.getCenter();
                await loadAndRenderSpots(center.lat, center.lng);
            }
            isZooming = false;
        }, 500);
    });
    
    // Update on drag end
    map.on('dragend', async () => {
        const center = map.getCenter();
        await loadAndRenderSpots(center.lat, center.lng);
    });
}

/**
 * Update marker sizes based on zoom level
 */
function updateMarkerSizes() {
    const zoom = map.getZoom();
    
    parkingMarkers.forEach(marker => {
        const el = marker.getElement();
        if (!el) return;

        // Our structure is: container (Mapbox) -> .marker-scaler -> .parking-marker
        const scaler = el.querySelector('.marker-scaler') || el;
        const markerContent = el.querySelector('.parking-marker') || el;
        
        // Toggle compact mode based on zoom
        if (zoom < 14) {
            markerContent.classList.add('compact-mode');
        } else {
            markerContent.classList.remove('compact-mode');
        }
        
        // Scale markers based on zoom
        let scale = 1;
        if (zoom >= 17) scale = 1.1;
        else if (zoom >= 15) scale = 1;
        else if (zoom >= 13) scale = 0.8;
        else scale = 0.6;
        
        // Apply scale on the inner scaler so we don't override Mapbox's translate() on the container
        scaler.style.transform = `scale(${scale})`;
    });
}

/**
 * Setup event delegation for button clicks
 */
function setupButtonHandlers() {
    const parkingWindow = document.querySelector('.parking-window');
    
    if (parkingWindow) {
        parkingWindow.addEventListener('click', (e) => {
            const bookBtn = e.target.closest('.book-now-btn');
            if (bookBtn) {
                e.preventDefault();
                e.stopPropagation();
                const spotId = bookBtn.dataset.spotId;
                const price = parseFloat(bookBtn.dataset.price) || 0;
                handleBookNow(spotId, price);
                return;
            }
            
            const detailsBtn = e.target.closest('.view-details-btn');
            if (detailsBtn) {
                e.preventDefault();
                e.stopPropagation();
                const spotId = detailsBtn.dataset.spotId;
                viewParkingDetails(spotId);
                return;
            }
        });
    }
}

// =========================================================================
// THEME MANAGEMENT
// =========================================================================

/**
 * Update map theme dynamically
 */
function updateMapTheme(theme) {
    if (!map) return;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
    const newTheme = shouldBeDark ? 'dark' : 'light';
    
    if (newTheme !== currentMapTheme) {
        currentMapTheme = newTheme;
        
        // CRITICAL: Store marker data before style change
        // Mapbox removes ALL markers when setStyle() is called
        const savedParkingMarkers = parkingMarkers.map(marker => ({
            spot: marker.spotData,
            lngLat: marker.getLngLat()
        }));
        
        const savedUserLocation = userLocationMarker ? {
            lngLat: userLocationMarker.getLngLat()
        } : null;
        
        // Note: Mapbox Popup doesn't have getHTML() - store popup content differently
        const savedSearchMarkers = markers.map(marker => {
            const popup = marker.getPopup();
            let popupHTML = null;
            if (popup) {
                // Try to get HTML from popup's internal content or DOM element
                try {
                    const popupEl = popup.getElement();
                    if (popupEl) {
                        const contentEl = popupEl.querySelector('.mapboxgl-popup-content');
                        popupHTML = contentEl ? contentEl.innerHTML : null;
                    }
                } catch (e) {
                    console.warn('[Parking] Could not extract popup HTML:', e);
                }
            }
            return {
                lngLat: marker.getLngLat(),
                popup: popupHTML
            };
        });
        
        // Change map style
        map.setStyle(shouldBeDark ? DARK_STYLE : LIGHT_STYLE);
        
        // Re-add all markers after style loads
        map.once('style.load', async () => {
            console.log('[Parking] Map theme updated to:', newTheme);
            
            // Wait a frame to ensure style is fully loaded
            await new Promise(resolve => requestAnimationFrame(resolve));
            
            // Re-add parking markers
            parkingMarkers = [];
            for (const saved of savedParkingMarkers) {
                try {
                    if (!saved.spot || !saved.lngLat) continue;
                    
                    const marker = createParkingMarker(saved.spot);
                    marker.setLngLat(saved.lngLat);
                    marker.addTo(map);
                    parkingMarkers.push(marker);
                } catch (error) {
                    console.error('[Parking] Failed to restore parking marker:', error, saved);
                }
            }
            
            // Re-add user location marker
            if (savedUserLocation && savedUserLocation.lngLat) {
                try {
                    const el = document.createElement('div');
                    el.className = 'user-location-marker';
                    el.innerHTML = `
                        <div class="user-location-dot"></div>
                        <div class="user-location-pulse"></div>
                    `;
                    
                    userLocationMarker = new mapboxgl.Marker({
                        element: el,
                        anchor: 'center'
                    })
                    .setLngLat(savedUserLocation.lngLat)
                    .addTo(map);
                } catch (error) {
                    console.error('[Parking] Failed to restore user location marker:', error);
                }
            }
            
            // Re-add search markers
            markers = [];
            for (const saved of savedSearchMarkers) {
                try {
                    if (!saved.lngLat) continue;
                    
                    const marker = new mapboxgl.Marker({
                        color: '#5562E9'
                    })
                    .setLngLat(saved.lngLat);
                    
                    if (saved.popup) {
                        marker.setPopup(new mapboxgl.Popup({ offset: 25 })
                            .setHTML(saved.popup)
                        );
                    }
                    
                    marker.addTo(map);
                    markers.push(marker);
                } catch (error) {
                    console.error('[Parking] Failed to restore search marker:', error);
                }
            }
            
            // Update marker sizes after restoration
            if (parkingMarkers.length > 0) {
                updateMarkerSizes();
            }
            
            console.log(`[Parking] Restored ${parkingMarkers.length} parking markers, ${markers.length} search markers, user location: ${!!userLocationMarker}`);
        });
    }
}

// Listen for theme changes from your app
window.addEventListener('themeChanged', (event) => {
    updateMapTheme(event.detail.theme);
});

// Listen for OS theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    if (savedTheme === 'system') {
        updateMapTheme('system');
    }
});

// =========================================================================
// REAL-TIME UPDATES
// =========================================================================

// Listen for real-time spot updates via WebSocket
window.addEventListener('spot:update', (event) => {
    const { spotId, status, ...updates } = event.detail;
    console.log('[Parking] Real-time spot update:', spotId, status);
    
    const spotIndex = parkingSpots.findIndex(s => s.id === spotId);
    if (spotIndex !== -1) {
        parkingSpots[spotIndex] = { ...parkingSpots[spotIndex], status, ...updates };
        
        if (map) {
            const center = map.getCenter();
            addParkingSpotsInRadius(center.lat, center.lng);
        }
    }
});

// =========================================================================
// GLOBAL EXPORTS
// =========================================================================

window.bookParkingSpot = function(spotId, price) {
    handleBookNow(spotId, price);
};

window.viewParkingDetails = function(spotId) {
    console.log('[Parking] Viewing details for:', spotId);
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
        // Only fly to if we have valid coordinates
        if (spot.lat && spot.lng && !isNaN(spot.lat) && !isNaN(spot.lng)) {
            map.flyTo({
                center: [spot.lng, spot.lat],
                zoom: 17,
                duration: 500
            });
        }
        highlightParkingCard(spotId);
        
        // Load indoor layout using the garage ID, not the spot ID
        // For indoor/mixed type garages only
        if (typeof loadIndoorLayout === 'function' && spot.garageId) {
            console.log('[Parking] Loading indoor layout for garage:', spot.garageId);
            loadIndoorLayout(spot.garageId);
        } else if (typeof loadIndoorLayout === 'function' && spot.garageType === 'outdoor') {
            console.log('[Parking] Outdoor garage - no indoor layout to load');
        } else if (typeof loadIndoorLayout === 'function') {
            console.warn('[Parking] Spot has no garageId, cannot load indoor layout');
        }
    } else {
        console.warn('[Parking] Spot not found:', spotId);
    }
};

window.toggleParkingSpots = async function(show) {
    if (show) {
        const center = map.getCenter();
        await loadAndRenderSpots(center.lat, center.lng);
    } else {
        clearParkingMarkers();
        updateParkingWindow([]);
    }
};

window.loadSpots = loadSpots;
window.loadAndRenderSpots = loadAndRenderSpots;
window.handleBookNow = handleBookNow;
window.initMap = initMap;

// Initialize map when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMap, 100);
});

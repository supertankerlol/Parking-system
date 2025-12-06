// js/parking.js - Google Maps Integration with Theme Support & Search Autocomplete

let map;
let currentMapTheme = 'light';
let autocomplete;
let markers = []; // Store markers for cleanup
let parkingMarkers = [];
let userLocation = null;
let radiusMeters = 2000; // 5km radius - adjust as needed

// Light Mode Map Styles (Retro/Vintage warm tones)
const lightMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#ebe3cd"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#523735"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#f5f1e6"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#c9b2a6"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#dcd2be"}]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#ae9e90"}]
  },
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [{"color": "#dfd2ae"}]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [{"color": "#dfd2ae"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#93817c"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#a5b076"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#447530"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#f5f1e6"}]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [{"color": "#fdfcf8"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#f8c967"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#e9bc62"}]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [{"color": "#e98d58"}]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#db8555"}]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#806b63"}]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [{"color": "#dfd2ae"}]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#8f7d77"}]
  },
  {
    "featureType": "transit.line",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#ebe3cd"}]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [{"color": "#dfd2ae"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#b9d3c2"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#92998d"}]
  }
];

// Dark Mode Map Styles (Night mode with cool tones)
const darkMapStyles = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#746855"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#242f3e"}]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#d59563"}]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#d59563"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{"color": "#263c3f"}]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#6b9a76"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{"color": "#38414e"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#212a37"}]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#9ca5b3"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{"color": "#746855"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [{"color": "#1f2835"}]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#f3d19c"}]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [{"color": "#2f3948"}]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#d59563"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#17263c"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#515c6d"}]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#17263c"}]
  }
];

// Sample parking spots data (replace with real data from your backend)
const parkingSpots = [
    { 
        lat: 43.207079, 
        lng: 76.669139, 
        price: 1.50, 
        id: 'spot-1',
        name: 'Outdoor surface car park',
        address: '9 Corinthian Drive, Almaty',
        dayRate: 12.00,
        earlyBirdRate: 10.00
    },
    { 
        lat: 43.208079, 
        lng: 76.670139, 
        price: 0, 
        id: 'spot-2',
        name: 'Free Almaty Parks',
        address: '55 Corinthion Drive, Almaty',
        dayRate: null,
        earlyBirdRate: null
    },
    { 
        lat: 43.206079, 
        lng: 76.668139, 
        price: 1.00, 
        id: 'spot-3',
        name: '22 Corinthian Drive (Outdoor)',
        address: '22 Corinthian Drive, Almaty',
        dayRate: 4.00,
        earlyBirdRate: null
    },
    { 
        lat: 43.209079, 
        lng: 76.671139, 
        price: 2.00, 
        id: 'spot-4',
        name: '22 Corinthian Drive (Indoor)',
        address: '22 Corinthian Drive, Almaty',
        dayRate: 8.00,
        earlyBirdRate: 6.00
    },
    { 
        lat: 43.205079, 
        lng: 76.667139, 
        price: 2.00, 
        id: 'spot-5',
        name: 'Upper Harbour Motorway',
        address: '1 Upper Harbour Motorway, Rosedale, Almaty',
        dayRate: 6.00,
        earlyBirdRate: 5.00
    },
];

// Calculate distance between two coordinates (Haversine formula)
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

    return R * c; // Distance in meters
}

// Format distance for display
function formatDistance(meters) {
    if (meters < 1000) {
        return Math.round(meters) + ' m';
    } else {
        return (meters / 1000).toFixed(1) + ' km';
    }
}

// Create HTML for parking marker
function createParkingMarkerHTML(price) {
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
    
    const div = document.createElement('div');
    div.className = `parking-marker ${priceClass}`;
    div.innerHTML = `
        <div class="car-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
        </div>
        <div class="price">${price === 0 ? 'FREE' : '$' + price.toFixed(2)}</div>
    `;
    
    return div;
}

// Robust Overlay class with Zoom Scaling and One-time Animation
class ParkingMarkerOverlay extends google.maps.OverlayView {
    constructor(position, price, spotData, map) {
        super();
        this.position = position;
        this.price = price;
        this.spotData = spotData;
        
        // References
        this.container = null;
        this.scaler = null;
        this.content = null;
        
        // State
        this.visible = false; 
        
        this.setMap(map);
    }
    
    onAdd() {
        // 1. Container: Anchors strictly to the map coordinate
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.cursor = 'pointer';
        // IMPORTANT: Start fully invisible so it doesn't flash at (0,0)
        this.container.style.opacity = '0'; 
        
        // 2. Scaler: Handles Zoom in/out size
        this.scaler = document.createElement('div');
        this.scaler.className = 'marker-scaler'; // Hook for CSS transitions
        this.scaler.style.transformOrigin = 'bottom center';

        // 3. Content: The visual card
        this.content = createParkingMarkerHTML(this.price);
        
        // Structure: Container -> Scaler -> Content
        this.scaler.appendChild(this.content);
        this.container.appendChild(this.scaler);
        
        // Add to map
        const panes = this.getPanes();
        panes.overlayMouseTarget.appendChild(this.container);
        
        // Events
        this.container.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleMarkerClick();
        });
    }
    
    draw() {
        const overlayProjection = this.getProjection();
        if (!overlayProjection || !this.container) return;
        
        // --- 1. Positioning ---
        const point = overlayProjection.fromLatLngToDivPixel(this.position);
        if (point) {
            this.container.style.left = point.x + 'px';
            this.container.style.top = point.y + 'px';
        }

        // --- 2. Zoom Scaling ---
        const zoom = this.getMap().getZoom();
        let scale = 1;
        if (zoom >= 17) scale = 1.1;
        else if (zoom >= 15) scale = 0.9;
        else if (zoom >= 13) scale = 0.6;
        else scale = 0.4;
        
        if (this.scaler) {
            this.scaler.style.transform = `translate(-50%, -100%) scale(${scale})`;
            
            // Toggle compact mode
            if (zoom < 14) this.content.classList.add('compact-mode');
            else this.content.classList.remove('compact-mode');
        }

        // --- 3. THE ANIMATION FIX ---
        // We ensure the element is positioned (Step 1) BEFORE we turn on visibility
        if (!this.visible) {
            // requestAnimationFrame 1: Wait for DOM to register the 'left' and 'top' set above
            requestAnimationFrame(() => {
                // requestAnimationFrame 2: Wait for browser to paint that position (still invisible)
                requestAnimationFrame(() => {
                    if (this.container) {
                        this.container.style.opacity = '1'; // Make container visible
                        this.content.classList.add('animate-drop'); // Trigger the CSS animation
                        this.visible = true;
                    }
                });
            });
        }
    }
    
    onRemove() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.visible = false;
    }
    
    handleMarkerClick() {
        highlightParkingCard(this.spotData.id);
        map.panTo(this.position);
        map.setZoom(17);
    }
}

// Update parking window with cards
function updateParkingWindow(nearbySpots) {
    const parkingWindow = document.querySelector('.parking-window');
    
    if (!parkingWindow) return;
    
    // Clear existing content
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
    
    // Add parking cards
    nearbySpots.forEach(spot => {
        const card = createParkingCard(spot);
        parkingWindow.appendChild(card);
    });
}

// Create parking card element
function createParkingCard(spot) {
    const card = document.createElement('div');
    card.className = 'parking-card';
    card.setAttribute('data-spot-id', spot.id);
    
    const hourlyRate = spot.price === 0 ? 'Free' : `$${spot.price.toFixed(2)}/hour`;
    const dayRateHTML = spot.dayRate ? `Day rate: $${spot.dayRate.toFixed(2)}` : '';
    const earlyBirdHTML = spot.earlyBirdRate ? `<br>Early bird rate: $${spot.earlyBirdRate.toFixed(2)}` : '';
    
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
                    <span>${spot.distance}</span>
                </div>
            </div>
            <div class="parking-address">
                ${spot.address}
            </div>
            ${dayRateHTML || earlyBirdHTML ? `
                <div class="parking-rates">
                    ${dayRateHTML}${earlyBirdHTML}
                </div>
            ` : ''}
        </div>
        <div class="parking-card-footer">
            <button class="btn btn-outline btn-sm" onclick="viewParkingDetails('${spot.id}')">
                View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="bookParkingSpot('${spot.id}', ${spot.price})">
                Book Now
            </button>
        </div>
    `;
    
    // Add click handler to pan to marker
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            const position = new google.maps.LatLng(spot.lat, spot.lng);
            map.panTo(position);
            map.setZoom(17);
            highlightParkingCard(spot.id);
        }
    });
    
    return card;
}

// Highlight parking card
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



// Add parking spots within radius
// Add parking spots within radius (Smart Update)
function addParkingSpotsInRadius(centerLat, centerLng) {
    
    // 1. First, find all spots that SHOULD be visible based on current location
    const validSpotsInRadius = [];
    
    parkingSpots.forEach((spot) => {
        const distance = calculateDistance(centerLat, centerLng, spot.lat, spot.lng);
        
        if (distance <= radiusMeters) {
            spot.distance = formatDistance(distance);
            spot.distanceMeters = distance;
            validSpotsInRadius.push(spot);
        }
    });
    
    // Sort by distance (for the sidebar list)
    validSpotsInRadius.sort((a, b) => a.distanceMeters - b.distanceMeters);
    
    // Update the sidebar list (always update this to show correct distances)
    updateParkingWindow(validSpotsInRadius);
    
    // --- SMART MARKER MANAGEMENT START ---
    
    // 2. Create a Set of valid IDs for fast lookup
    const validSpotIds = new Set(validSpotsInRadius.map(s => s.id));
    
    // 3. REMOVE markers that are no longer in the radius
    // We filter the existing parkingMarkers array
    parkingMarkers = parkingMarkers.filter(marker => {
        const stillVisible = validSpotIds.has(marker.spotData.id);
        
        if (!stillVisible) {
            marker.setMap(null); // Remove from Google Map
            return false;        // Remove from our memory array
        }
        return true; // Keep marker in memory (preserving its position/state)
    });
    
    // 4. ADD only the NEW markers that aren't on the map yet
    // Create a Set of IDs currently on the map
    const existingMarkerIds = new Set(parkingMarkers.map(m => m.spotData.id));
    
    let delayCounter = 0; // Counter to ensure staggering only affects new items
    
    validSpotsInRadius.forEach((spot) => {
        // Only create a marker if it doesn't exist yet
        if (!existingMarkerIds.has(spot.id)) {
            
            // Stagger animation for NEW markers only
            setTimeout(() => {
                // Safety check: ensure we didn't add it in a different thread/event
                if (existingMarkerIds.has(spot.id)) return;

                const marker = new ParkingMarkerOverlay(
                    new google.maps.LatLng(spot.lat, spot.lng),
                    spot.price,
                    spot,
                    map
                );
                
                parkingMarkers.push(marker);
                existingMarkerIds.add(spot.id); // Mark as added
                
            }, delayCounter * 50); // 50ms delay between each new drop
            
            delayCounter++;
        }
    });
    
    // --- SMART MARKER MANAGEMENT END ---
    
    console.log(`Map updated: ${parkingMarkers.length} active markers (${delayCounter} new).`);
}

// Clear parking markers
function clearParkingMarkers() {
    parkingMarkers.forEach(marker => {
        marker.setMap(null);
    });
    parkingMarkers = [];
}

// Initialize Google Map when page loads
function initMap() {
    const defaultCenter = { lat: 43.207079, lng: 76.669139 }; // Almaty, Kazakhstan
    const mapContainer = document.getElementById('google-map');
    
    if (!mapContainer) {
        console.error('Map container not found!');
        return;
    }
    
    // Determine initial theme
    const savedTheme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === 'system' && prefersDark);
    currentMapTheme = isDark ? 'dark' : 'light';
    
    // Create the map with custom options
    map = new google.maps.Map(mapContainer, {
        center: defaultCenter,
        zoom: 14,
        
        // FIX: Remove Ctrl requirement for zoom
        gestureHandling: 'greedy',
        
        // Apply initial theme styles
        styles: isDark ? darkMapStyles : lightMapStyles,
        
        // Clean UI - Remove clutter
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        
        // Control positions
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        },
        fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_TOP
        }
    });
    
    // Initialize autocomplete on search input
    initAutocomplete();
    
    // Initialize "Find Me" button
    initFindMeButton();
    
    // Setup map listeners for dynamic updates
    setupMapListeners();
    
    // Load initial parking spots
    addParkingSpotsInRadius(defaultCenter.lat, defaultCenter.lng);

    console.log('Map initialized successfully with', currentMapTheme, 'theme');
}

// Initialize Places Autocomplete
function initAutocomplete() {
    const searchInput = document.getElementById('map-search');
    
    if (!searchInput) {
        console.error('Search input not found!');
        return;
    }
    
    // Create autocomplete instance
    autocomplete = new google.maps.places.Autocomplete(searchInput, {
        // Bias results to current map bounds
        bounds: map.getBounds(),
        strictBounds: false,
        // You can restrict to specific types: ['geocode', 'establishment']
        types: [] // Empty means all types
    });
    
    // Bind autocomplete to map bounds (updates as map moves)
    autocomplete.bindTo('bounds', map);
    
    // Listen for place selection
    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (!place.geometry || !place.geometry.location) {
            // User entered a name that was not suggested
            console.log("No details available for input: '" + place.name + "'");
            return;
        }
        
        // Clear existing markers
        clearMarkers();
        
        // If the place has a geometry, present it on the map
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
        
        // Add a marker for the selected place
        const marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            animation: google.maps.Animation.DROP,
            title: place.name
        });
        
        markers.push(marker);
        
        // Optional: Show info window with place details
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 8px 0; color: var(--text-primary);">${place.name}</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">${place.formatted_address || ''}</p>
                </div>
            `
        });
        
        infoWindow.open(map, marker);
        
        console.log('Place selected:', place);
    });
}

// Initialize "Find Me" button (geolocation)
function initFindMeButton() {
    const findMeBtn = document.getElementById('find-me-btn');
    
    if (!findMeBtn) return;
    
    findMeBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    userLocation = pos;
                    
                    // Center map on user location
                    map.setCenter(pos);
                    map.setZoom(15);
                    
                    // Clear existing search markers
                    clearMarkers();
                    
                    // Add marker at user location
                    const marker = new google.maps.Marker({
                        position: pos,
                        map: map,
                        animation: google.maps.Animation.DROP,
                        title: 'Your Location',
                        icon: {
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: '#5562E9',
                            fillOpacity: 1,
                            strokeColor: '#ffffff',
                            strokeWeight: 2
                        }
                    });
                    
                    markers.push(marker);
                    
                    // Show nearby parking spots
                    addParkingSpotsInRadius(pos.lat, pos.lng);
                    
                    console.log('User location found:', pos);
                },
                () => {
                    alert('Error: The Geolocation service failed.');
                }
            );
        } else {
            alert('Error: Your browser doesn\'t support geolocation.');
        }
    });
}

// Listen for map movement to update parking spots
function setupMapListeners() {
    let moveTimeout;
    let isZooming = false;
    
    // Detect zoom start
    map.addListener('zoom_changed', () => {
        isZooming = true;
    });
    
    // Map idle event (after pan/zoom complete)
    map.addListener('idle', () => {
        clearTimeout(moveTimeout);
        
        // Only update parking spots after panning (not zooming)
        moveTimeout = setTimeout(() => {
            if (!isZooming) {
                const center = map.getCenter();
                addParkingSpotsInRadius(center.lat(), center.lng());
            }
            isZooming = false;
        }, 500);
    });
    
    // Alternatively, only update on dragend (when user stops panning)
    map.addListener('dragend', () => {
        const center = map.getCenter();
        addParkingSpotsInRadius(center.lat(), center.lng());
    });
}


// Clear all search markers from map (not parking markers)
function clearMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// Function to update map theme dynamically
function updateMapTheme(theme) {
    if (!map) return;
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark);
    const newTheme = shouldBeDark ? 'dark' : 'light';
    
    if (newTheme !== currentMapTheme) {
        currentMapTheme = newTheme;
        map.setOptions({
            styles: shouldBeDark ? darkMapStyles : lightMapStyles
        });
        console.log('Map theme updated to:', newTheme);
    }
}

// Listen for theme changes
window.addEventListener('themeChanged', (event) => {
    updateMapTheme(event.detail.theme);
});

// Also listen for OS theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    if (savedTheme === 'system') {
        updateMapTheme('system');
    }
});

// Book parking spot (called from info window or card)
window.bookParkingSpot = function(spotId, price) {
    console.log('Booking spot:', spotId, 'at price:', price);
    
    // Close info window if open
    if (window.currentParkingInfoWindow) {
        window.currentParkingInfoWindow.close();
    }
    
    // You can open your booking modal here
    // For now, just show an alert
    alert(`Booking parking spot: ${spotId}\nPrice: $${price.toFixed(2)}/hr\n\nThis will open your booking modal.`);
    
    // TODO: Open your actual booking modal
    // const modal = document.getElementById('booking-modal');
    // modal.classList.remove('hidden');
};

// View parking details
window.viewParkingDetails = function(spotId) {
    console.log('Viewing details for:', spotId);
    const spot = parkingSpots.find(s => s.id === spotId);
    if (spot) {
        const position = new google.maps.LatLng(spot.lat, spot.lng);
        map.panTo(position);
        map.setZoom(17);
        highlightParkingCard(spotId);
    }
     if (typeof loadIndoorLayout === 'function') {
        loadIndoorLayout(spotId);
    }
};

// Toggle parking spots visibility
window.toggleParkingSpots = function(show) {
    if (show) {
        const center = map.getCenter();
        addParkingSpotsInRadius(center.lat(), center.lng());
    } else {
        clearParkingMarkers();
        updateParkingWindow([]);
    }
};

// Call initMap when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initMap, 100);
});

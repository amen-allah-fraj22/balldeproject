// assets/js/map-fixed.js
if (typeof L === 'undefined') {
    // This check might run before Leaflet is loaded via script tag.
    // The check within init() is more reliable.
    console.warn('Leaflet library (L) not found at initial script parse. Ensure Leaflet JS is loaded before map-fixed.js, or that init() is called after Leaflet loads.');
}

class FixedMapManager {
    constructor(mapId = 'tunisia-map') {
        this.mapId = mapId;
        this.map = null;
        // Defer initialization to an explicit call to init(),
        // ideally after DOMContentLoaded and when Leaflet is confirmed loaded.
    }

    init() {
        const mapElement = document.getElementById(this.mapId);
        if (!mapElement) {
            console.error(`Map container with id '${this.mapId}' not found.`);
            return;
        }

        if (typeof L === 'undefined') {
            console.error('Leaflet library (L) is still not available at init. Check script loading order and integrity of Leaflet script tag.');
            mapElement.innerHTML = '<p style="color:red; text-align:center;">Map library (Leaflet) failed to load. Please check your internet connection or contact support.</p>';
            return;
        }
        
        // Check if map is already initialized on this element to prevent re-initialization
        if (mapElement._leaflet_id) {
             console.warn("Leaflet map already initialized on this container. Skipping re-initialization.");
             // Optionally, get a reference to the existing map if needed, though this is not standard.
             // this.map = mapElement._leaflet_map; // This is an internal Leaflet property.
             return; 
        }
        // Clear "Loading map..." message
        mapElement.innerHTML = '';

        try {
            this.map = L.map(this.mapId, {
                center: [33.8869, 9.5375], // Geographic center of Tunisia
                zoom: 6, // Start a bit more zoomed out to ensure bounds are respected initially. MaxBounds can be tricky with initial zoom.
                maxZoom: 12, // Increased max zoom for more detail
                minZoom: 6,  // Min zoom to keep Tunisia in focus
                // Stricter bounds for Tunisia. Format: [[south, west], [north, east]]
                maxBounds: [[29.5, 6.5], [38.5, 12.5]] 
            });
            
            // It's good to wait for map to be ready before setting view, especially with maxBounds
             this.map.on('load', () => {
                this.map.setView([33.8869, 9.5375], 7); // Set desired initial view after load
             });


            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                keepBuffer: 2, // Higher value might help with gray areas on fast zoom/pan
                tileSize: 256, // Default is 256
            }).addTo(this.map);

            console.log("Tunisia map initialized successfully.");

            this.loadCorrectBoundaries();

        } catch (error) {
            console.error("Error initializing Leaflet map:", error);
            mapElement.innerHTML = `<p style="color:red; text-align:center;">Could not initialize map: ${error.message}</p>`;
        }
    }

    loadCorrectBoundaries() {
        console.log("Placeholder: loadCorrectBoundaries() called. GeoJSON loading and tooltips to be implemented.");
        
        if (this.map) {
            // Example: Adding a simple marker for Tunis
            L.marker([36.8065, 10.1815]).addTo(this.map) 
                .bindPopup('Tunis - Capital of Tunisia. Future data will show detailed governorate info here.')
                .openPopup(); // Open popup by default for this example
        }
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            console.log("Map instance destroyed.");
            const mapElement = document.getElementById(this.mapId);
            if (mapElement) {
                mapElement.innerHTML = '<p style="text-align:center;">Map has been removed.</p>';
            }
        }
    }
}

// The class FixedMapManager is now defined.
// Initialization will be handled by main.js or another script that runs after DOMContentLoaded.
console.log("map-fixed.js parsed, FixedMapManager class defined.");

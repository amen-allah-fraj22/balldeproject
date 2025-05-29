// assets/js/main.js
console.log("main.js loaded, parsing script.");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed. main.js operations starting.");

    // Initialize map if map container exists on the current page
    const mapContainer = document.getElementById('tunisia-map');
    if (mapContainer) {
        console.log("Map container #tunisia-map found in DOM.");
        // Ensure FixedMapManager class is available
        if (typeof FixedMapManager !== 'undefined') {
            console.log("FixedMapManager class found. Initializing map.");
            const mapManager = new FixedMapManager('tunisia-map');
            mapManager.init(); // This will initialize the Leaflet map
            window.mapManager = mapManager; // Optional: for global access/debugging
        } else {
            console.error("FixedMapManager class not found. Ensure map-fixed.js is loaded before main.js and has no errors.");
            if(mapContainer) { // Double check mapContainer still exists
                mapContainer.innerHTML = '<p style="color:red; text-align:center;">Map manager script (FixedMapManager) failed to load. Please check console.</p>';
            }
        }
    } else {
        console.log("Map container #tunisia-map not found on this page.");
    }

    // Other main.js logic for dashboard interactions can go here
    // For example, setting up event listeners for other dashboard elements, fetching data, etc.
    console.log("Main dashboard script (main.js) has completed its setup routines.");
});

// Example: Listening for auth state changes to potentially update dashboard UI
// This assumes auth.js dispatches this event and is loaded.
document.addEventListener('authStateChanged', (event) => {
    console.log('Auth State Changed Event received in main.js:', event.detail);
    if (event.detail.loggedIn) {
        // Update UI for logged-in user, e.g., personalize dashboard
        const user = event.detail.user;
        console.log(`User ${user.displayName || user.email} is logged in. Personalizing dashboard...`);
        // Example: document.getElementById('user-greeting').textContent = `Hello, ${user.displayName || 'User'}!`;
    } else {
        // Update UI for logged-out user
        console.log("User is logged out. Showing generic dashboard.");
        // Example: document.getElementById('user-greeting').textContent = 'Hello, Guest!';
    }
});

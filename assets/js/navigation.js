// assets/js/navigation.js
class NavigationManager {
    constructor() {
        // this.currentPage = this.getCurrentPage(); // We'll implement this later
        this.initNavigation();
    }

    initNavigation() {
        this.injectNavMenu();
        // this.setupRouting(); // Placeholder for now
        // this.highlightCurrentPage(); // Placeholder for now
    }

    injectNavMenu() {
        const navHTML = `
            <nav class="main-navigation">
                <div class="nav-brand">
                    <a href="/index.html">Tunisia Investment Navigator</a>
                </div>
                <ul class="nav-menu">
                    <li><a href="/index.html">Dashboard</a></li>
                    <li class="dropdown">
                        <a href="#">Sectors ▼</a>
                        <ul class="dropdown-menu">
                            <li><a href="/sectors/agriculture.html">🌾 Agriculture</a></li>
                            <li><a href="/sectors/tourism.html">🏖️ Tourism</a></li>
                            <li><a href="/sectors/manufacturing.html">🏭 Manufacturing</a></li>
                            <li><a href="/sectors/add-sector.html">➕ Add Sector</a></li>
                        </ul>
                    </li>
                    <li><a href="/profile.html">Profile</a></li>
                    <li><a href="#" id="logout-link">Logout</a></li>
                </ul>
            </nav>
        `;
        // Insert the nav as the first child of the body
        document.body.insertAdjacentHTML('afterbegin', navHTML);

        // Add event listener for logout if auth object is available
        // We'll make this more robust when auth.js is implemented
        const logoutLink = document.getElementById('logout-link');
        if (logoutLink) {
            logoutLink.addEventListener('click', (event) => {
                event.preventDefault();
                    if (window.authManager && typeof window.authManager.logout === 'function') {
                        window.authManager.logout();
                } else {
                        console.warn('AuthManager not available or logout function missing.');
                        alert('Logout service is currently unavailable.');
                        // Fallback redirect if authManager is completely missing
                        // window.location.href = '/login.html'; 
                }
            });
        }
    }

    // getCurrentPage() {
    //     // Logic to determine the current page, e.g., from window.location.pathname
    //     // For now, let's return a placeholder or implement basic version
    //     const path = window.location.pathname;
    //     if (path.endsWith('/') || path.endsWith('index.html')) return 'dashboard';
    //     if (path.includes('agriculture')) return 'agriculture';
    //     // ... more pages
    //     return 'unknown';
    // }

    // highlightCurrentPage() {
    //     // Add 'active' class to current page link in nav
    // }
}

// Initialize navigation when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NavigationManager();
});

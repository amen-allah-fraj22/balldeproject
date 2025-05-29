class MapManager {
    constructor() {
        this.map = null;
        this.governorateLayer = null;
        this.currentSector = null;
        this.markers = []; // To store markers if GeoJSON fails
    }

    init() {
        if (this.map) return; // Already initialized

        this.map = L.map('tunisia-map').setView([34.0, 9.0], 6); // Centered on Tunisia
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
        }).addTo(this.map);

        this.loadGovernoratesBoundaries(); // Attempt to load GeoJSON
    }
    
    renderTunisiaMap() { // Called when switching to Tunisia Focus tab
        if (!this.map) this.init();
        // If using markers and they need to be re-rendered or updated:
        if (this.markers.length > 0 && (!this.governorateLayer || !this.map.hasLayer(this.governorateLayer)) ) {
             this.createGovernorateMarkers(window.app.data.governorates, window.app.data.investmentScores);
        }
        // Ensure map is properly sized if its container was hidden
        setTimeout(() => this.map.invalidateSize(), 100);
    }

    async loadGovernoratesBoundaries() {
        try {
            const response = await fetch('data/tunisia-boundaries.geojson');
            if (!response.ok) throw new Error(`GeoJSON fetch failed: ${response.statusText}`);
            const geoData = await response.json();
            
            if (this.governorateLayer) {
                this.map.removeLayer(this.governorateLayer);
            }

            this.governorateLayer = L.geoJSON(geoData, {
                style: (feature) => this.getStyleByScore(this.getScoreForFeature(feature)),
                onEachFeature: (feature, layer) => {
                    layer.on({
                        mouseover: (e) => this.highlightFeature(e),
                        mouseout: (e) => this.resetHighlight(e, feature),
                        click: (e) => this.handleFeatureClick(e, feature)
                    });
                    // Basic popup - can be enhanced
                    const govName = feature.properties.name || feature.properties.NAME_EN || `ID: ${feature.properties.id}`; // Adjust property name as per GeoJSON
                    layer.bindPopup(`${govName}`);
                }
            }).addTo(this.map);
            
            // If markers were previously added, remove them as GeoJSON is now loaded
            this.clearMarkers();
            console.log('GeoJSON boundaries loaded successfully.');

        } catch (error) {
            console.warn('Failed to load governorate GeoJSON boundaries:', error.message);
            console.log('Falling back to governorate markers.');
            if (window.app && window.app.data && window.app.data.governorates) {
                this.createGovernorateMarkers(window.app.data.governorates, window.app.data.investmentScores);
            } else {
                console.error('Cannot create markers: governorate data not available on window.app.data');
            }
        }
    }
    
    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    createGovernorateMarkers(governoratesData, investmentScoresData) {
        if (!governoratesData || !governoratesData.governorates) {
            console.error('Governorate data for markers is missing or malformed.');
            return;
        }
        this.clearMarkers(); // Clear any existing markers first

        governoratesData.governorates.forEach(gov => {
            if (!gov.coordinates || gov.coordinates.length !== 2) {
                console.warn(`Skipping governorate ${gov.name} due to missing or invalid coordinates.`);
                return;
            }
            
            let score = 50; // Default score
            if (this.currentSector && investmentScoresData) {
                 const govScores = investmentScoresData.governorate_scores.find(s => s.governorate_id === gov.id);
                 if (govScores && govScores.sectors[this.currentSector]) {
                     score = govScores.sectors[this.currentSector].total_score;
                 }
            }

            const marker = L.circleMarker([gov.coordinates[0], gov.coordinates[1]], {
                radius: 8,
                fillColor: this.getColorByScore(score),
                color: '#fff', // White border for marker
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8,
                customId: gov.id // Store id for later reference
            }).addTo(this.map);
            
            marker.bindPopup(`
                <div class="popup-content">
                    <h4>${gov.name}</h4>
                    <p><strong>Score (${this.currentSector || 'Overall'}):</strong> ${score}/100</p>
                    <button class="popup-details-btn" data-id="${gov.id}">View Details</button>
                </div>
            `);
            // Add event listener for the button within the popup
            marker.on('popupopen', () => {
                const btn = document.querySelector(`.popup-details-btn[data-id="${gov.id}"]`);
                if (btn) {
                    btn.addEventListener('click', () => {
                        if(window.app && typeof window.app.showGovernorateModal === 'function') {
                            window.app.showGovernorateModal(gov.id);
                        }
                    });
                }
            });
            this.markers.push(marker);
        });
        console.log(`${this.markers.length} governorate markers created.`);
    }
    
    getScoreForFeature(feature) {
        // This function depends on how IDs are stored in your GeoJSON (e.g., feature.properties.id)
        // And how they match IDs in your investmentScores data.
        const govId = feature.properties.id || feature.properties.ID || feature.properties.gov_id; // Adjust based on your GeoJSON
        if (!govId || !this.currentSector || !window.app.data.investmentScores) return 0; // Default score if no ID or sector

        const scores = window.app.data.investmentScores.governorate_scores.find(s => s.governorate_id === parseInt(govId));
        if (scores && scores.sectors[this.currentSector]) {
            return scores.sectors[this.currentSector].total_score;
        }
        return 0; // Default if no score found
    }

    updateMapBySector(sector, investmentScores, governoratesData) {
        this.currentSector = sector;
        if (this.governorateLayer && this.map.hasLayer(this.governorateLayer)) {
            this.governorateLayer.eachLayer(layer => {
                const score = this.getScoreForFeature(layer.feature);
                layer.setStyle(this.getStyleByScore(score));
            });
             console.log(`GeoJSON layer updated for sector: ${sector}`);
        } else if (this.markers.length > 0) {
            // If using markers, recreate them or update their styles
            this.createGovernorateMarkers(governoratesData, investmentScores);
             console.log(`Markers updated for sector: ${sector}`);
        } else {
            console.warn("Map layer or markers not available for sector update.");
        }
    }

    getColorByScore(score) {
        if (score === undefined || score === null) return '#888888'; // Default grey for no score
        if (score >= 80) return '#16a34a'; // Green (High)
        if (score >= 60) return '#d97706'; // Orange (Medium)
        return '#dc2626'; // Red (Low)
    }

    getStyleByScore(score) {
        return {
            weight: 1.5,
            opacity: 1,
            color: 'white', // White border for polygons
            dashArray: '3',
            fillOpacity: 0.7,
            fillColor: this.getColorByScore(score)
        };
    }

    highlightFeature(e) {
        const layer = e.target;
        layer.setStyle({
            weight: 3,
            color: '#666', // Darker border on hover
            dashArray: '',
            fillOpacity: 0.85
        });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
    }

    resetHighlight(e, feature) {
         if (this.governorateLayer) {
            // For GeoJSON layer, reset to style based on score
            const score = this.getScoreForFeature(feature);
            this.governorateLayer.resetStyle(e.target); // resetStyle needs the event target
            // e.target.setStyle(this.getStyleByScore(score)); // Or manually reset
         }
    }
    
    handleFeatureClick(e, feature) {
        const govId = feature.properties.id || feature.properties.ID || feature.properties.gov_id; // Adjust as per your GeoJSON
        if (govId && window.app && typeof window.app.showGovernorateModal === 'function') {
            window.app.showGovernorateModal(parseInt(govId));
        } else {
            console.warn('Could not show modal for feature:', feature);
        }
    }

    findMarkerByGovernorate(governorateId) { // Used if relying on markers
        return this.markers.find(marker => marker.options.customId === governorateId);
    }
}

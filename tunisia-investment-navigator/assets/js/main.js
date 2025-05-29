class TunisiaInvestmentNavigator {
    constructor() {
        this.currentView = 'global';
        this.selectedSector = null;
        this.data = null;
        this.charts = new ChartManager();
        this.map = new MapManager();
        this.advisor = new InvestmentAdvisor();
        
        this.init();
    }

    async init() {
        try {
            // Load all datasets
            this.data = await DataManager.loadAllData();
            
            // Initialize components
            this.setupEventListeners();
            this.charts.init(this.data);
            this.map.init(); // This will also attempt to load boundaries or create markers
            
            // Show initial view
            this.showGlobalDashboard();
            
            console.log('Tunisia Investment Navigator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to load application data');
        }
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('global-view').addEventListener('click', () => this.showGlobalDashboard());
        document.getElementById('tunisia-focus').addEventListener('click', () => this.showTunisiaFocus());
        document.getElementById('sector-analysis').addEventListener('click', () => this.showSectorAnalysis());
        
        // Sector buttons
        document.getElementById('agriculture-btn').addEventListener('click', () => this.selectSector('agriculture'));
        document.getElementById('tourism-btn').addEventListener('click', () => this.selectSector('tourism'));
        document.getElementById('manufacturing-btn').addEventListener('click', () => this.selectSector('manufacturing'));

        // Modal close button
        const modal = document.getElementById('governorate-modal');
        const closeBtn = document.querySelector('.modal .close');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
        }
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }

    showGlobalDashboard() {
        this.currentView = 'global';
        this.updateActiveSection('global-dashboard');
        if (this.data && this.data.globalData) {
            this.charts.renderGlobalCharts();
            this.displayTunisiaHighlights();
        } else {
            console.warn('Global data not available for global dashboard.');
            this.showError('Global data is missing.');
        }
    }

    showTunisiaFocus() {
        this.currentView = 'tunisia';
        this.updateActiveSection('tunisia-dashboard');
        if (this.data && this.data.governorates) {
            this.map.renderTunisiaMap(); // Assumes map is initialized
        } else {
            console.warn('Governorate data not available for Tunisia focus.');
             this.showError('Governorate data is missing.');
        }
    }

    updateActiveSection(sectionId) {
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        if (sectionId === 'global-dashboard') {
            document.getElementById('global-view').classList.add('active');
        } else if (sectionId === 'tunisia-dashboard') {
            document.getElementById('tunisia-focus').classList.add('active');
        } else if (sectionId === 'sector-analysis-dashboard') { // Add this condition
            document.getElementById('sector-analysis').classList.add('active');
        }
    }

    showSectorAnalysis() {
        this.currentView = 'sector'; // Or any appropriate view name
        this.updateActiveSection('sector-analysis-dashboard');
        // Placeholder for now:
        console.log('Sector Analysis view activated');
        // Later, you might want to render specific charts or data here
        // For example: if (this.data) this.charts.renderSectorCharts();
    }
    
    displayTunisiaHighlights() {
        const metricsPanel = document.getElementById('tunisia-metrics');
        if (!this.data || !this.data.globalData) {
            metricsPanel.innerHTML = '<p>Tunisia data not available.</p>';
            return;
        }
        const tunisiaData = DataManager.getTunisiaData(this.data.globalData);
        // Assuming data is for the latest available year or an aggregate
        const latestData = tunisiaData.sort((a,b) => parseInt(b.Year) - parseInt(a.Year))[0] || {};
        
        metricsPanel.innerHTML = `
            <div><strong>Latest Inflation (Headline):</strong> ${latestData['Headline Consumer Price Inflation'] || 'N/A'}%</div>
            <div><strong>Latest GDP per Capita:</strong> $${parseFloat(latestData['GDP per Capita']).toLocaleString() || 'N/A'}</div>
            <div><strong>Latest Happiness Score:</strong> ${latestData['Score'] || 'N/A'}</div>
        `;
    }

    selectSector(sector) {
        this.selectedSector = sector;
        console.log(`Sector selected: ${sector}`);
        if (this.data && this.data.governorates && this.data.sectors && this.data.investmentScores) {
            this.map.updateMapBySector(sector, this.data.investmentScores, this.data.governorates);
            this.advisor.generateRecommendations(sector, this.data.governorates, this.data.sectors, this.data.investmentScores);
            this.updateSectorButton(sector);
        } else {
            console.error('Data not fully loaded for sector selection.');
            this.showError('Cannot select sector, data missing.');
        }
    }

    updateSectorButton(activeSector) {
        document.querySelectorAll('.sector-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.id === `${activeSector}-btn`) {
                btn.classList.add('active');
            }
        });
    }
    
    showGovernorateModal(governorateId) {
        const modal = document.getElementById('governorate-modal');
        const detailsContainer = document.getElementById('governorate-details');
        
        const govData = this.data.governorates.governorates.find(g => g.id === governorateId);
        if (!govData) {
            detailsContainer.innerHTML = '<p>Governorate data not found.</p>';
            modal.style.display = 'block';
            return;
        }

        let sectorDetailsHtml = '<p>Select a sector to see specific data.</p>';
        if (this.selectedSector && this.data.sectors[this.selectedSector]) {
            const sectorGovData = this.data.sectors[this.selectedSector].governorates.find(g => g.governorate_id === governorateId);
            if (sectorGovData) {
                sectorDetailsHtml = '<ul>';
                for (const [key, value] of Object.entries(sectorGovData)) {
                    if (key !== 'governorate_id' && key !== 'name') {
                        sectorDetailsHtml += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${Array.isArray(value) ? value.join(', ') : value}</li>`;
                    }
                }
                sectorDetailsHtml += '</ul>';
            } else {
                sectorDetailsHtml = `<p>No specific data for ${this.selectedSector} in this governorate.</p>`;
            }
        }
        
        detailsContainer.innerHTML = `
            <h4>${govData.name} (${govData.name_ar})</h4>
            <p><strong>Region:</strong> ${govData.region}</p>
            <p><strong>Population:</strong> ${govData.population.toLocaleString()}</p>
            <p><strong>Area:</strong> ${govData.area_km2.toLocaleString()} km²</p>
            <p><strong>Capital:</strong> ${govData.capital}</p>
            <p><strong>Coastal Access:</strong> ${govData.coastalAccess ? 'Yes' : 'No'}</p>
            <p><strong>Unemployment Rate:</strong> ${govData.unemployment_rate}%</p>
            <p><strong>Youth Unemployment:</strong> ${govData.youth_unemployment}%</p>
            <p><strong>Population Density:</strong> ${govData.population_density} / km²</p>
            <p><strong>Urban Percentage:</strong> ${govData.urban_percentage}%</p>
            <hr>
            <h5>Sector Details (${this.selectedSector ? this.selectedSector.charAt(0).toUpperCase() + this.selectedSector.slice(1) : 'N/A'})</h5>
            ${sectorDetailsHtml}
        `;
        modal.style.display = 'block';
    }

    showError(message) {
        // Simple error display, could be a modal or a banner
        alert(`Error: ${message}`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TunisiaInvestmentNavigator();
});

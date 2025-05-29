# Tunisia Investment Navigator

This project is an interactive web dashboard designed to transform economic data into actionable investment recommendations for Tunisia's 24 governorates.

## Project Overview
- **Name:** Tunisia Investment Navigator
- **Type:** Interactive Web Dashboard
- **Purpose:** Provide investment insights based on economic and sectoral data for Tunisian governorates.
- **Technology Stack:** HTML5, CSS3, Vanilla JavaScript, Chart.js, Leaflet Maps

## Project Structure
The project follows this structure:
```
tunisia-investment-navigator/
├── index.html                 # Main dashboard page
├── assets/
│   ├── css/
│   │   ├── styles.css        # Main styles
│   │   └── dashboard.css     # Dashboard-specific styles
│   ├── js/
│   │   ├── main.js           # Core application logic
│   │   ├── charts.js         # Chart functionality
│   │   ├── map.js            # Tunisia map integration
│   │   ├── advisor.js        # Investment advisory engine
│   │   └── data-manager.js   # Data processing utilities
│   └── images/
│       └── tunisia-map.svg   # Placeholder for Tunisia governorate map
├── data/
│   ├── WHI_Inflation.csv     # Global economic indicators (2015-2023)
│   ├── tunisia-governorates.json  # Governorate boundaries & data
│   ├── sector-data.json      # Agriculture, Tourism, Manufacturing data
│   └── investment-metrics.json    # Calculated investment scores
└── README.md
```

## Setup and Usage
1. Clone the repository.
2. Open the `index.html` file in a modern web browser.
   (Ensure you are serving the files from a local web server if you encounter issues with fetching local data files due to browser security policies for `file:///` URLs. Many IDEs or simple command-line tools like `python -m http.server` can do this.)

## Data Sources
- `WHI_Inflation.csv`: Provided dataset with global economic indicators.
- `tunisia-governorates.json`: Generated data for Tunisia's governorates.
- `sector-data.json`: Generated data for key economic sectors in Tunisia.
- `investment-metrics.json`: Pre-calculated (sample) investment scores.
- `tunisia-boundaries.geojson` (optional): For detailed map polygons. If not present, the map will use markers.

This project is currently under development.

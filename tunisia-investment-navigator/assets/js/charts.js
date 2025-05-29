class ChartManager {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#2563eb', // blue-600
            secondary: '#dc2626', // red-600
            success: '#16a34a', // green-600
            warning: '#d97706', // amber-600
            tunisia: '#dc2626', // Explicitly Tunisia Red
            gray: '#6b7280', // gray-500
            defaultOther: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'] // Various colors
        };
    }

    init(data) {
        this.data = data;
    }

    getColorByIndex(index, isTunisia = false) {
        if (isTunisia) return this.colors.tunisia;
        return this.colors.defaultOther[index % this.colors.defaultOther.length];
    }

    renderGlobalCharts() {
        if (this.charts.inflationChart) this.charts.inflationChart.destroy();
        if (this.charts.happinessChart) this.charts.happinessChart.destroy();
        
        this.renderInflationChart();
        this.renderHappinessGDPChart();
    }

    renderInflationChart() {
        const ctx = document.getElementById('global-inflation-chart');
        if (!ctx) { console.error('global-inflation-chart canvas not found'); return; }

        // Process data for multiple countries including Tunisia
        const selectedCountries = ['Tunisia', 'Morocco', 'Egypt', 'France', 'Germany']; // Example countries
        const datasets = selectedCountries.map((country, index) => {
            const countryData = this.data.globalData.filter(row => row.Country === country && row['Headline Consumer Price Inflation'] !== undefined && row.Year !== undefined);
            return {
                label: country,
                data: countryData.map(row => ({
                    x: parseInt(row.Year),
                    y: parseFloat(row['Headline Consumer Price Inflation'])
                })).sort((a,b) => a.x - b.x), // Ensure data is sorted by year
                borderColor: this.getColorByIndex(index, country === 'Tunisia'),
                backgroundColor: this.getColorByIndex(index, country === 'Tunisia') + '33', // Add some transparency
                borderWidth: country === 'Tunisia' ? 3 : 2,
                tension: 0.1
            };
        });

        this.charts.inflationChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear', // Years are linear
                        position: 'bottom',
                        title: { display: true, text: 'Year' },
                        ticks: { 
                            stepSize: 1,
                            callback: function(value) { return Number.isInteger(value) ? value : null; }
                        }
                    },
                    y: {
                        title: { display: true, text: 'Inflation Rate (%)' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Inflation Trends Comparison (2015-2023)'
                    },
                    legend: { display: true, position: 'top' }
                }
            }
        });
    }

    renderHappinessGDPChart() {
        const ctx = document.getElementById('happiness-gdp-chart');
        if (!ctx) { console.error('happiness-gdp-chart canvas not found'); return; }

        const scatterData = this.data.globalData.map(row => ({
            x: parseFloat(row['GDP per Capita']),
            y: parseFloat(row.Score),
            country: row.Country,
            // Assuming data is for a single representative year or averaged.
            // If multiple years, chart might get too busy or need year filter.
            // For simplicity, let's assume the CSV provides data points suitable for scatter.
            // The spec shows 'Year' in tooltip, so let's use the latest year for each country if multiple.
            year: row.Year 
        })).filter(point => !isNaN(point.x) && !isNaN(point.y) && point.x > 0 && point.y > 0);


        // If there are multiple years per country, we might want to average or pick latest.
        // For this example, we'll plot all points, which might be dense.
        // A better approach for multi-year data might be to average per country or pick a specific year.
        // The provided spec seems to imply plotting all available points.

        const tunisiaData = scatterData.filter(point => point.country === 'Tunisia');
        const otherData = scatterData.filter(point => point.country !== 'Tunisia');

        this.charts.happinessChart = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [
                    {
                        label: 'Other Countries',
                        data: otherData,
                        backgroundColor: this.colors.primary + '99', // primary with some opacity
                        borderColor: this.colors.primary,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Tunisia',
                        data: tunisiaData,
                        backgroundColor: this.colors.tunisia, // Tunisia red
                        borderColor: this.colors.tunisia,
                        pointRadius: 7,
                        pointHoverRadius: 9,
                        pointBorderWidth: 1,
                        pointBorderColor: '#fff'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'logarithmic', // GDP per capita often better on log scale
                        title: { display: true, text: 'GDP per Capita (USD, log scale)' }
                    },
                    y: {
                        title: { display: true, text: 'Happiness Score' },
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Happiness vs GDP per Capita (Log Scale)'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const point = context.raw;
                                return `${point.country} (${point.year || 'N/A'}): GDP $${point.x.toLocaleString()}, Happiness ${point.y.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}

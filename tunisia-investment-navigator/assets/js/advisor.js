class InvestmentAdvisor {
    constructor() {
        // No specific constructor needs for now, data passed in methods
    }

    generateRecommendations(sector, governoratesData, sectorsData, investmentScoresData) {
        if (!governoratesData || !sectorsData || !investmentScoresData || !sector) {
            this.displayError("Required data for recommendations is missing.");
            return;
        }
        
        const scoresWithDetails = this.calculateSectorScores(sector, governoratesData, sectorsData, investmentScoresData);
        const topGovernorates = this.getTopRecommendations(scoresWithDetails, 3);
        
        this.displayRecommendations(sector, topGovernorates, sectorsData);
    }

    calculateSectorScores(sector, governoratesData, sectorsData, investmentScoresData) {
        if (!governoratesData.governorates || !sectorsData[sector] || !investmentScoresData.governorate_scores) {
             console.error("Data missing for calculating sector scores", {governoratesData, sectorsData, investmentScoresData});
             return [];
        }

        return governoratesData.governorates.map(gov => {
            const govScores = investmentScoresData.governorate_scores.find(s => s.governorate_id === gov.id);
            let score = 0;
            let strengths = [], challenges = [], opportunities = [], components = {};

            if (govScores && govScores.sectors[sector]) {
                const sectorScoreDetails = govScores.sectors[sector];
                score = sectorScoreDetails.total_score || 0;
                strengths = sectorScoreDetails.strengths || [];
                challenges = sectorScoreDetails.challenges || [];
                opportunities = sectorScoreDetails.opportunities || [];
                components = sectorScoreDetails.components || {};
            } else {
                // Fallback or dynamic calculation if needed, but spec implies pre-calculated
                // For now, if not in investment-metrics.json, score is 0 or very basic
                console.warn(`No pre-calculated score for ${gov.name} in ${sector}. Using default score 0.`);
            }
            
            // Include general governorate data and specific sector data
            const sectorSpecificGovData = sectorsData[sector].governorates.find(s => s.governorate_id === gov.id) || {};

            return {
                ...gov, // general data like name, population, etc.
                score,
                strengths,
                challenges,
                opportunities,
                components, // score breakdown
                sectorData: sectorSpecificGovData // raw data for the sector in this governorate
            };
        }).sort((a, b) => b.score - a.score); // Sort by score descending
    }

    // calculateScore method was in the original spec under InvestmentAdvisor,
    // but investment-metrics.json is meant to be pre-calculated.
    // If dynamic calculation is needed, it would be complex and based on DataManager's similar method.
    // For now, we rely on scores from investment-metrics.json via calculateSectorScores.

    getTopRecommendations(scores, count) {
        return scores.slice(0, count);
    }

    displayRecommendations(sector, topGovernorates, sectorsData) {
        const container = document.getElementById('recommendations-content');
        if (!container) {
            console.error('Recommendations container not found.');
            return;
        }

        if (topGovernorates.length === 0) {
            container.innerHTML = `<p>No specific recommendations available for ${sector} at this time. Scores might be missing or too low.</p>`;
            return;
        }
        
        const html = `
            <div class="sector-recommendations">
                <h4>🎯 Top Investment Opportunities - ${sector.charAt(0).toUpperCase() + sector.slice(1)}</h4>
                ${topGovernorates.map((gov, index) => `
                    <div class="recommendation-card ${index === 0 ? 'top-choice' : ''}">
                        <div class="card-header">
                            <h5>${index + 1}. ${gov.name}</h5>
                            <span class="score-badge">${gov.score}/100</span>
                        </div>
                        <div class="card-content">
                            <p><strong>Population:</strong> ${gov.population ? gov.population.toLocaleString() : 'N/A'}</p>
                            <p><strong>Unemployment:</strong> ${gov.unemployment_rate || 'N/A'}%</p>
                            ${this.getSectorSpecificInfoHTML(gov, sector, sectorsData)}
                            ${gov.strengths && gov.strengths.length > 0 ? `
                                <div class="details-section">
                                    <strong>Strengths:</strong>
                                    <ul>${gov.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                                </div>` : ''}
                            ${gov.opportunities && gov.opportunities.length > 0 ? `
                                <div class="details-section">
                                    <strong>Opportunities:</strong>
                                    <ul>${gov.opportunities.map(o => `<li>${o}</li>`).join('')}</ul>
                                </div>` : ''}
                            ${gov.challenges && gov.challenges.length > 0 ? `
                                <div class="details-section">
                                    <strong>Challenges:</strong>
                                    <ul>${gov.challenges.map(c => `<li>${c}</li>`).join('')}</ul>
                                </div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    }

    getSectorSpecificInfoHTML(governorate, sector, sectorsData) {
        // This method should pull relevant display data from governorate.sectorData
        // (which is populated in calculateSectorScores)
        const secData = governorate.sectorData;
        if (!secData || Object.keys(secData).length === 0) return '<p>No detailed sector data available.</p>';

        let infoHtml = '<p><strong>Sector Highlights:</strong></p><ul>';
        switch(sector) {
            case 'agriculture':
                infoHtml += `<li>Arable Land: ${secData.arable_land_percentage || 'N/A'}%</li>`;
                infoHtml += `<li>Main Crops: ${(secData.main_crops || []).join(', ') || 'N/A'}</li>`;
                infoHtml += `<li>Water Availability: ${secData.water_availability_score || 'N/A'}/10</li>`;
                break;
            case 'tourism':
                infoHtml += `<li>Hotel Capacity: ${secData.hotel_capacity ? secData.hotel_capacity.toLocaleString() : 'N/A'} beds</li>`;
                infoHtml += `<li>Annual Visitors: ${secData.annual_visitors ? secData.annual_visitors.toLocaleString() : 'N/A'}</li>`;
                infoHtml += `<li>Cultural Sites: ${secData.cultural_sites || 'N/A'}</li>`;
                break;
            case 'manufacturing':
                infoHtml += `<li>Industrial Zones: ${secData.industrial_zones || 'N/A'}</li>`;
                infoHtml += `<li>Skilled Labor: ${secData.skilled_labor_percentage || 'N/A'}%</li>`;
                infoHtml += `<li>Export Infrastructure: ${secData.export_infrastructure || 'N/A'}/10</li>`;
                break;
            default:
                return '<p>Sector details not specified.</p>';
        }
        infoHtml += '</ul>';
        return infoHtml;
    }
    
    displayError(message) {
        const container = document.getElementById('recommendations-content');
        if (container) {
            container.innerHTML = `<p class="error-message">${message}</p>`;
        }
        console.error(message);
    }
}

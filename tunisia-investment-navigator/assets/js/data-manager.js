class DataManager {
    static async loadAllData() {
        try {
            const datasets = await Promise.all([
                this.loadCSV('data/WHI_Inflation.csv'),
                this.loadJSON('data/tunisia-governorates.json'),
                this.loadJSON('data/sector-data.json'),
                this.loadJSON('data/investment-metrics.json')
            ]);

            return {
                globalData: datasets[0],
                governorates: datasets[1],
                sectors: datasets[2],
                investmentScores: datasets[3]
            };
        } catch (error) {
            console.error("Error loading data:", error);
            throw new Error("One or more datasets failed to load. Check paths and network.");
        }
    }

    static async loadCSV(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch CSV: ${url} - ${response.statusText}`);
        const text = await response.text();
        return this.parseCSV(text);
    }

    static async loadJSON(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch JSON: ${url} - ${response.statusText}`);
        return await response.json();
    }

    static parseCSV(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line);
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                // Handle commas within quoted fields
                const values = [];
                let currentVal = '';
                let inQuotes = false;
                for (const char of lines[i]) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        values.push(currentVal.trim());
                        currentVal = '';
                    } else {
                        currentVal += char;
                    }
                }
                values.push(currentVal.trim()); // add the last value

                if (values.length === headers.length) {
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index]?.trim().replace(/^"|"$/g, ''); // Remove surrounding quotes if any
                    });
                    data.push(row);
                } else {
                    console.warn(`Skipping malformed CSV line ${i+1}: Expected ${headers.length} values, got ${values.length}. Line: "${lines[i]}"`);
                }
            }
        }
        return data;
    }

    static getTunisiaData(globalData) {
        if (!globalData || !Array.isArray(globalData)) return [];
        return globalData.filter(row => row.Country === 'Tunisia');
    }

    // This function is defined in the spec but seems to be intended for use by the InvestmentAdvisor
    // or for dynamic calculation if investment-metrics.json wasn't pre-calculated.
    // For now, it's here as per spec.
    static calculateInvestmentScore(governorate, sector, sectorData, allGovernorateData, investmentScoresDef) {
        const weights = investmentScoresDef.scoring_methodology.weights;
        // This is a placeholder. The actual scoring logic would be complex and
        // require detailed metrics from governorate, sectorData, etc.
        // The pre-calculated investment-metrics.json is likely the primary source for scores.
        // If dynamic calculation is needed, this method would need to be significantly built out.
        
        // Example: find pre-calculated score if available
        const govScores = investmentScoresDef.governorate_scores.find(gs => gs.governorate_id === governorate.id);
        if (govScores && govScores.sectors[sector]) {
            return govScores.sectors[sector].total_score;
        }

        // Fallback to a generic calculation if needed (simplified)
        let totalScore = 0;
        let componentCount = 0;
        for (const component in weights) {
            // Dummy component score - replace with actual logic
            const componentScore = Math.random() * 30 + 50; // Random score between 50-80
            totalScore += componentScore * weights[component];
            componentCount++;
        }
        
        return componentCount > 0 ? Math.round(totalScore) : 50; // Default score if no components
    }
}

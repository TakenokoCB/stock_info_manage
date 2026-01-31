import { PortfolioAsset, DividendEntry } from '../../data/types';

// Mock Dividend Yield Database
const DIVIDEND_DATA: Record<string, { yield: number; months: number[] }> = {
    // Domestic Stocks
    '3769': { yield: 0.8, months: [6, 12] }, // GMOPG
    '2730': { yield: 2.8, months: [3, 9] },  // Edion
    '4661': { yield: 0.5, months: [3, 9] },  // OLC
    '4755': { yield: 0.0, months: [] },      // Rakuten
    '9432': { yield: 3.2, months: [6, 12] }, // NTT
    '7203': { yield: 3.5, months: [5, 11] }, // Toyota (sample)

    // Foreign Stocks (Yield in %)
    'AAPL': { yield: 0.5, months: [2, 5, 8, 11] },
    'ASML': { yield: 0.7, months: [5, 11] }, // Simulating semi-annual for simplicity
    'GOOGL': { yield: 0.0, months: [] }, // No div
    'MSFT': { yield: 0.7, months: [3, 6, 9, 12] },
    'NVDA': { yield: 0.03, months: [3, 6, 9, 12] },
    'TSLA': { yield: 0.0, months: [] },
    'EDV': { yield: 4.2, months: [3, 6, 9, 12] },
    'EC': { yield: 8.5, months: [4, 12] }, // Ecopetrol high yield irregular

    // Trusts (Reinvest usually 0, but simulating "internal accumulation" or just 0)
    // User requested "get dividend of holdings".
    // Most trusts in portfolio are "reinvest", so technically distributable income is 0.
    // However, for visualization, we might return 0 or small "reinvested" amount if desired.
    // Given the prompt "doesn't have dividend displayed", I'll assume they want to see income items.
    // Only 'receive' type trusts would payout.
    // Currently all defined as 'reinvest'.
    // I will return 0 for reinvest types but keep logic extensible.
    // 'eMAXIS ...' -> 0

    // Crypto
    'BTC': { yield: 0, months: [] }, // Staking logic could be here if using lending, but defaulting 0
    'ETH': { yield: 3.5, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }, // Staking example
};

export async function fetchDividendData(assets: PortfolioAsset[]): Promise<DividendEntry[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const monthlyData: Record<number, DividendEntry> = {};

    // Initialize months 1-12
    for (let i = 1; i <= 12; i++) {
        monthlyData[i] = {
            month: `${i}月`,
            stocks: 0,
            staking: 0,
            total: 0,
            breakdown: []
        };
    }

    assets.forEach(asset => {
        let key = '';
        let type: 'stock' | 'staking' = 'stock';

        if (asset.type === 'domestic_stock') key = asset.code;
        else if (asset.type === 'foreign_stock') key = asset.ticker;
        else if (asset.type === 'crypto') {
            key = asset.symbol;
            type = 'staking';
        }

        const info = DIVIDEND_DATA[key];
        if (info && info.yield > 0) {
            // Calculate annual dividend
            const marketValue = asset.marketValue; // JPY
            const annualDividend = marketValue * (info.yield / 100);
            const perPayment = annualDividend / info.months.length;

            info.months.forEach(month => {
                const entry = monthlyData[month];
                entry[type === 'stock' ? 'stocks' : 'staking'] += perPayment;
                entry.total += perPayment;
                entry.breakdown?.push({
                    name: asset.name,
                    value: perPayment,
                    type
                });
            });
        }
    });

    // Convert to array starting from current month? Or just 1-12.
    // Usually calendar starts from next month or Jan.
    // Let's return 1-12 sorted.
    // But typical UI shows "next 12 months".
    // I will return simplified 1-12 Array for now, rotating if needed by UI.
    // But `DividendCalendar` takes just array.

    // Sort logic: 1, 2, ... 12
    // If we want "Next 12 Months", we should rotate.
    // For simplicity, fixed Jan-Dec is often easier to read unless rolling.
    // Original mock was Feb-Jan. Let's do a rolling 12 month starting current month + 1.

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const result: DividendEntry[] = [];

    for (let i = 0; i < 12; i++) {
        let m = currentMonth + i;
        if (m > 12) m -= 12;
        result.push(monthlyData[m]);
    }

    return result;
}

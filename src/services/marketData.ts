import {
    StoredPortfolioAsset,
    PortfolioAsset,
    StoredDomesticStock,
    StoredForeignStock,
    StoredInvestmentTrust,
    StoredCrypto,
    StoredBond,
    DomesticStock,
    ForeignStock,
    InvestmentTrust,
    Crypto,
    Bond
} from '../../data/types';

// Mock Exchange Rate
const USD_JPY = 153.5;

/**
 * Fetch market data for a list of stored assets.
 * In a real application, this would call an API (e.g. Yahoo Finance, Alpha Vantage).
 * Currently, it simulates a network request and returns mock updated prices.
 */
export async function fetchMarketData(storedAssets: StoredPortfolioAsset[]): Promise<PortfolioAsset[]> {
    // Simulate network latency (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    return storedAssets.map(asset => {
        return hydrateAsset(asset);
    });
}

export function hydrateAsset(asset: StoredPortfolioAsset): PortfolioAsset {
    // Random fluctuation factor (0.98 - 1.02)
    // To keep it somewhat consistent with previous mock data, we base basePrice on avgPrice * profitFactor
    // But simplistic approach: use stored avgPrice and add some profit.
    // However, some assets had specific prices.

    // We will use a consistent seed-based random or just hardcode some target prices 
    // to match the screenshot "roughly", then add noise.

    switch (asset.type) {
        case 'domestic_stock':
            return hydrateDomesticStock(asset);
        case 'foreign_stock':
            return hydrateForeignStock(asset);
        case 'investment_trust':
            return hydrateInvestmentTrust(asset);
        case 'crypto':
            return hydrateCrypto(asset);
        case 'bond':
            return hydrateBond(asset);
        default:
            throw new Error('Unknown asset type');
    }
}

function getBasePrice(codeOrName: string, avgPrice: number, type: string): number {
    // Return a rough "current price" based on known assets to match UI
    // If unknown, return avgPrice * 1.1 (10% profit)
    const targets: Record<string, number> = {
        '3769': 8936, // GMOPG
        '2730': 2117, // Edion
        '4661': 2709, // OLC
        '4755': 925,  // Rakuten
        '9432': 155,  // NTT
        'AAPL': 260,
        'ASML': 1420,
        'GOOGL': 338,
        'MSFT': 430,
        'NVDA': 191,
        'TSLA': 430,
        'EDV': 65,
        'EC': 12.5,
        'BTC': 15000000,
        // Trusts
        'eMAXIS Slim 全世界株式（オール・カントリー）': 33700,
        '楽天・プラス・オールカントリー株式インデックス・ファンド': 17400,
    };

    let target = targets[codeOrName];
    if (!target && type === 'investment_trust') target = avgPrice * 1.25; // 25% profit generic
    if (!target) target = avgPrice * 1.05;

    // Add random noise (+/- 1%)
    return target * (0.99 + Math.random() * 0.02);
}

function hydrateDomesticStock(asset: StoredDomesticStock): DomesticStock {
    const currentPrice = getBasePrice(asset.code, asset.avgPrice, 'domestic_stock');
    const acquisitionCost = asset.quantity * asset.avgPrice;
    const marketValue = currentPrice * asset.quantity;
    const profitLoss = marketValue - acquisitionCost;
    const profitLossPercent = acquisitionCost > 0 ? (profitLoss / acquisitionCost) * 100 : 0;

    return {
        ...asset,
        currentPrice,
        marketValue,
        profitLoss,
        profitLossPercent
    };
}

function hydrateForeignStock(asset: StoredForeignStock): ForeignStock {
    const currentPriceUsd = getBasePrice(asset.ticker, asset.avgPriceUsd, 'foreign_stock');
    const marketValueUsd = currentPriceUsd * asset.quantity;
    const marketValueJpy = marketValueUsd * USD_JPY;

    // Profit Loss calculation
    const historicRate = 145; // Assumed
    const acquisitionCostJpy = asset.quantity * asset.avgPriceUsd * historicRate;

    const profitLossUsd = (currentPriceUsd - asset.avgPriceUsd) * asset.quantity;
    const profitLossJpy = marketValueJpy - acquisitionCostJpy;

    return {
        ...asset,
        currentPriceUsd,
        marketValueUsd,
        marketValueJpy,
        marketValue: marketValueJpy,
        profitLossUsd,
        profitLossJpy
    };
}

function hydrateInvestmentTrust(asset: StoredInvestmentTrust): InvestmentTrust {
    const currentNavPrice = getBasePrice(asset.name, asset.avgNavPrice, 'investment_trust');
    // Usually NAV is per 10,000 units.

    // acquisitionCost = asset.units * asset.avgNavPrice
    // avgNavPrice is usually per 10k units, but `units` in stored data is... 
    // Wait, let's check portfolioData.ts values.
    // eMAXIS: units=186.4752, avgNavPrice=26814, acquisitionCost=5000146
    // 186.4752 * 26814 = 4,999,xxx -> Close to 5,000,146.
    // Maybe units is "Man Kuchi" (10k units)? 
    // If so, cost = units * avgNavPrice is roughly correct.
    // Let's use that formula.

    const acquisitionCost = Math.round(asset.units * asset.avgNavPrice); // Rounding to integer yen

    const _marketValue = currentNavPrice * asset.units;
    const profitLoss = _marketValue - acquisitionCost;
    const profitLossPercent = acquisitionCost > 0 ? (profitLoss / acquisitionCost) * 100 : 0;

    return {
        ...asset,
        currentNavPrice,
        marketValue: _marketValue,
        profitLoss,
        profitLossPercent
    };
}

function hydrateCrypto(asset: StoredCrypto): Crypto {
    const currentPrice = getBasePrice(asset.symbol, asset.avgPrice, 'crypto');
    const acquisitionCost = asset.quantity * asset.avgPrice;
    const marketValue = currentPrice * asset.quantity;
    const profitLoss = marketValue - acquisitionCost;

    return {
        ...asset,
        currentPrice,
        marketValue,
        profitLoss
    };
}

function hydrateBond(asset: StoredBond): Bond {
    // Bond price often % of face value? Or just value.
    // Original: faceValue 11900, marketValue 739436.
    // This implies faceValue is in USD? 11900 USD * 150 = 1,785,000 ??
    // No, acquisitionCost 758556.
    // 11900 USD zero coupon bond maturing in 2044. Current value is lower.
    // Let's assume marketValue is roughly acquisitionCost for now (or slightly less).
    // Base price logic isn't great for bond name.

    const targetValue = asset.acquisitionCost * 0.98; // slight loss
    const marketValue = targetValue * (0.99 + Math.random() * 0.02);
    const profitLoss = marketValue - asset.acquisitionCost;
    const profitLossPercent = (profitLoss / asset.acquisitionCost) * 100;

    return {
        ...asset,
        marketValue,
        profitLoss,
        profitLossPercent
    };
}

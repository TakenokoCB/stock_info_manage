import { Eye, TrendingUp, TrendingDown, Coins, Gem, BarChart } from 'lucide-react';
import { storedPortfolioAssets } from '../../../data/portfolioData';
import './WatchList.css';

// Helper to hydrate portfolio assets with simulated 24h market data
// In a real app, this would come from an API
const getHydratedAssets = () => {
    return storedPortfolioAssets.map(asset => {
        // Simulate random 24h change for demo based on asset type
        const volatility = asset.type === 'crypto' ? 0.05 : 0.02;
        const randomFactor = (Math.random() - 0.5) * 2 * volatility; // -X% to +X%

        let price = 0;
        let name = '';
        let symbol = '';

        // Normalize fields based on asset type
        // Use avgPrice as base since StoredPortfolioAsset doesn't have currentPrice
        if (asset.type === 'domestic_stock') {
            // Simulate current price with ±5% from average
            price = asset.avgPrice * (1 + (Math.random() - 0.5) * 0.1);
            name = asset.name;
            symbol = asset.code;
        } else if (asset.type === 'foreign_stock') {
            price = asset.avgPriceUsd * (1 + (Math.random() - 0.5) * 0.1);
            name = asset.name;
            symbol = asset.ticker;
        } else if (asset.type === 'investment_trust') {
            price = asset.avgNavPrice * (1 + (Math.random() - 0.5) * 0.05);
            name = asset.name;
            symbol = 'FUND';
        } else if (asset.type === 'crypto') {
            price = asset.avgPrice * (1 + (Math.random() - 0.5) * 0.15);
            name = asset.name;
            symbol = asset.symbol;
        } else if (asset.type === 'bond') {
            price = asset.acquisitionCost * (1 + (Math.random() - 0.5) * 0.02);
            name = asset.name || '債券';
            symbol = 'BOND';
        } else {
            price = 0;
            name = 'Unknown';
            symbol = '---';
        }

        const changePercent = randomFactor * 100;

        return {
            ...asset,
            displayName: name.length > 12 ? name.substring(0, 10) + '...' : name,
            displaySymbol: symbol,
            displayPrice: price,
            changePercent24h: changePercent,
        };
    });
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'domestic_stock':
        case 'foreign_stock':
        case 'investment_trust':
            return <BarChart size={12} className="type-icon stock" />;
        case 'crypto':
            return <Coins size={12} className="type-icon crypto" />;
        case 'commodity':
        case 'bond':
            return <Gem size={12} className="type-icon commodity" />;
        default:
            return null;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'domestic_stock': return '日本株';
        case 'foreign_stock': return '米国株';
        case 'investment_trust': return '投信';
        case 'crypto': return '仮想通貨';
        case 'bond': return '債券';
        case 'commodity': return '商品';
        default: return type;
    }
};

const formatPrice = (price: number, type: string): string => {
    const isUsd = type === 'foreign_stock';
    const prefix = isUsd ? '$' : '¥';

    // For crypto > 100k JPY, use "万"
    if (type === 'crypto' && price > 100000 && !isUsd) {
        return `${prefix}${(price / 10000).toFixed(0)}万`;
    }

    // Standard formatting
    if (isUsd) {
        return `${prefix}${price.toFixed(0)}`;
    }
    return `${prefix}${Math.floor(price).toLocaleString()}`;
};

export default function WatchList() {
    const assets = getHydratedAssets();

    return (
        <div className="watchlist card">
            <div className="card-header">
                <h3 className="card-title">
                    <Eye size={18} />
                    ポートフォリオ連動ウォッチリスト
                </h3>
                <span className="live-indicator">LIVE</span>
            </div>
            <div className="watchlist-panel-grid">
                {assets.map((asset, idx) => (
                    <div key={idx} className={`watchlist-panel ${asset.changePercent24h >= 0 ? 'positive' : 'negative'}`}>
                        <div className="panel-header">
                            <div className="panel-type">
                                {getTypeIcon(asset.type)}
                                <span>{getTypeLabel(asset.type)}</span>
                            </div>
                            <div className={`panel-change ${asset.changePercent24h >= 0 ? 'positive' : 'negative'}`}>
                                {asset.changePercent24h >= 0 ? (
                                    <TrendingUp size={12} />
                                ) : (
                                    <TrendingDown size={12} />
                                )}
                                <span>{asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div className="panel-symbol">{asset.displaySymbol}</div>
                        <div className="panel-name">{asset.displayName}</div>
                        <div className="panel-price">{formatPrice(asset.displayPrice, asset.type)}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

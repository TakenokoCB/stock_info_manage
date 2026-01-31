import { Eye, TrendingUp, TrendingDown, Coins, Gem, BarChart } from 'lucide-react';
import { samplePortfolio } from '../../../data/sampleData';
import { PortfolioAsset } from '../../../data/types';
import './WatchList.css';

// Helper to hydrate portfolio assets with simulated 24h market data
// In a real app, this would come from an API
const getHydratedAssets = () => {
    return samplePortfolio.assets.map(asset => {
        // Simulate random 24h change for demo based on asset type
        const volatility = asset.type === 'crypto' ? 0.05 : 0.02;
        const randomFactor = (Math.random() - 0.5) * 2 * volatility; // -X% to +X%

        let price = 0;
        let name = '';
        let symbol = '';

        // Normalize fields based on asset type
        if (asset.type === 'domestic_stock') {
            price = asset.currentPrice;
            name = asset.name;
            symbol = asset.code;
        } else if (asset.type === 'foreign_stock') {
            price = asset.currentPriceUsd; // Show USD for US stocks
            name = asset.name;
            symbol = asset.ticker;
        } else if (asset.type === 'investment_trust') {
            price = asset.currentNavPrice;
            name = asset.name;
            symbol = 'FUND';
        } else if (asset.type === 'crypto') {
            price = asset.currentPrice;
            name = asset.name;
            symbol = asset.symbol;
        } else {
            price = 0;
            name = 'Unknown';
            symbol = '---';
        }

        const changePrice = price * randomFactor;
        const changePercent = randomFactor * 100;
        const high24h = price * (1 + Math.abs(randomFactor / 2));
        const low24h = price * (1 - Math.abs(randomFactor / 2));

        return {
            ...asset,
            displayName: name,
            displaySymbol: symbol,
            displayPrice: price,
            change24h: changePrice,
            changePercent24h: changePercent,
            high24h,
            low24h
        };
    });
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'domestic_stock':
        case 'foreign_stock':
        case 'investment_trust':
            return <BarChart size={14} className="type-icon stock" />;
        case 'crypto':
            return <Coins size={14} className="type-icon crypto" />;
        case 'commodity':
        case 'bond':
            return <Gem size={14} className="type-icon commodity" />;
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
            <div className="watchlist-table-container">
                <table className="watchlist-table">
                    <thead>
                        <tr>
                            <th>銘柄</th>
                            <th>タイプ</th>
                            <th className="text-right">現在値</th>
                            <th className="text-right">前日比</th>
                            <th className="text-right">変動率</th>
                            <th className="text-right">高値</th>
                            <th className="text-right">安値</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset, idx) => (
                            <tr key={idx} className="watchlist-row">
                                <td>
                                    <div className="asset-info">
                                        <span className="asset-symbol">{asset.displaySymbol}</span>
                                        <span className="asset-name">{asset.displayName}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="asset-type">
                                        {getTypeIcon(asset.type)}
                                        <span>{getTypeLabel(asset.type)}</span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <span className="price mono">{formatPrice(asset.displayPrice, asset.type)}</span>
                                </td>
                                <td className="text-right">
                                    <span className={`change mono ${asset.change24h >= 0 ? 'positive' : 'negative'}`}>
                                        {asset.change24h >= 0 ? '+' : ''}{formatPrice(asset.change24h, asset.type)}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className={`change-percent ${asset.changePercent24h >= 0 ? 'positive' : 'negative'}`}>
                                        {asset.changePercent24h >= 0 ? (
                                            <TrendingUp size={14} />
                                        ) : (
                                            <TrendingDown size={14} />
                                        )}
                                        <span className="mono">
                                            {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(0)}%
                                        </span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <span className="mono text-muted">{formatPrice(asset.high24h, asset.type)}</span>
                                </td>
                                <td className="text-right">
                                    <span className="mono text-muted">{formatPrice(asset.low24h, asset.type)}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

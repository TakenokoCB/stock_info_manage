import { Eye, TrendingUp, TrendingDown, Coins, Gem, BarChart } from 'lucide-react';
import { Asset } from '../../data/mockData';
import './WatchList.css';

interface WatchListProps {
    assets: Asset[];
}

const getTypeIcon = (type: string) => {
    switch (type) {
        case 'stock':
            return <BarChart size={14} className="type-icon stock" />;
        case 'crypto':
            return <Coins size={14} className="type-icon crypto" />;
        case 'commodity':
            return <Gem size={14} className="type-icon commodity" />;
        default:
            return null;
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case 'stock':
            return '株式';
        case 'crypto':
            return '仮想通貨';
        case 'commodity':
            return 'コモディティ';
        default:
            return '';
    }
};

const formatPrice = (price: number, type: string): string => {
    if (type === 'crypto' && price > 100000) {
        return `¥${(price / 10000).toFixed(0)}万`;
    }
    if (price >= 10000) {
        return `¥${Math.floor(price).toLocaleString()}`;
    }
    return `¥${Math.floor(price).toLocaleString()}`;
};

export default function WatchList({ assets }: WatchListProps) {
    return (
        <div className="watchlist card">
            <div className="card-header">
                <h3 className="card-title">
                    <Eye size={18} />
                    マルチアセット・ウォッチリスト
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
                        {assets.map((asset) => (
                            <tr key={asset.id} className="watchlist-row">
                                <td>
                                    <div className="asset-info">
                                        <span className="asset-symbol">{asset.symbol}</span>
                                        <span className="asset-name">{asset.nameJa}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="asset-type">
                                        {getTypeIcon(asset.type)}
                                        <span>{getTypeLabel(asset.type)}</span>
                                    </div>
                                </td>
                                <td className="text-right">
                                    <span className="price mono">{formatPrice(asset.price, asset.type)}</span>
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

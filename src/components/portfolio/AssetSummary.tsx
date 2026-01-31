import { Wallet, TrendingUp, TrendingDown, Building2, Bitcoin, Gem, FileText, PiggyBank } from 'lucide-react';
import { PortfolioAssetLegacy, portfolioSummary } from '../../data/mockData';
import './AssetSummary.css';

interface AssetSummaryProps {
    assets: PortfolioAssetLegacy[];
}

interface AssetGroup {
    type: string;
    label: string;
    labelJa: string;
    icon: React.ElementType;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    count: number;
}

export default function AssetSummary({ assets }: AssetSummaryProps) {
    // Group assets by type
    const groupedAssets = assets.reduce<Record<string, AssetGroup>>((acc, asset) => {
        const typeConfig: Record<string, { label: string; labelJa: string; icon: React.ElementType }> = {
            stock: { label: 'Stocks', labelJa: '株式', icon: Building2 },
            trust: { label: 'Investment Trusts', labelJa: '投資信託', icon: PiggyBank },
            crypto: { label: 'Crypto', labelJa: '仮想通貨', icon: Bitcoin },
            bond: { label: 'Bonds', labelJa: '債券', icon: FileText },
            commodity: { label: 'Commodities', labelJa: 'コモディティ', icon: Gem },
        };

        const config = typeConfig[asset.type] || typeConfig.stock;

        if (!acc[asset.type]) {
            acc[asset.type] = {
                type: asset.type,
                label: config.label,
                labelJa: config.labelJa,
                icon: config.icon,
                totalValue: 0,
                profitLoss: 0,
                profitLossPercent: 0,
                count: 0,
            };
        }

        acc[asset.type].totalValue += asset.totalValue;
        acc[asset.type].profitLoss += asset.profitLoss;
        acc[asset.type].count += 1;

        return acc;
    }, {});

    // Calculate percentages
    Object.values(groupedAssets).forEach(group => {
        const cost = group.totalValue - group.profitLoss;
        group.profitLossPercent = cost > 0 ? (group.profitLoss / cost) * 100 : 0;
    });

    const groups = Object.values(groupedAssets).sort((a, b) => b.totalValue - a.totalValue);

    // Calculate totals
    const totalValue = portfolioSummary?.totalMarketValue || assets.reduce((sum, a) => sum + a.totalValue, 0);
    const totalProfitLoss = portfolioSummary?.totalProfitLoss || assets.reduce((sum, a) => sum + a.profitLoss, 0);
    const totalProfitLossPercent = portfolioSummary?.totalProfitLossPercent ||
        (totalValue - totalProfitLoss > 0 ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100 : 0);

    const formatCurrency = (value: number): string => {
        if (Math.abs(value) >= 10000) {
            return `¥${(value / 10000).toFixed(1)}万`;
        }
        return `¥${value.toLocaleString()}`;
    };

    const formatPercent = (value: number): string => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(2)}%`;
    };

    return (
        <div className="asset-summary">
            <header className="summary-header">
                <div className="header-title">
                    <Wallet className="header-icon" />
                    <h2>統合資産管理</h2>
                </div>
                <span className="asset-count">{assets.length} 銘柄保有</span>
            </header>

            <div className="summary-content">
                {/* Total Section */}
                <div className="total-section">
                    <div className="total-card">
                        <span className="total-label">総資産評価額</span>
                        <span className="total-value">{formatCurrency(totalValue)}</span>
                        <div className="total-change">
                            <span className={`change-value ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                                {totalProfitLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {formatCurrency(totalProfitLoss)}
                            </span>
                            <span className={`change-percent ${totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                                ({formatPercent(totalProfitLossPercent)})
                            </span>
                        </div>
                    </div>
                </div>

                {/* Asset Groups */}
                <div className="groups-section">
                    {groups.map(group => {
                        const Icon = group.icon;
                        return (
                            <div key={group.type} className="group-card">
                                <div className="group-header">
                                    <Icon className="group-icon" />
                                    <span className="group-label">{group.labelJa}</span>
                                    <span className="group-count">{group.count}銘柄</span>
                                </div>
                                <div className="group-value">{formatCurrency(group.totalValue)}</div>
                                <div className="group-change">
                                    <span className={`change-value ${group.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                                        {group.profitLoss >= 0 ? '+' : ''}{formatCurrency(group.profitLoss)}
                                    </span>
                                    <span className={`change-percent ${group.profitLoss >= 0 ? 'positive' : 'negative'}`}>
                                        ({formatPercent(group.profitLossPercent)})
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

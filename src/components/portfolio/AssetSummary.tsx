import { Wallet, TrendingUp, TrendingDown, Building2, Bitcoin, Gem, FileText, PiggyBank } from 'lucide-react';
import { PortfolioAsset } from '../../../data/types';
import './AssetSummary.css';

interface AssetSummaryProps {
    assets: PortfolioAsset[];
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
    assets: PortfolioAsset[];
}

export default function AssetSummary({ assets }: AssetSummaryProps) {
    // Helper to get symbol/code and name
    const getAssetInfo = (asset: PortfolioAsset) => {
        let symbol = '';
        if ('code' in asset) symbol = asset.code;
        else if ('ticker' in asset) symbol = asset.ticker;
        else if ('symbol' in asset) symbol = asset.symbol;

        // For Investment Trusts, usually no symbol, just name
        if (asset.type === 'investment_trust' || asset.type === 'bond') {
            symbol = '';
        }

        return { symbol, name: asset.name };
    };

    // Helper to get market value consistent across types
    const getMarketValue = (asset: PortfolioAsset) => {
        return asset.marketValue;
    };

    // Helper to get profit loss consistent
    const getProfitLoss = (asset: PortfolioAsset) => {
        if (asset.type === 'foreign_stock') {
            return asset.profitLossJpy;
        }
        return asset.profitLoss;
    };

    // Helper to get profit loss percent consistent
    const getProfitLossPercent = (asset: PortfolioAsset) => {
        // Some assets might already have it, others need calc?
        // Types say: DomesticStock, InvestmentTrust, Bond have profitLossPercent.
        // ForeignStock, Crypto DO NOT have it explicitly in Enriched interface (except stored? no).
        // Let's check types.ts
        // ForeignStock has profitLossJpy/Usd. No percent.
        // Crypto has profitLoss. No percent.

        if ('profitLossPercent' in asset) {
            return asset.profitLossPercent;
        }

        // Calculate
        const marketVal = getMarketValue(asset);
        const pl = getProfitLoss(asset);
        const cost = marketVal - pl;
        return cost > 0 ? (pl / cost) * 100 : 0;
    };

    // Group assets by type
    const groupedAssets = assets.reduce<Record<string, AssetGroup>>((acc, asset) => {
        // Map asset.type to group key if needed, or use asset.type directly
        // asset.type values: 'domestic_stock', 'foreign_stock', 'investment_trust', 'crypto', 'bond'
        // Config keys match these.
        // Wait, original mockData had 'stock' which covered both?
        // Previous AssetSummary grouped by 'stock', 'trust', 'crypto'.
        // Now we have specific types. 
        // Should we group domestic/foreign stocks together?
        // User's previous grouping:
        // stock: { label: 'Stocks', labelJa: '株式' ... }
        // If I want to match previous UI, I should merge domestic/foreign into 'stock'.

        let groupKey: string = asset.type;
        if (groupKey === 'domestic_stock' || groupKey === 'foreign_stock') groupKey = 'stock';
        if (groupKey === 'investment_trust') groupKey = 'trust';

        const typeConfigMapped: Record<string, { label: string; labelJa: string; icon: React.ElementType }> = {
            stock: { label: 'Stocks', labelJa: '株式', icon: Building2 },
            trust: { label: 'Investment Trusts', labelJa: '投資信託', icon: PiggyBank },
            crypto: { label: 'Crypto', labelJa: '仮想通貨', icon: Bitcoin },
            bond: { label: 'Bonds', labelJa: '債券', icon: FileText },
            commodity: { label: 'Commodities', labelJa: 'コモディティ', icon: Gem },
        };

        const config = typeConfigMapped[groupKey] || typeConfigMapped.stock;

        if (!acc[groupKey]) {
            acc[groupKey] = {
                type: groupKey,
                label: config.label,
                labelJa: config.labelJa,
                icon: config.icon,
                totalValue: 0,
                profitLoss: 0,
                profitLossPercent: 0,
                count: 0,
                assets: [],
            };
        }

        const mVal = getMarketValue(asset);
        const pl = getProfitLoss(asset);

        acc[groupKey].totalValue += mVal;
        acc[groupKey].profitLoss += pl;
        acc[groupKey].count += 1;
        acc[groupKey].assets.push(asset);

        return acc;
    }, {});

    // Calculate percentages
    Object.values(groupedAssets).forEach(group => {
        const cost = group.totalValue - group.profitLoss;
        group.profitLossPercent = cost > 0 ? (group.profitLoss / cost) * 100 : 0;
    });

    const groups = Object.values(groupedAssets).sort((a, b) => b.totalValue - a.totalValue);

    // Calculate total summary from props
    const totalValue = assets.reduce((sum, a) => sum + getMarketValue(a), 0);
    const totalProfitLoss = assets.reduce((sum, a) => sum + getProfitLoss(a), 0);
    const totalProfitLossPercent = totalValue > 0
        ? (totalProfitLoss / (totalValue - totalProfitLoss)) * 100
        : 0;

    const formatCurrency = (value: number): string => {
        if (Math.abs(value) >= 10000) {
            return `¥${(value / 10000).toFixed(0)}万`;
        }
        return `¥${value.toLocaleString()}`;
    };

    const formatPercent = (value: number): string => {
        const sign = value >= 0 ? '+' : '';
        return `${sign}${value.toFixed(0)}%`;
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

                {/* Asset Groups with Holdings */}
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

                                {/* Holdings List (Always Visible) */}
                                <div className="holdings-list">
                                    {group.assets.map((asset, idx) => {
                                        const { symbol, name } = getAssetInfo(asset);
                                        const mVal = getMarketValue(asset);
                                        const plPercent = getProfitLossPercent(asset);

                                        return (
                                            <div key={idx} className="holding-row">
                                                <div className="holding-info">
                                                    {symbol && <span className="holding-symbol">{symbol}</span>}
                                                    <span className="holding-name">{name}</span>
                                                </div>
                                                <div className="holding-value">
                                                    <span className="holding-amount">{formatCurrency(mVal)}</span>
                                                    <span className={`holding-pl ${plPercent >= 0 ? 'positive' : 'negative'}`}>
                                                        {formatPercent(plPercent)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

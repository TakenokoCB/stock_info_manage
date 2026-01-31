import { Wallet, TrendingUp, TrendingDown, Coins, BarChart, Gem } from 'lucide-react';
import { PortfolioAsset } from '../../data/mockData';
import './AssetSummary.css';

interface AssetSummaryProps {
    assets: PortfolioAsset[];
}

interface AssetGroup {
    type: string;
    label: string;
    icon: React.ReactNode;
    totalValue: number;
    totalGain: number;
    gainPercent: number;
    income: number;
    incomeLabel: string;
}

export default function AssetSummary({ assets }: AssetSummaryProps) {
    // Calculate totals by type
    const calculateGroups = (): AssetGroup[] => {
        const stocks = assets.filter(a => a.type === 'stock');
        const crypto = assets.filter(a => a.type === 'crypto');
        const commodities = assets.filter(a => a.type === 'commodity');

        const calcGroup = (
            items: PortfolioAsset[],
            type: string,
            label: string,
            icon: React.ReactNode,
            incomeLabel: string
        ): AssetGroup => {
            const totalValue = items.reduce((sum, a) => sum + a.quantity * a.currentPrice, 0);
            const totalCost = items.reduce((sum, a) => sum + a.quantity * a.avgPrice, 0);
            const totalGain = totalValue - totalCost;
            const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

            let income = 0;
            if (type === 'stock') {
                income = items.reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.dividendYield || 0) / 100), 0);
            } else if (type === 'crypto') {
                income = items.reduce((sum, a) => sum + (a.quantity * a.currentPrice * (a.stakingApr || 0) / 100), 0);
            }

            return { type, label, icon, totalValue, totalGain, gainPercent, income, incomeLabel };
        };

        return [
            calcGroup(stocks, 'stock', '株式', <BarChart size={20} />, '年間配当'),
            calcGroup(crypto, 'crypto', '仮想通貨', <Coins size={20} />, 'ステーキング'),
            calcGroup(commodities, 'commodity', '貴金属', <Gem size={20} />, '評価額'),
        ];
    };

    const groups = calculateGroups();
    const totalPortfolioValue = groups.reduce((sum, g) => sum + g.totalValue, 0);
    const totalGain = groups.reduce((sum, g) => sum + g.totalGain, 0);
    const totalGainPercent = totalPortfolioValue > 0
        ? (totalGain / (totalPortfolioValue - totalGain)) * 100
        : 0;
    const totalIncome = groups.reduce((sum, g) => sum + g.income, 0);

    const formatCurrency = (value: number): string => {
        if (value >= 100000000) {
            return `¥${(value / 100000000).toFixed(2)}億`;
        }
        if (value >= 10000) {
            return `¥${(value / 10000).toFixed(1)}万`;
        }
        return `¥${value.toLocaleString()}`;
    };

    return (
        <div className="asset-summary card">
            <div className="card-header">
                <h3 className="card-title">
                    <Wallet size={18} />
                    統合資産管理
                </h3>
            </div>

            <div className="summary-total">
                <div className="total-main">
                    <span className="total-label">総資産評価額</span>
                    <span className="total-value">{formatCurrency(totalPortfolioValue)}</span>
                </div>
                <div className="total-stats">
                    <div className="total-stat">
                        <span className="stat-label">含み損益</span>
                        <span className={`stat-value ${totalGain >= 0 ? 'positive' : 'negative'}`}>
                            {totalGain >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                            {formatCurrency(Math.abs(totalGain))}
                            <span className="stat-percent">
                                ({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)
                            </span>
                        </span>
                    </div>
                    <div className="total-stat">
                        <span className="stat-label">年間インカム</span>
                        <span className="stat-value highlight">
                            {formatCurrency(totalIncome)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="asset-groups">
                {groups.map((group) => (
                    <div key={group.type} className={`asset-group ${group.type}`}>
                        <div className="group-header">
                            <div className="group-icon">{group.icon}</div>
                            <span className="group-label">{group.label}</span>
                        </div>
                        <div className="group-value">{formatCurrency(group.totalValue)}</div>
                        <div className="group-stats">
                            <div className={`group-gain ${group.totalGain >= 0 ? 'positive' : 'negative'}`}>
                                {group.totalGain >= 0 ? '+' : ''}{group.gainPercent.toFixed(1)}%
                            </div>
                            <div className="group-income">
                                <span className="income-label">{group.incomeLabel}</span>
                                <span className="income-value">{formatCurrency(group.income)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

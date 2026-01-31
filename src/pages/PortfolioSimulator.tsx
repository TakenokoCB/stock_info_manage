import AssetSummary from '../components/portfolio/AssetSummary';
import DividendCalendar from '../components/portfolio/DividendCalendar';
import LifePlanSimulator from '../components/portfolio/LifePlanSimulator';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useDividendData } from '../hooks/useDividendData';
import './PortfolioSimulator.css';

export default function PortfolioSimulator() {
    // Use live portfolio data
    const assets = usePortfolioData();
    const { dividendData } = useDividendData(assets);

    // Calculate current monthly income from portfolio 
    const annualIncome = dividendData.reduce((sum, d) => sum + d.total, 0);
    // const currentMonthlyIncome = annualIncome / 12;

    // Calculate totals for simulator
    const totalValue = assets.reduce((sum, a) => sum + a.marketValue, 0);
    const totalProfitLoss = assets.reduce((sum, a) => sum + (a.type === 'foreign_stock' ? a.profitLossJpy : a.profitLoss), 0);

    return (
        <div className="portfolio-simulator">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Portfolio Simulator</h1>
                    <p className="page-subtitle">配当 & 将来予測</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value">{assets.length}</span>
                        <span className="quick-stat-label">保有銘柄</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value text-positive">¥{(annualIncome / 10000).toFixed(0)}万</span>
                        <span className="quick-stat-label">年間インカム (予測)</span>
                    </div>
                </div>
            </header>

            <div className="portfolio-grid">
                <div className="portfolio-full">
                    <AssetSummary assets={assets} />
                </div>
                <div className="portfolio-left">
                    {/* Pass real dividend data */}
                    <DividendCalendar data={dividendData} />
                </div>
                <div className="portfolio-right">
                    <LifePlanSimulator currentTotalValue={totalValue} currentProfitLoss={totalProfitLoss} />
                </div>
            </div>
        </div>
    );
}

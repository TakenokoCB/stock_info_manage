import AssetSummary from '../components/portfolio/AssetSummary';
import DividendCalendar from '../components/portfolio/DividendCalendar';
import LifePlanSimulator from '../components/portfolio/LifePlanSimulator';
import { portfolioAssets, dividendCalendar } from '../data/mockData';
import './PortfolioSimulator.css';

export default function PortfolioSimulator() {
    // Calculate current monthly income from portfolio
    const annualIncome = dividendCalendar.reduce((sum, d) => sum + d.total, 0);
    const currentMonthlyIncome = annualIncome / 12;

    return (
        <div className="portfolio-simulator">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Portfolio Simulator</h1>
                    <p className="page-subtitle">配当 & 将来予測</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value">{portfolioAssets.length}</span>
                        <span className="quick-stat-label">保有銘柄</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value text-positive">¥{(annualIncome / 10000).toFixed(1)}万</span>
                        <span className="quick-stat-label">年間インカム</span>
                    </div>
                </div>
            </header>

            <div className="portfolio-grid">
                <div className="portfolio-full">
                    <AssetSummary assets={portfolioAssets} />
                </div>
                <div className="portfolio-left">
                    <DividendCalendar data={dividendCalendar} />
                </div>
                <div className="portfolio-right">
                    <LifePlanSimulator currentMonthlyIncome={currentMonthlyIncome} />
                </div>
            </div>
        </div>
    );
}

import NewsFeed from '../components/market/NewsFeed';
import SentimentHeatmap from '../components/market/SentimentHeatmap';
import WatchList from '../components/market/WatchList';
import { storedPortfolioAssets } from '../../data/portfolioData';
import './MarketIntelligence.css';

export default function MarketIntelligence() {
    const portfolioCount = storedPortfolioAssets.length;

    return (
        <div className="market-intelligence">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Market Intelligence</h1>
                    <p className="page-subtitle">AI分析 & センチメント監視 (保有銘柄連動)</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value text-positive">📊</span>
                        <span className="quick-stat-label">保有銘柄連動</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">{portfolioCount}</span>
                        <span className="quick-stat-label">監視対象銘柄</span>
                    </div>
                </div>
            </header>

            <div className="market-grid">
                <div className="market-main">
                    <NewsFeed portfolioLinked={true} />
                </div>
                <div className="market-side">
                    <SentimentHeatmap portfolioLinked={true} />
                    <WatchList />
                </div>
            </div>
        </div>
    );
}

import NewsFeed from '../components/market/NewsFeed';
import SentimentHeatmap from '../components/market/SentimentHeatmap';
import WatchList from '../components/market/WatchList';
import { newsItems, sentimentData } from '../data/mockData';
import './MarketIntelligence.css';

export default function MarketIntelligence() {
    return (
        <div className="market-intelligence">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Market Intelligence</h1>
                    <p className="page-subtitle">AI分析 & センチメント監視</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value text-positive">+3</span>
                        <span className="quick-stat-label">ポジティブニュース</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value text-negative">-1</span>
                        <span className="quick-stat-label">ネガティブニュース</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">8</span>
                        <span className="quick-stat-label">監視銘柄</span>
                    </div>
                </div>
            </header>

            <div className="market-grid">
                <div className="market-main">
                    <NewsFeed news={newsItems} />
                </div>
                <div className="market-side">
                    <SentimentHeatmap data={sentimentData} />
                    <WatchList />
                </div>
            </div>
        </div>
    );
}

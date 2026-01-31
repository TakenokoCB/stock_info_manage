import { TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';
import { NewsItem } from '../../data/mockData';
import './NewsFeed.css';

interface NewsFeedProps {
    news: NewsItem[];
}

const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
        case 'positive':
            return <TrendingUp className="sentiment-icon positive" />;
        case 'negative':
            return <TrendingDown className="sentiment-icon negative" />;
        default:
            return <Minus className="sentiment-icon neutral" />;
    }
};

const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000 / 60);

    if (diff < 60) return `${diff}分前`;
    if (diff < 1440) return `${Math.floor(diff / 60)}時間前`;
    return `${Math.floor(diff / 1440)}日前`;
};

export default function NewsFeed({ news }: NewsFeedProps) {
    return (
        <div className="news-feed card">
            <div className="card-header">
                <h3 className="card-title">
                    <Sparkles size={18} />
                    AIニュースフィード
                </h3>
                <span className="live-indicator">LIVE</span>
            </div>
            <div className="news-list">
                {news.map((item) => (
                    <article key={item.id} className={`news-item sentiment-${item.sentiment}`}>
                        <div className="news-header">
                            <div className="news-meta">
                                {getSentimentIcon(item.sentiment)}
                                <span className={`badge badge-${item.sentiment}`}>
                                    {item.sentiment === 'positive' ? 'ポジティブ' :
                                        item.sentiment === 'negative' ? 'ネガティブ' : '中立'}
                                </span>
                                <span className="news-source">{item.source}</span>
                                <span className="news-time">{getTimeAgo(item.timestamp)}</span>
                            </div>
                            <div className="ai-score">
                                <span className="ai-score-label">AI</span>
                                <span className="ai-score-value">{item.aiScore}</span>
                            </div>
                        </div>
                        <h4 className="news-title">{item.title}</h4>
                        <ul className="news-summary">
                            {item.summary.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ul>
                        <div className="news-assets">
                            {item.relatedAssets.map((asset) => (
                                <span key={asset} className="asset-tag">{asset}</span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

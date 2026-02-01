import { useMemo, useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, Briefcase, RefreshCw, Clock } from 'lucide-react';
import { NewsItem, newsItems } from '../../data/mockData';
import { samplePortfolio } from '../../../data/sampleData';
import './NewsFeed.css';

interface NewsFeedProps {
    news?: NewsItem[];
    portfolioLinked?: boolean;
}

const NEWS_STORAGE_KEY = 'newsfeed_last_update';

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

// Get portfolio symbols for filtering
const getPortfolioSymbols = (): string[] => {
    return samplePortfolio.assets.map(asset => {
        if (asset.type === 'domestic_stock') return asset.code || '';
        if (asset.type === 'foreign_stock') return asset.ticker || '';
        if (asset.type === 'crypto') return asset.symbol || '';
        return asset.name || '';
    }).filter(Boolean);
};

// Format timestamp for display
const formatUpdateTime = (isoString: string): string => {
    try {
        const date = new Date(isoString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}/${day} ${hours}:${minutes}`;
    } catch {
        return '';
    }
};

export default function NewsFeed({ news, portfolioLinked = true }: NewsFeedProps) {
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const portfolioSymbols = useMemo(() => getPortfolioSymbols(), []);

    // Check and update on mount
    useEffect(() => {
        const checkDailyUpdate = () => {
            const today = new Date().toISOString().split('T')[0];
            const stored = localStorage.getItem(NEWS_STORAGE_KEY);

            if (stored) {
                const storedDate = stored.split('T')[0];
                if (storedDate === today) {
                    // Already updated today
                    setLastUpdate(stored);
                    return;
                }
            }

            // Needs update - simulate fetching new news
            const now = new Date().toISOString();
            localStorage.setItem(NEWS_STORAGE_KEY, now);
            setLastUpdate(now);
        };

        checkDailyUpdate();
    }, []);

    // Manual refresh handler
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            const now = new Date().toISOString();
            localStorage.setItem(NEWS_STORAGE_KEY, now);
            setLastUpdate(now);
            setIsRefreshing(false);
        }, 1000);
    };

    // Filter news by portfolio holdings
    const filteredNews = useMemo(() => {
        const sourceNews = news || newsItems;

        if (!portfolioLinked) {
            return sourceNews;
        }

        // Filter news that are related to portfolio assets
        return sourceNews.filter(item => {
            // Check if any related asset matches portfolio
            return item.relatedAssets.some(asset => {
                // Normalize asset name for comparison
                const normalizedAsset = asset.toLowerCase();
                return portfolioSymbols.some(symbol => {
                    const normalizedSymbol = symbol.toLowerCase();
                    return normalizedAsset.includes(normalizedSymbol) ||
                        normalizedSymbol.includes(normalizedAsset) ||
                        // Common mappings
                        (normalizedAsset === 'トヨタ' && normalizedSymbol === '7203') ||
                        (normalizedAsset === 'apple' && normalizedSymbol === 'aapl') ||
                        (normalizedAsset === 'btc' && normalizedSymbol === 'btc') ||
                        (normalizedAsset === 'nvidia' && normalizedSymbol === 'nvda');
                });
            });
        });
    }, [news, portfolioLinked, portfolioSymbols]);

    return (
        <div className="news-feed card">
            <div className="card-header">
                <h3 className="card-title">
                    <Sparkles size={18} />
                    AIニュースフィード
                    {portfolioLinked && (
                        <span className="portfolio-badge">
                            <Briefcase size={12} />
                            保有銘柄
                        </span>
                    )}
                </h3>
                <div className="news-header-right">
                    {lastUpdate && (
                        <span className="last-update">
                            <Clock size={12} />
                            更新: {formatUpdateTime(lastUpdate)}
                        </span>
                    )}
                    <button
                        className="refresh-btn-small"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        title="ニュースを更新"
                    >
                        <RefreshCw size={14} className={isRefreshing ? 'spinning' : ''} />
                    </button>
                </div>
            </div>
            <div className="news-list">
                {filteredNews.length === 0 ? (
                    <div className="no-news">
                        <p>保有銘柄に関連するニュースがありません</p>
                    </div>
                ) : (
                    filteredNews.map((item) => (
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
                                    <span key={asset} className={`asset-tag ${portfolioSymbols.some(s => asset.toLowerCase().includes(s.toLowerCase())) ? 'portfolio-match' : ''}`}>{asset}</span>
                                ))}
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}

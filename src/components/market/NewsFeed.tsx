import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Minus, Sparkles, Briefcase, RefreshCw, Clock, ExternalLink, AlertCircle } from 'lucide-react';
import { fetchNews, checkNewsServerHealth, RssNewsItem } from '../../services/newsApi';
import './NewsFeed.css';

interface NewsFeedProps {
    portfolioLinked?: boolean;
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

export default function NewsFeed({ portfolioLinked = true }: NewsFeedProps) {
    const [news, setNews] = useState<RssNewsItem[]>([]);
    const [lastUpdate, setLastUpdate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [serverAvailable, setServerAvailable] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadNews = useCallback(async (showRefreshIndicator = false) => {
        if (showRefreshIndicator) {
            setIsRefreshing(true);
        }
        setError(null);

        try {
            // Check server health first
            const isHealthy = await checkNewsServerHealth();
            setServerAvailable(isHealthy);

            if (!isHealthy) {
                setError('ニュースサーバーに接続できません。サーバーを起動してください。');
                setIsLoading(false);
                setIsRefreshing(false);
                return;
            }

            const response = await fetchNews(20);

            if (response.success) {
                setNews(response.news);
                setLastUpdate(response.updatedAt);
            } else {
                setError(response.error || 'ニュースの取得に失敗しました');
            }
        } catch (err) {
            setError('ニュースの取得中にエラーが発生しました');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadNews();

        // Refresh every 5 minutes
        const interval = setInterval(() => loadNews(), 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [loadNews]);

    const handleRefresh = () => {
        loadNews(true);
    };

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
                {isLoading ? (
                    <div className="news-loading">
                        <RefreshCw size={24} className="spinning" />
                        <p>ニュースを読み込み中...</p>
                    </div>
                ) : !serverAvailable ? (
                    <div className="news-error">
                        <AlertCircle size={24} />
                        <p>ニュースサーバーに接続できません</p>
                        <p className="news-error-hint">
                            <code>cd server && npm run dev</code> でサーバーを起動してください
                        </p>
                        <button className="retry-btn" onClick={() => loadNews()}>
                            再試行
                        </button>
                    </div>
                ) : error ? (
                    <div className="news-error">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                        <button className="retry-btn" onClick={() => loadNews()}>
                            再試行
                        </button>
                    </div>
                ) : news.length === 0 ? (
                    <div className="no-news">
                        <p>保有銘柄に関連するニュースがありません</p>
                    </div>
                ) : (
                    news.map((item) => (
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
                            <h4 className="news-title">
                                {item.link ? (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.title}
                                        <ExternalLink size={12} className="external-link-icon" />
                                    </a>
                                ) : (
                                    item.title
                                )}
                            </h4>
                            <ul className="news-summary">
                                {item.summary.map((point, index) => (
                                    <li key={index}>{point}</li>
                                ))}
                            </ul>
                            <div className="news-assets">
                                {item.relatedAssets.map((asset) => (
                                    <span key={asset} className="asset-tag portfolio-match">{asset}</span>
                                ))}
                            </div>
                        </article>
                    ))
                )}
            </div>
        </div>
    );
}

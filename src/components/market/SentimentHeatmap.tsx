import { useMemo } from 'react';
import { Flame, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { SentimentData, sentimentData as mockSentimentData } from '../../data/mockData';
import { samplePortfolio } from '../../../data/sampleData';
import './SentimentHeatmap.css';

interface SentimentHeatmapProps {
    data?: SentimentData[];
    portfolioLinked?: boolean;
}

const getSentimentColor = (sentiment: number): string => {
    if (sentiment >= 70) return 'hsl(142, 76%, 45%)';
    if (sentiment >= 50) return 'hsl(142, 60%, 35%)';
    if (sentiment >= 30) return 'hsl(45, 60%, 45%)';
    if (sentiment >= 10) return 'hsl(25, 70%, 45%)';
    return 'hsl(0, 70%, 45%)';
};

const getSentimentLabel = (sentiment: number): string => {
    if (sentiment >= 70) return '非常に強気';
    if (sentiment >= 50) return '強気';
    if (sentiment >= 30) return '中立';
    if (sentiment >= 10) return '弱気';
    return '非常に弱気';
};

const formatNumber = (num: number): string => {
    if (num >= 1000) return `${Math.floor(num / 1000)}K`;
    return num.toString();
};

// Get portfolio symbols for filtering
const getPortfolioSymbols = (): string[] => {
    return samplePortfolio.assets.map(asset => {
        if (asset.type === 'domestic_stock') return asset.code || '';
        if (asset.type === 'foreign_stock') return asset.ticker || '';
        if (asset.type === 'crypto') return asset.symbol || '';
        return '';
    }).filter(Boolean);
};

// Generate sentiment data for portfolio holdings
const generatePortfolioSentiment = (): SentimentData[] => {
    const portfolioAssets = samplePortfolio.assets;

    return portfolioAssets.map((asset, index) => {
        let symbol = '';
        let name = '';

        if (asset.type === 'domestic_stock') {
            symbol = asset.code || '';
            name = asset.name || '';
        } else if (asset.type === 'foreign_stock') {
            symbol = asset.ticker || '';
            name = asset.name || '';
        } else if (asset.type === 'crypto') {
            symbol = asset.symbol || '';
            name = asset.name || '';
        } else if (asset.type === 'investment_trust') {
            symbol = 'FUND';
            name = asset.name?.substring(0, 10) || '';
        } else {
            symbol = 'BOND';
            name = '債券';
        }

        // Generate pseudo-random but consistent sentiment based on asset
        const baseScore = 40 + (index * 7) % 50;
        const change = ((index * 3) % 15) - 5;
        const twitterMentions = 500 + (index * 123) % 5000;
        const redditMentions = 100 + (index * 47) % 1000;

        return {
            assetId: symbol || `asset-${index}`,
            symbol: symbol || name.substring(0, 4),
            overallSentiment: baseScore,
            changeFromYesterday: change,
            trending: baseScore > 60 && change > 3,
            twitterMentions,
            redditMentions,
        };
    }).filter(item => item.symbol);
};

export default function SentimentHeatmap({ data, portfolioLinked = true }: SentimentHeatmapProps) {
    const portfolioSymbols = useMemo(() => getPortfolioSymbols(), []);

    const displayData = useMemo(() => {
        if (portfolioLinked) {
            // Use portfolio-based sentiment data, limit to 5 items
            return generatePortfolioSentiment().slice(0, 5);
        }
        // Use provided data or mock data, limit to 5 items
        return (data || mockSentimentData).slice(0, 5);
    }, [data, portfolioLinked]);

    return (
        <div className="sentiment-heatmap card">
            <div className="card-header">
                <h3 className="card-title">
                    <Flame size={18} />
                    センチメント・ヒートマップ
                    {portfolioLinked && (
                        <span className="portfolio-badge">
                            <Briefcase size={12} />
                            保有銘柄
                        </span>
                    )}
                </h3>
                <span className="live-indicator">LIVE</span>
            </div>
            <div className="heatmap-grid">
                {displayData.map((item) => (
                    <div
                        key={item.assetId}
                        className={`heatmap-cell ${item.trending ? 'trending' : ''} ${portfolioSymbols.includes(item.symbol) ? 'portfolio-item' : ''}`}
                        style={{
                            '--cell-color': getSentimentColor(item.overallSentiment),
                        } as React.CSSProperties}
                    >
                        <div className="cell-header">
                            <span className="cell-symbol">{item.symbol}</span>
                            {item.trending && <Flame size={12} className="trending-icon" />}
                        </div>
                        <div className="cell-sentiment">
                            <span className="sentiment-value">{item.overallSentiment}</span>
                            <span className="sentiment-label">{getSentimentLabel(item.overallSentiment)}</span>
                        </div>
                        <div className="cell-change">
                            {item.changeFromYesterday >= 0 ? (
                                <TrendingUp size={12} className="change-icon positive" />
                            ) : (
                                <TrendingDown size={12} className="change-icon negative" />
                            )}
                            <span className={item.changeFromYesterday >= 0 ? 'positive' : 'negative'}>
                                {item.changeFromYesterday >= 0 ? '+' : ''}{item.changeFromYesterday}%
                            </span>
                        </div>
                        <div className="cell-mentions">
                            <div className="mention-row">
                                <span className="mention-label">𝕏</span>
                                <span className="mention-value">{formatNumber(item.twitterMentions)}</span>
                            </div>
                            <div className="mention-row">
                                <span className="mention-label">掲示板</span>
                                <span className="mention-value">{formatNumber(item.redditMentions)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

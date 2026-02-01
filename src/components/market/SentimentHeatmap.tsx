import { useMemo } from 'react';
import { Flame, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { SentimentData, sentimentData as mockSentimentData } from '../../data/mockData';
import { storedPortfolioAssets } from '../../../data/portfolioData';
import './SentimentHeatmap.css';

interface SentimentHeatmapProps {
    data?: SentimentData[];
    portfolioLinked?: boolean;
}

// Extended type with name
interface SentimentDataWithName extends SentimentData {
    name: string;
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

// Generate sentiment data for portfolio holdings with names
const generatePortfolioSentiment = (): SentimentDataWithName[] => {
    // Use actual portfolio data, not sample data
    const portfolioAssets = storedPortfolioAssets;

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
            // Shorten long fund names
            const fullName = asset.name || '';
            name = fullName.length > 15 ? fullName.substring(0, 12) + '...' : fullName;
        } else if (asset.type === 'bond') {
            symbol = 'BOND';
            name = '米国国債';
        } else {
            return null;
        }

        // Generate pseudo-random but consistent sentiment based on asset
        const baseScore = 40 + (index * 7) % 50;
        const change = ((index * 3) % 15) - 5;
        const twitterMentions = 500 + (index * 123) % 5000;
        const redditMentions = 100 + (index * 47) % 1000;

        return {
            assetId: symbol || `asset-${index}`,
            symbol: symbol,
            name: name,
            overallSentiment: baseScore,
            changeFromYesterday: change,
            trending: baseScore > 60 && change > 3,
            twitterMentions,
            redditMentions,
        };
    }).filter((item): item is SentimentDataWithName => item !== null && item.symbol !== '');
};

export default function SentimentHeatmap({ data, portfolioLinked = true }: SentimentHeatmapProps) {
    const displayData = useMemo(() => {
        if (portfolioLinked) {
            // Use portfolio-based sentiment data - show ALL portfolio items
            return generatePortfolioSentiment();
        }
        // Use provided data or mock data, add empty name field
        return (data || mockSentimentData).map(item => ({
            ...item,
            name: item.symbol, // Fallback to symbol as name
        }));
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
            <div className="heatmap-grid" style={{ '--item-count': displayData.length } as React.CSSProperties}>
                {displayData.map((item) => (
                    <div
                        key={item.assetId}
                        className="heatmap-cell"
                        style={{
                            '--cell-color': getSentimentColor(item.overallSentiment),
                        } as React.CSSProperties}
                    >
                        <div className="cell-header">
                            <span className="cell-name">{item.name}</span>
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

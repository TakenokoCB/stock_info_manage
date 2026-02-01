import { useMemo } from 'react';
import { Flame, TrendingUp, TrendingDown, Briefcase, Award } from 'lucide-react';
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
    if (sentiment >= 70) return 'var(--accent-success)';
    if (sentiment >= 50) return 'hsl(142, 60%, 35%)';
    if (sentiment >= 30) return 'var(--accent-warning)';
    if (sentiment >= 10) return 'hsl(25, 70%, 45%)';
    return 'var(--accent-danger)';
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
            name = fullName.length > 20 ? fullName.substring(0, 17) + '...' : fullName;
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
        let items: SentimentDataWithName[];

        if (portfolioLinked) {
            items = generatePortfolioSentiment();
        } else {
            items = (data || mockSentimentData).map(item => ({
                ...item,
                name: item.symbol,
            }));
        }

        // Sort by sentiment score (highest first) for ranking
        return items.sort((a, b) => b.overallSentiment - a.overallSentiment);
    }, [data, portfolioLinked]);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return <span className="rank-badge gold"><Award size={12} />1</span>;
        if (rank === 2) return <span className="rank-badge silver"><Award size={12} />2</span>;
        if (rank === 3) return <span className="rank-badge bronze"><Award size={12} />3</span>;
        return <span className="rank-number">{rank}</span>;
    };

    return (
        <div className="sentiment-heatmap sentiment-list card">
            <div className="card-header">
                <h3 className="card-title">
                    <Flame size={18} />
                    センチメントランキング
                    {portfolioLinked && (
                        <span className="portfolio-badge">
                            <Briefcase size={12} />
                            保有銘柄
                        </span>
                    )}
                </h3>
                <span className="live-indicator">LIVE</span>
            </div>
            <div className="sentiment-ranking-list">
                <div className="ranking-header">
                    <span className="ranking-col-rank">順位</span>
                    <span className="ranking-col-name">銘柄</span>
                    <span className="ranking-col-score">スコア</span>
                    <span className="ranking-col-change">変化</span>
                    <span className="ranking-col-mentions">𝕏</span>
                </div>
                {displayData.map((item, index) => (
                    <div
                        key={item.assetId}
                        className={`ranking-row ${item.trending ? 'trending' : ''}`}
                    >
                        <div className="ranking-col-rank">
                            {getRankBadge(index + 1)}
                        </div>
                        <div className="ranking-col-name">
                            <span className="asset-name">{item.name}</span>
                            {item.trending && <Flame size={12} className="trending-icon" />}
                        </div>
                        <div className="ranking-col-score">
                            <div
                                className="score-bar"
                                style={{
                                    width: `${item.overallSentiment}%`,
                                    background: getSentimentColor(item.overallSentiment)
                                }}
                            />
                            <span className="score-value">{item.overallSentiment}</span>
                            <span className="score-label">{getSentimentLabel(item.overallSentiment)}</span>
                        </div>
                        <div className="ranking-col-change">
                            {item.changeFromYesterday >= 0 ? (
                                <TrendingUp size={12} className="change-icon positive" />
                            ) : (
                                <TrendingDown size={12} className="change-icon negative" />
                            )}
                            <span className={item.changeFromYesterday >= 0 ? 'positive' : 'negative'}>
                                {item.changeFromYesterday >= 0 ? '+' : ''}{item.changeFromYesterday}%
                            </span>
                        </div>
                        <div className="ranking-col-mentions">
                            {formatNumber(item.twitterMentions)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

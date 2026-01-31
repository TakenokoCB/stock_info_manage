import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { SentimentData } from '../../data/mockData';
import './SentimentHeatmap.css';

interface SentimentHeatmapProps {
    data: SentimentData[];
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

export default function SentimentHeatmap({ data }: SentimentHeatmapProps) {
    return (
        <div className="sentiment-heatmap card">
            <div className="card-header">
                <h3 className="card-title">
                    <Flame size={18} />
                    センチメント・ヒートマップ
                </h3>
                <span className="live-indicator">LIVE</span>
            </div>
            <div className="heatmap-grid">
                {data.map((item) => (
                    <div
                        key={item.assetId}
                        className={`heatmap-cell ${item.trending ? 'trending' : ''}`}
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

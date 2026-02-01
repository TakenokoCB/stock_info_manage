import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, MessageCircle, Bot } from 'lucide-react';
import { screenerAssets } from '../../data/mockData';
import './Screener.css';

// Type definition for Chrome Built-in AI
declare global {
    interface Window {
        ai: any;
    }
}

type SortField = 'symbol' | 'price' | 'snsBuzz' | 'aiScore' | 'change';
type SortDirection = 'asc' | 'desc';

interface Filters {
    minSnsBuzz: number;
    minAiScore: number;
}

export default function Screener() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('aiScore');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        minSnsBuzz: 0,
        minAiScore: 0,
    });
    const [aiReasoning, setAiReasoning] = useState<Record<string, string>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiStatus, setAiStatus] = useState<'ready' | 'unavailable' | 'loading'>('loading');

    // Fallback analysis generator (when Gemini Nano is unavailable)
    const generateFallbackAnalysis = (asset: typeof screenerAssets[0]): string => {
        const positives: string[] = [];
        const negatives: string[] = [];

        if (asset.aiScore >= 80) positives.push('AI高評価');
        else if (asset.aiScore < 50) negatives.push('AI低評価');

        if (asset.snsBuzz >= 70) positives.push('SNS注目度高');
        else if (asset.snsBuzz < 30) negatives.push('SNS関心低');

        if (asset.change >= 2) positives.push('上昇トレンド');
        else if (asset.change <= -2) negatives.push('下落傾向');

        if (positives.length > negatives.length) {
            return `${positives.join('・')}。買い検討の好機。`;
        } else if (negatives.length > positives.length) {
            return `${negatives.join('・')}。慎重な姿勢推奨。`;
        }
        return 'AI/SNS指標は中立。市場動向を注視。';
    };

    // Gemini Nano Analysis Effect
    useEffect(() => {
        const analyzeAssets = async () => {
            const targetAssets = [...screenerAssets]
                .sort((a, b) => b.aiScore - a.aiScore)
                .slice(0, 5);

            // Check if Gemini Nano is available
            if (!window.ai || !window.ai.languageModel) {
                console.log('Gemini Nano not available, using fallback analysis');
                setAiStatus('unavailable');

                // Generate fallback analysis
                const fallbackReasoning: Record<string, string> = {};
                targetAssets.forEach(asset => {
                    fallbackReasoning[asset.id] = generateFallbackAnalysis(asset);
                });
                setAiReasoning(fallbackReasoning);
                return;
            }

            // Only run if we haven't analyzed yet
            if (Object.keys(aiReasoning).length > 0) return;

            setIsAiLoading(true);
            setAiStatus('loading');
            const newReasoning: Record<string, string> = {};

            try {
                // Check capabilities
                const capabilities = await window.ai.languageModel.capabilities();
                if (capabilities.available === 'no') {
                    console.log('Gemini Nano is not available on this device');
                    setAiStatus('unavailable');
                    // Use fallback
                    targetAssets.forEach(asset => {
                        newReasoning[asset.id] = generateFallbackAnalysis(asset);
                    });
                    setAiReasoning(newReasoning);
                    return;
                }

                // Create a session
                const session = await window.ai.languageModel.create();
                setAiStatus('ready');

                for (const asset of targetAssets) {
                    const prompt = `日本語で1文で分析してください。
銘柄: ${asset.name}
セクター: ${asset.sector}
SNS注目度: ${asset.snsBuzz}/100
AIスコア: ${asset.aiScore}/100
株価変動: ${asset.change}%
この銘柄の投資判断の理由:`;

                    const result = await session.prompt(prompt);
                    newReasoning[asset.id] = result.trim();
                }

                setAiReasoning(newReasoning);
            } catch (error) {
                console.error('AI Analysis failed:', error);
                setAiStatus('unavailable');
                // Use fallback on error
                targetAssets.forEach(asset => {
                    newReasoning[asset.id] = generateFallbackAnalysis(asset);
                });
                setAiReasoning(newReasoning);
            } finally {
                setIsAiLoading(false);
            }
        };

        analyzeAssets();
    }, []); // Run once on mount

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const filteredAndSortedAssets = useMemo(() => {
        let result = screenerAssets.filter(asset => {
            if (searchQuery && !asset.name.includes(searchQuery) && !asset.symbol.includes(searchQuery)) {
                return false;
            }
            if (asset.snsBuzz < filters.minSnsBuzz) return false;
            if (asset.aiScore < filters.minAiScore) return false;
            return true;
        });

        result.sort((a, b) => {
            const aValue = sortField === 'change' ? a.change : a[sortField];
            const bValue = sortField === 'change' ? b.change : b[sortField];
            const direction = sortDirection === 'asc' ? 1 : -1;
            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue as string) * direction;
            }
            return ((aValue as number) - (bValue as number)) * direction;
        });

        return result;
    }, [searchQuery, sortField, sortDirection, filters]);

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <th className="sortable" onClick={() => handleSort(field)}>
            <div className="sort-header">
                {children}
                <ArrowUpDown size={12} className={sortField === field ? 'active' : ''} />
            </div>
        </th>
    );

    return (
        <div className="screener card">
            <div className="card-header">
                <h3 className="card-title">
                    <Search size={18} />
                    AI高度スクリーナー (Gemini Nano)
                </h3>
                <div className="screener-actions">
                    <div className="search-box">
                        <Search size={14} className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="銘柄を検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal size={14} />
                        フィルター
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filter-panel">
                    <div className="filter-group">
                        <label>SNS注目度 (Min)</label>
                        <input
                            type="number"
                            value={filters.minSnsBuzz}
                            onChange={(e) => setFilters(prev => ({ ...prev, minSnsBuzz: Number(e.target.value) }))}
                            placeholder="0"
                        />
                    </div>
                    <div className="filter-group">
                        <label>AIスコア (Min)</label>
                        <input
                            type="number"
                            value={filters.minAiScore}
                            onChange={(e) => setFilters(prev => ({ ...prev, minAiScore: Number(e.target.value) }))}
                            placeholder="0"
                        />
                    </div>
                </div>
            )}

            <div className="screener-table-container">
                <table className="screener-table">
                    <thead>
                        <tr>
                            <SortHeader field="symbol">銘柄</SortHeader>
                            <SortHeader field="price">株価</SortHeader>
                            <SortHeader field="change">騰落率</SortHeader>
                            <SortHeader field="snsBuzz">
                                <MessageCircle size={12} />
                                SNS
                            </SortHeader>
                            <SortHeader field="aiScore">
                                <Sparkles size={12} />
                                AI Score
                            </SortHeader>
                            <th className="ai-reasoning-header">
                                <Bot size={12} />
                                AI Analysis (Gemini Nano)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedAssets.map(asset => (
                            <tr key={asset.id} className="screener-row">
                                <td>
                                    <div className="asset-cell">
                                        <span className="asset-symbol">{asset.symbol}</span>
                                        <span className="asset-name">{asset.name}</span>
                                    </div>
                                </td>
                                <td className="price-cell">¥{asset.price.toLocaleString()}</td>
                                <td>
                                    <div className={`change-cell ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                                        {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(0)}%
                                    </div>
                                </td>
                                <td>
                                    <div className="buzz-cell">
                                        <div
                                            className="buzz-bar"
                                            style={{ width: `${asset.snsBuzz}%` }}
                                        />
                                        <span className="buzz-value">{asset.snsBuzz}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={`ai-cell ${asset.aiScore >= 80 ? 'high' : asset.aiScore >= 60 ? 'medium' : 'low'}`}>
                                        {asset.aiScore}
                                    </div>
                                </td>
                                <td className="ai-reason-cell">
                                    {aiReasoning[asset.id] ? (
                                        <span className="ai-text">{aiReasoning[asset.id]}</span>
                                    ) : (
                                        <span className="text-muted text-xs">
                                            {isAiLoading && asset.aiScore > 80 ? 'Analyzing...' : '-'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="screener-footer">
                <span className="result-count">{filteredAndSortedAssets.length}件の結果 (上位5件をAI分析)</span>
            </div>
        </div>
    );
}

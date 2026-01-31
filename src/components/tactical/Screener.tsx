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

    // Gemini Nano Analysis Effect
    useEffect(() => {
        const analyzeAssets = async () => {
            if (!window.ai) {
                console.log('Gemini Nano not available');
                return;
            }

            // Only run if we haven't analyzed yet
            if (Object.keys(aiReasoning).length > 0) return;

            setIsAiLoading(true);
            const newReasoning: Record<string, string> = {};

            try {
                // Check capabilities
                const capabilities = await window.ai.languageModel.capabilities();
                if (capabilities.available === 'no') {
                    console.log('Gemini Nano is not available on this device');
                    return;
                }

                // Create a session
                const session = await window.ai.languageModel.create();

                // Analyze top 5 assets by AI Score to save resources (demo)
                const targetAssets = [...screenerAssets]
                    .sort((a, b) => b.aiScore - a.aiScore)
                    .slice(0, 5);

                for (const asset of targetAssets) {
                    const prompt = `
                        Analyze this stock concisely in one sentence:
                        Name: ${asset.name}
                        Sector: ${asset.sector}
                        SNS Buzz Score: ${asset.snsBuzz}/100
                        AI Technical Score: ${asset.aiScore}/100
                        Price Change: ${asset.change}%
                        Reason for selection:
                    `;

                    const result = await session.prompt(prompt);
                    newReasoning[asset.id] = result.trim();
                }

                setAiReasoning(newReasoning);
            } catch (error) {
                console.error('AI Analysis failed:', error);
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

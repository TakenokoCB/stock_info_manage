import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, MessageCircle, Bot, Trophy, RefreshCw } from 'lucide-react';
import { screenerAssets } from '../../data/mockData';
import './Screener.css';

// Type definition for Chrome Built-in AI
declare global {
    interface Window {
        ai: any;
    }
}

type SortField = 'rank' | 'symbol' | 'price' | 'snsBuzz' | 'aiScore' | 'change';
type SortDirection = 'asc' | 'desc';

interface Filters {
    minSnsBuzz: number;
    minAiScore: number;
}

const SCREENER_STORAGE_KEY = 'screener_last_update';
const SCREENER_ANALYSIS_KEY = 'screener_analysis_cache';

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
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // Enhanced fallback analysis generator with more variety
    const generateFallbackAnalysis = (asset: typeof screenerAssets[0], rank: number): string => {
        const positives: string[] = [];
        const negatives: string[] = [];
        const sector = asset.sector;

        // AI Score analysis
        if (asset.aiScore >= 85) positives.push('AI最高評価');
        else if (asset.aiScore >= 75) positives.push('AI高評価');
        else if (asset.aiScore >= 65) positives.push('AI中評価');
        else if (asset.aiScore < 60) negatives.push('AI評価低め');

        // SNS Buzz analysis
        if (asset.snsBuzz >= 80) positives.push('SNS急上昇中');
        else if (asset.snsBuzz >= 60) positives.push('SNS注目');
        else if (asset.snsBuzz < 40) negatives.push('SNS関心薄');

        // Price change analysis
        if (asset.change >= 3) positives.push('強い上昇モメンタム');
        else if (asset.change >= 1.5) positives.push('上昇基調');
        else if (asset.change <= -1.5) negatives.push('調整局面');

        // Sector-specific comments
        const sectorComments: Record<string, string> = {
            '電気機器': 'AI・半導体需要が追い風',
            'エレクトロニクス': 'デジタル化推進で成長期待',
            '自動車': 'EV転換とグローバル展開に注目',
            '医薬品': 'バイオ・創薬パイプラインに期待',
            '情報・通信': 'DX需要とキャリア安定収益',
            '銀行': '金利上昇環境で収益改善期待',
            '商社': '資源価格と事業投資が鍵',
            '機械': '設備投資サイクルに連動',
            '化学': '素材需要とグリーン投資',
            '小売': '消費動向とインバウンド効果',
        };

        // Build the analysis
        let analysis = '';

        if (rank <= 10) {
            analysis = `【TOP10】${positives.slice(0, 2).join('・')}。`;
        } else if (rank <= 20) {
            analysis = `${positives.length > 0 ? positives[0] : '安定推移'}。`;
        } else if (rank <= 35) {
            analysis = `${positives.length > negatives.length ? positives[0] : 'バリュー銘柄として注目'}。`;
        } else {
            analysis = `${negatives.length > 0 ? negatives[0] : '様子見推奨'}。`;
        }

        // Add sector comment if available
        if (sectorComments[sector]) {
            analysis += sectorComments[sector];
        }

        return analysis;
    };

    // Check if daily update is needed
    const needsDailyUpdate = (): boolean => {
        const today = new Date().toISOString().split('T')[0];
        const cached = localStorage.getItem(SCREENER_STORAGE_KEY);
        return cached !== today;
    };

    // Save analysis to cache
    const saveAnalysisCache = (analysis: Record<string, string>) => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(SCREENER_STORAGE_KEY, today);
        localStorage.setItem(SCREENER_ANALYSIS_KEY, JSON.stringify(analysis));
        setLastUpdate(today);
    };

    // Load analysis from cache
    const loadAnalysisCache = (): Record<string, string> | null => {
        try {
            const cached = localStorage.getItem(SCREENER_ANALYSIS_KEY);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch (e) {
            console.error('Failed to load analysis cache', e);
        }
        return null;
    };

    // Force refresh analysis
    const forceRefresh = () => {
        localStorage.removeItem(SCREENER_STORAGE_KEY);
        localStorage.removeItem(SCREENER_ANALYSIS_KEY);
        setAiReasoning({});
        runAnalysis();
    };

    // Main analysis function
    const runAnalysis = async () => {
        // Sort assets by AI score for ranking
        const rankedAssets = [...screenerAssets]
            .sort((a, b) => b.aiScore - a.aiScore);

        // Check cache first (if not forced)
        if (!needsDailyUpdate()) {
            const cached = loadAnalysisCache();
            if (cached && Object.keys(cached).length >= 50) {
                console.log('Using cached analysis from today');
                setAiReasoning(cached);
                setAiStatus('ready');
                setLastUpdate(localStorage.getItem(SCREENER_STORAGE_KEY) || '');
                return;
            }
        }

        setIsAiLoading(true);
        setAiStatus('loading');
        const newReasoning: Record<string, string> = {};

        // Check if Gemini Nano is available
        const useGeminiNano = window.ai && window.ai.languageModel;

        if (useGeminiNano) {
            try {
                const capabilities = await window.ai.languageModel.capabilities();
                if (capabilities.available !== 'no') {
                    const session = await window.ai.languageModel.create();
                    setAiStatus('ready');

                    // Use Gemini Nano for top 10 only (to save API calls)
                    const top10 = rankedAssets.slice(0, 10);
                    for (const asset of top10) {
                        const rank = rankedAssets.findIndex(a => a.id === asset.id) + 1;
                        const prompt = `日本語で20文字以内で分析。銘柄: ${asset.name}, セクター: ${asset.sector}, AIスコア: ${asset.aiScore}/100, SNS注目度: ${asset.snsBuzz}/100, 株価変動: ${asset.change}%。上昇期待理由:`;
                        const result = await session.prompt(prompt);
                        newReasoning[asset.id] = result.trim();
                    }

                    // Fallback for remaining 40
                    rankedAssets.slice(10).forEach((asset, idx) => {
                        newReasoning[asset.id] = generateFallbackAnalysis(asset, idx + 11);
                    });

                    setAiReasoning(newReasoning);
                    saveAnalysisCache(newReasoning);
                    setIsAiLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Gemini Nano failed, falling back:', error);
            }
        }

        // Fallback: Generate all 50 with rule-based analysis
        console.log('Using fallback analysis for all 50 stocks');
        setAiStatus('unavailable');
        rankedAssets.forEach((asset, idx) => {
            newReasoning[asset.id] = generateFallbackAnalysis(asset, idx + 1);
        });
        setAiReasoning(newReasoning);
        saveAnalysisCache(newReasoning);
        setIsAiLoading(false);
    };

    // Initial load effect
    useEffect(() => {
        runAnalysis();
    }, []);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    // Filtered, sorted, and ranked assets
    const filteredAndSortedAssets = useMemo(() => {
        // First, create ranked list by AI Score
        const ranked = [...screenerAssets]
            .sort((a, b) => b.aiScore - a.aiScore)
            .map((asset, index) => ({ ...asset, rank: index + 1 }));

        // Apply filters
        let result = ranked.filter(asset => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                if (!asset.symbol.toLowerCase().includes(query) &&
                    !asset.name.toLowerCase().includes(query) &&
                    !asset.sector.toLowerCase().includes(query)) {
                    return false;
                }
            }
            if (asset.snsBuzz < filters.minSnsBuzz) return false;
            if (asset.aiScore < filters.minAiScore) return false;
            return true;
        });

        // Apply user sort (but keep rank attached)
        if (sortField !== 'rank') {
            const direction = sortDirection === 'asc' ? 1 : -1;
            result.sort((a, b) => {
                const aValue = a[sortField as keyof typeof a];
                const bValue = b[sortField as keyof typeof b];
                return ((aValue as number) - (bValue as number)) * direction;
            });
        } else {
            // Sort by rank
            const direction = sortDirection === 'asc' ? 1 : -1;
            result.sort((a, b) => (a.rank - b.rank) * direction);
        }

        return result;
    }, [searchQuery, sortField, sortDirection, filters]);

    const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
        <th
            className={`sortable ${sortField === field ? 'active' : ''}`}
            onClick={() => handleSort(field)}
        >
            <div className="th-content">
                {children}
                <ArrowUpDown size={12} className={sortField === field ? (sortDirection === 'desc' ? 'desc' : 'asc') : ''} />
            </div>
        </th>
    );

    return (
        <div className="screener card">
            <div className="card-header">
                <div className="screener-title-section">
                    <h3 className="card-title">
                        <Sparkles size={18} />
                        AI高度スクリーナー (50銘柄ランキング)
                    </h3>
                    <div className="screener-subtitle">
                        <span className="update-info">
                            <RefreshCw size={12} />
                            {lastUpdate ? `最終更新: ${lastUpdate}` : '更新中...'}
                        </span>
                        <button className="refresh-btn" onClick={forceRefresh} disabled={isAiLoading}>
                            {isAiLoading ? '分析中...' : '再分析'}
                        </button>
                    </div>
                </div>
                <div className="screener-controls">
                    <div className="search-box">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="銘柄検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        className={`filter-toggle ${showFilters ? 'active' : ''}`}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <SlidersHorizontal size={16} />
                    </button>
                </div>
            </div>

            {showFilters && (
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>SNSバズ (Min)</label>
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
                            <SortHeader field="rank">
                                <Trophy size={12} />
                                順位
                            </SortHeader>
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
                                AI上昇期待理由
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedAssets.map(asset => (
                            <tr key={asset.id} className={`screener-row ${asset.rank <= 10 ? 'top-ten' : asset.rank <= 20 ? 'top-twenty' : ''}`}>
                                <td className="rank-cell">
                                    <div className={`rank-badge ${asset.rank <= 3 ? 'gold' : asset.rank <= 10 ? 'silver' : asset.rank <= 20 ? 'bronze' : ''}`}>
                                        {asset.rank <= 3 && <Trophy size={12} />}
                                        {asset.rank}
                                    </div>
                                </td>
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
                                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(1)}%
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
                                            {isAiLoading ? '分析中...' : '-'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="screener-footer">
                <span className="result-count">{filteredAndSortedAssets.length}銘柄表示</span>
                <span className="ai-status">
                    {aiStatus === 'ready' && <span className="status-badge ready">AI分析完了</span>}
                    {aiStatus === 'loading' && <span className="status-badge loading">分析中...</span>}
                    {aiStatus === 'unavailable' && <span className="status-badge fallback">ルールベース分析</span>}
                </span>
            </div>
        </div>
    );
}

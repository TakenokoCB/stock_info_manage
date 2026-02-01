import { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, MessageCircle, Bot, Trophy, RefreshCw, Globe, Flag } from 'lucide-react';
import { screenerAssets, globalScreenerAssets } from '../../data/mockData';
import './Screener.css';

// Type definition for Chrome Built-in AI
declare global {
    interface Window {
        ai: any;
    }
}

type SortField = 'rank' | 'symbol' | 'price' | 'snsBuzz' | 'aiScore' | 'change';
type SortDirection = 'asc' | 'desc';
type MarketTab = 'japan' | 'global';

interface Filters {
    minSnsBuzz: number;
    minAiScore: number;
}

const SCREENER_STORAGE_KEY = 'screener_last_update';
const SCREENER_ANALYSIS_KEY_JP = 'screener_analysis_cache_jp';
const SCREENER_ANALYSIS_KEY_GLOBAL = 'screener_analysis_cache_global';

export default function Screener() {
    const [activeTab, setActiveTab] = useState<MarketTab>('japan');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('aiScore');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        minSnsBuzz: 0,
        minAiScore: 0,
    });
    const [aiReasoningJP, setAiReasoningJP] = useState<Record<string, string>>({});
    const [aiReasoningGlobal, setAiReasoningGlobal] = useState<Record<string, string>>({});
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiStatus, setAiStatus] = useState<'ready' | 'unavailable' | 'loading'>('loading');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // Get current assets based on tab
    const currentAssets = activeTab === 'japan' ? screenerAssets : globalScreenerAssets;
    const currentReasoning = activeTab === 'japan' ? aiReasoningJP : aiReasoningGlobal;
    const currentCacheKey = activeTab === 'japan' ? SCREENER_ANALYSIS_KEY_JP : SCREENER_ANALYSIS_KEY_GLOBAL;

    // Enhanced fallback analysis generator
    const generateFallbackAnalysis = (asset: typeof screenerAssets[0], rank: number, isGlobal: boolean): string => {
        const positives: string[] = [];
        const negatives: string[] = [];
        const sector = asset.sector;

        // AI Score analysis
        if (asset.aiScore >= 85) positives.push(isGlobal ? 'AI Top Pick' : 'AI最高評価');
        else if (asset.aiScore >= 75) positives.push(isGlobal ? 'AI High Score' : 'AI高評価');
        else if (asset.aiScore >= 65) positives.push(isGlobal ? 'AI Moderate' : 'AI中評価');
        else if (asset.aiScore < 60) negatives.push(isGlobal ? 'AI Low Score' : 'AI評価低め');

        // SNS Buzz analysis
        if (asset.snsBuzz >= 80) positives.push(isGlobal ? 'Trending on SNS' : 'SNS急上昇中');
        else if (asset.snsBuzz >= 60) positives.push(isGlobal ? 'SNS Interest' : 'SNS注目');
        else if (asset.snsBuzz < 40) negatives.push(isGlobal ? 'Low SNS Activity' : 'SNS関心薄');

        // Price change analysis
        if (asset.change >= 3) positives.push(isGlobal ? 'Strong Momentum' : '強い上昇モメンタム');
        else if (asset.change >= 1.5) positives.push(isGlobal ? 'Uptrend' : '上昇基調');
        else if (asset.change <= -1.5) negatives.push(isGlobal ? 'Pullback' : '調整局面');

        // Sector-specific comments
        const sectorCommentsJP: Record<string, string> = {
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

        const sectorCommentsEN: Record<string, string> = {
            'Semiconductors': 'AI chip demand driving growth',
            'Software': 'Cloud & AI subscription tailwinds',
            'Consumer Electronics': 'Product cycle momentum',
            'Internet Services': 'Digital ad recovery',
            'Social Media': 'Engagement metrics improving',
            'E-Commerce': 'Margin expansion focus',
            'Electric Vehicles': 'EV adoption accelerating',
            'Pharmaceuticals': 'GLP-1 and pipeline catalysts',
            'Financial Services': 'Transaction volume growth',
            'Healthcare': 'Defensive with steady cash flow',
            'Entertainment': 'Streaming and parks recovery',
            'Retail': 'Consumer resilience',
            'Banking': 'NIM expansion in rate environment',
            'Energy': 'Oil price and dividend yield',
            'Mining': 'Commodity cycle play',
            'Telecom': 'High yield defensive',
            'Aerospace': 'Backlog execution key',
            'IT Services': 'Digital transformation demand',
            'Beverages': 'Stable consumer staple',
            'Apparel': 'Brand strength matters',
            'Restaurants': 'Traffic and pricing power',
            'Automobiles': 'EV transition progress',
            'Luxury Goods': 'China recovery exposure',
        };

        const sectorComments = isGlobal ? sectorCommentsEN : sectorCommentsJP;

        // Build the analysis
        let analysis = '';

        if (rank <= 10) {
            analysis = isGlobal
                ? `【TOP10】${positives.slice(0, 2).join(', ')}. `
                : `【TOP10】${positives.slice(0, 2).join('・')}。`;
        } else if (rank <= 20) {
            analysis = positives.length > 0 ? (isGlobal ? `${positives[0]}. ` : `${positives[0]}。`) : (isGlobal ? 'Stable. ' : '安定推移。');
        } else if (rank <= 35) {
            analysis = positives.length > negatives.length
                ? (isGlobal ? `${positives[0]}. ` : `${positives[0]}。`)
                : (isGlobal ? 'Value play. ' : 'バリュー銘柄として注目。');
        } else {
            analysis = negatives.length > 0
                ? (isGlobal ? `${negatives[0]}. ` : `${negatives[0]}。`)
                : (isGlobal ? 'Hold. ' : '様子見推奨。');
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
    const saveAnalysisCache = (analysis: Record<string, string>, cacheKey: string) => {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(SCREENER_STORAGE_KEY, today);
        localStorage.setItem(cacheKey, JSON.stringify(analysis));
        setLastUpdate(today);
    };

    // Load analysis from cache
    const loadAnalysisCache = (cacheKey: string): Record<string, string> | null => {
        try {
            const cached = localStorage.getItem(cacheKey);
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
        localStorage.removeItem(SCREENER_ANALYSIS_KEY_JP);
        localStorage.removeItem(SCREENER_ANALYSIS_KEY_GLOBAL);
        setAiReasoningJP({});
        setAiReasoningGlobal({});
        runAnalysis('japan');
        runAnalysis('global');
    };

    // Main analysis function
    const runAnalysis = async (market: MarketTab) => {
        const assets = market === 'japan' ? screenerAssets : globalScreenerAssets;
        const cacheKey = market === 'japan' ? SCREENER_ANALYSIS_KEY_JP : SCREENER_ANALYSIS_KEY_GLOBAL;
        const setReasoning = market === 'japan' ? setAiReasoningJP : setAiReasoningGlobal;
        const isGlobal = market === 'global';

        // Sort assets by AI score for ranking
        const rankedAssets = [...assets].sort((a, b) => b.aiScore - a.aiScore);

        // Check cache first
        if (!needsDailyUpdate()) {
            const cached = loadAnalysisCache(cacheKey);
            if (cached && Object.keys(cached).length >= 50) {
                console.log(`Using cached ${market} analysis from today`);
                setReasoning(cached);
                setAiStatus('ready');
                setLastUpdate(localStorage.getItem(SCREENER_STORAGE_KEY) || '');
                return;
            }
        }

        setIsAiLoading(true);
        setAiStatus('loading');
        const newReasoning: Record<string, string> = {};

        // Generate fallback analysis for all stocks
        console.log(`Generating ${market} analysis for ${rankedAssets.length} stocks`);
        rankedAssets.forEach((asset, idx) => {
            newReasoning[asset.id] = generateFallbackAnalysis(asset, idx + 1, isGlobal);
        });

        setReasoning(newReasoning);
        saveAnalysisCache(newReasoning, cacheKey);
        setIsAiLoading(false);
        setAiStatus('ready');
    };

    // Initial load effect
    useEffect(() => {
        runAnalysis('japan');
        runAnalysis('global');
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
        const ranked = [...currentAssets]
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

        // Apply user sort
        if (sortField !== 'rank') {
            const direction = sortDirection === 'asc' ? 1 : -1;
            result.sort((a, b) => {
                const aValue = a[sortField as keyof typeof a];
                const bValue = b[sortField as keyof typeof b];
                return ((aValue as number) - (bValue as number)) * direction;
            });
        } else {
            const direction = sortDirection === 'asc' ? 1 : -1;
            result.sort((a, b) => (a.rank - b.rank) * direction);
        }

        return result;
    }, [searchQuery, sortField, sortDirection, filters, currentAssets]);

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

    const formatPrice = (price: number, isGlobal: boolean) => {
        if (isGlobal) {
            return `$${price.toLocaleString()}`;
        }
        return `¥${price.toLocaleString()}`;
    };

    return (
        <div className="screener card">
            <div className="card-header">
                <div className="screener-title-section">
                    <h3 className="card-title">
                        <Sparkles size={18} />
                        AI高度スクリーナー (50銘柄ランキング)
                    </h3>
                    <div className="screener-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'japan' ? 'active' : ''}`}
                            onClick={() => setActiveTab('japan')}
                        >
                            <Flag size={14} />
                            日本銘柄
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'global' ? 'active' : ''}`}
                            onClick={() => setActiveTab('global')}
                        >
                            <Globe size={14} />
                            世界銘柄
                        </button>
                    </div>
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
                            placeholder={activeTab === 'japan' ? '銘柄検索...' : 'Search stocks...'}
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
                        <label>SNS Min</label>
                        <input
                            type="number"
                            value={filters.minSnsBuzz}
                            onChange={(e) => setFilters(prev => ({ ...prev, minSnsBuzz: Number(e.target.value) }))}
                            placeholder="0"
                        />
                    </div>
                    <div className="filter-group">
                        <label>AI Score Min</label>
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
                                {activeTab === 'japan' ? '順位' : 'Rank'}
                            </SortHeader>
                            <SortHeader field="symbol">{activeTab === 'japan' ? '銘柄' : 'Stock'}</SortHeader>
                            <SortHeader field="price">{activeTab === 'japan' ? '株価' : 'Price'}</SortHeader>
                            <SortHeader field="change">{activeTab === 'japan' ? '騰落率' : 'Change'}</SortHeader>
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
                                {activeTab === 'japan' ? 'AI上昇期待理由' : 'AI Analysis'}
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
                                <td className="price-cell">{formatPrice(asset.price, activeTab === 'global')}</td>
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
                                    {currentReasoning[asset.id] ? (
                                        <span className="ai-text">{currentReasoning[asset.id]}</span>
                                    ) : (
                                        <span className="text-muted text-xs">
                                            {isAiLoading ? (activeTab === 'japan' ? '分析中...' : 'Analyzing...') : '-'}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="screener-footer">
                <span className="result-count">
                    {filteredAndSortedAssets.length}{activeTab === 'japan' ? '銘柄表示' : ' stocks shown'}
                </span>
                <span className="ai-status">
                    {aiStatus === 'ready' && <span className="status-badge ready">{activeTab === 'japan' ? 'AI分析完了' : 'Analysis Complete'}</span>}
                    {aiStatus === 'loading' && <span className="status-badge loading">{activeTab === 'japan' ? '分析中...' : 'Analyzing...'}</span>}
                    {aiStatus === 'unavailable' && <span className="status-badge fallback">{activeTab === 'japan' ? 'ルールベース分析' : 'Rule-based'}</span>}
                </span>
            </div>
        </div>
    );
}

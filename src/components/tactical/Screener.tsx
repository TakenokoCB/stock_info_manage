import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, TrendingUp, TrendingDown, ArrowUpDown, Sparkles, MessageCircle } from 'lucide-react';
import { screenerAssets } from '../../data/mockData';
import './Screener.css';

type SortField = 'symbol' | 'price' | 'per' | 'pbr' | 'dividendYield' | 'snsBuzz' | 'aiScore' | 'change';
type SortDirection = 'asc' | 'desc';

interface Filters {
    minPer: number;
    maxPer: number;
    minPbr: number;
    maxPbr: number;
    minDividend: number;
    minSnsBuzz: number;
    minAiScore: number;
}

export default function Screener() {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortField, setSortField] = useState<SortField>('aiScore');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<Filters>({
        minPer: 0,
        maxPer: 100,
        minPbr: 0,
        maxPbr: 10,
        minDividend: 0,
        minSnsBuzz: 0,
        minAiScore: 0,
    });

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
            // Search filter
            if (searchQuery && !asset.name.includes(searchQuery) && !asset.symbol.includes(searchQuery)) {
                return false;
            }
            // Metric filters
            if (asset.per < filters.minPer || asset.per > filters.maxPer) return false;
            if (asset.pbr < filters.minPbr || asset.pbr > filters.maxPbr) return false;
            if (asset.dividendYield < filters.minDividend) return false;
            if (asset.snsBuzz < filters.minSnsBuzz) return false;
            if (asset.aiScore < filters.minAiScore) return false;
            return true;
        });

        // Sort
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
                    高度なスクリーナー
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
                        <label>PER</label>
                        <div className="filter-range">
                            <input
                                type="number"
                                value={filters.minPer}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPer: Number(e.target.value) }))}
                                placeholder="最小"
                            />
                            <span>〜</span>
                            <input
                                type="number"
                                value={filters.maxPer}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPer: Number(e.target.value) }))}
                                placeholder="最大"
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>PBR</label>
                        <div className="filter-range">
                            <input
                                type="number"
                                value={filters.minPbr}
                                onChange={(e) => setFilters(prev => ({ ...prev, minPbr: Number(e.target.value) }))}
                                placeholder="最小"
                            />
                            <span>〜</span>
                            <input
                                type="number"
                                value={filters.maxPbr}
                                onChange={(e) => setFilters(prev => ({ ...prev, maxPbr: Number(e.target.value) }))}
                                placeholder="最大"
                            />
                        </div>
                    </div>
                    <div className="filter-group">
                        <label>配当利回り</label>
                        <input
                            type="number"
                            value={filters.minDividend}
                            onChange={(e) => setFilters(prev => ({ ...prev, minDividend: Number(e.target.value) }))}
                            placeholder="最小 %"
                        />
                    </div>
                    <div className="filter-group">
                        <label>SNS注目度</label>
                        <input
                            type="number"
                            value={filters.minSnsBuzz}
                            onChange={(e) => setFilters(prev => ({ ...prev, minSnsBuzz: Number(e.target.value) }))}
                            placeholder="最小"
                        />
                    </div>
                    <div className="filter-group">
                        <label>AIスコア</label>
                        <input
                            type="number"
                            value={filters.minAiScore}
                            onChange={(e) => setFilters(prev => ({ ...prev, minAiScore: Number(e.target.value) }))}
                            placeholder="最小"
                        />
                    </div>
                </div>
            )}

            <div className="screener-table-container">
                <table className="screener-table">
                    <thead>
                        <tr>
                            <SortHeader field="symbol">銘柄</SortHeader>
                            <th>セクター</th>
                            <SortHeader field="price">株価</SortHeader>
                            <SortHeader field="change">騰落率</SortHeader>
                            <SortHeader field="per">PER</SortHeader>
                            <SortHeader field="pbr">PBR</SortHeader>
                            <SortHeader field="dividendYield">配当</SortHeader>
                            <SortHeader field="snsBuzz">
                                <MessageCircle size={12} />
                                SNS
                            </SortHeader>
                            <SortHeader field="aiScore">
                                <Sparkles size={12} />
                                AI
                            </SortHeader>
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
                                <td className="sector-cell">{asset.sector}</td>
                                <td className="price-cell">¥{asset.price.toLocaleString()}</td>
                                <td>
                                    <div className={`change-cell ${asset.change >= 0 ? 'positive' : 'negative'}`}>
                                        {asset.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                                    </div>
                                </td>
                                <td className="metric-cell">{asset.per.toFixed(1)}</td>
                                <td className="metric-cell">{asset.pbr.toFixed(1)}</td>
                                <td className="metric-cell highlight">{asset.dividendYield.toFixed(1)}%</td>
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="screener-footer">
                <span className="result-count">{filteredAndSortedAssets.length}件の結果</span>
            </div>
        </div>
    );
}

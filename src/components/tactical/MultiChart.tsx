import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Layers } from 'lucide-react';
import { chartData, ChartDataPoint } from '../../data/mockData';
import './MultiChart.css';

interface ChartAsset {
    id: string;
    label: string;
    dataKey: keyof ChartDataPoint;
    color: string;
}

const availableAssets: ChartAsset[] = [
    { id: 'nikkei', label: '日経平均', dataKey: 'nikkei', color: 'var(--accent-secondary)' },
    { id: 'gold', label: '金 (XAU)', dataKey: 'gold', color: 'var(--accent-warning)' },
    { id: 'btc', label: 'ビットコイン', dataKey: 'bitcoin', color: 'var(--accent-tertiary)' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="chart-tooltip">
                <p className="tooltip-date">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="tooltip-row">
                        <span className="tooltip-dot" style={{ background: entry.color }}></span>
                        <span className="tooltip-name">{entry.name}: </span>
                        <span className="tooltip-value">
                            {entry.value >= 10000
                                ? `¥${entry.value.toLocaleString()}`
                                : entry.value.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function MultiChart() {
    const [selectedAssets, setSelectedAssets] = useState<string[]>(['nikkei', 'gold']);

    const toggleAsset = (assetId: string) => {
        setSelectedAssets(prev =>
            prev.includes(assetId)
                ? prev.filter(id => id !== assetId)
                : [...prev, assetId]
        );
    };

    return (
        <div className="multi-chart card">
            <div className="card-header">
                <h3 className="card-title">
                    <Layers size={18} />
                    マルチチャート
                </h3>
                <div className="chart-controls">
                    {availableAssets.map(asset => (
                        <button
                            key={asset.id}
                            className={`asset-toggle ${selectedAssets.includes(asset.id) ? 'active' : ''}`}
                            onClick={() => toggleAsset(asset.id)}
                            style={{ '--toggle-color': asset.color } as React.CSSProperties}
                        >
                            <span className="toggle-dot" style={{ background: asset.color }}></span>
                            {asset.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                            }}
                        />
                        {selectedAssets.map((assetId, index) => {
                            const asset = availableAssets.find(a => a.id === assetId);
                            if (!asset) return null;
                            return (
                                <YAxis
                                    key={assetId}
                                    yAxisId={index}
                                    orientation={index === 0 ? 'left' : 'right'}
                                    tick={{ fill: asset.color, fontSize: 10 }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                        return value.toString();
                                    }}
                                />
                            );
                        })}
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '15px' }}
                            formatter={(value) => availableAssets.find(a => a.dataKey === value)?.label || value}
                        />
                        {selectedAssets.map((assetId, index) => {
                            const asset = availableAssets.find(a => a.id === assetId);
                            if (!asset) return null;
                            return (
                                <Line
                                    key={assetId}
                                    yAxisId={index}
                                    type="monotone"
                                    dataKey={asset.dataKey}
                                    name={asset.dataKey}
                                    stroke={asset.color}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4, fill: asset.color }}
                                />
                            );
                        })}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="chart-footer">
                <span className="chart-period">過去90日間</span>
                <div className="chart-legend">
                    {selectedAssets.map(assetId => {
                        const asset = availableAssets.find(a => a.id === assetId);
                        if (!asset) return null;
                        const firstValue = chartData[0]?.[asset.dataKey] as number || 0;
                        const lastValue = chartData[chartData.length - 1]?.[asset.dataKey] as number || 0;
                        const change = ((lastValue - firstValue) / firstValue) * 100;
                        return (
                            <div key={assetId} className="legend-item">
                                <TrendingUp size={12} style={{ color: asset.color }} />
                                <span className="legend-label">{asset.label}</span>
                                <span
                                    className={`legend-change ${change >= 0 ? 'positive' : 'negative'}`}
                                    style={{ color: change >= 0 ? 'var(--sentiment-positive)' : 'var(--sentiment-negative)' }}
                                >
                                    {change >= 0 ? '+' : ''}{change.toFixed(1)}%
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

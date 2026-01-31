import { useState, useMemo } from 'react';
import { Target, TrendingUp, Calendar } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import './LifePlanSimulator.css';

interface LifePlanSimulatorProps {
    currentTotalValue?: number;
    currentProfitLoss?: number;
}

interface ProjectionData {
    year: number;
    label: string;
    value: number;
    profitLoss: number;
}

export default function LifePlanSimulator({ currentTotalValue, currentProfitLoss: propProfitLoss }: LifePlanSimulatorProps) {
    const [expectedReturn, setExpectedReturn] = useState(7); // %
    const [projectionYears, setProjectionYears] = useState(30); // years

    // Defaults if prop not provided
    const currentValue = currentTotalValue || 18353236;
    const currentProfitLoss = propProfitLoss || 2489778;
    const acquisitionCost = currentValue - currentProfitLoss;

    // 50年間の予想チャートを生成
    const projectionData = useMemo(() => {
        const data: ProjectionData[] = [];
        const currentYear = new Date().getFullYear();

        for (let i = 0; i <= 50; i++) {
            // 複利計算: FV = PV * (1 + r)^n
            const projectedValue = currentValue * Math.pow(1 + expectedReturn / 100, i);
            const projectedProfitLoss = projectedValue - acquisitionCost;

            data.push({
                year: currentYear + i,
                label: i === 0 ? '現在' : `${i} 年後`,
                value: Math.round(projectedValue),
                profitLoss: Math.round(projectedProfitLoss),
            });
        }

        return data;
    }, [currentValue, acquisitionCost, expectedReturn]);

    // 目標年のデータ
    const targetData = projectionData[projectionYears] || projectionData[projectionData.length - 1];
    const targetProfitLoss = targetData.profitLoss;

    const formatCurrency = (value: number): string => {
        if (Math.abs(value) >= 100000000) {
            return `${(value / 100000000).toFixed(0)} 億円`;
        }
        if (Math.abs(value) >= 10000) {
            return `${(value / 10000).toFixed(0)} 万円`;
        }
        return `¥${Math.round(value).toLocaleString()} `;
    };

    const formatAxisValue = (value: number): string => {
        if (value >= 100000000) return `${(value / 100000000).toFixed(0)} 億`;
        if (value >= 10000) return `${(value / 10000).toFixed(0)} 万`;
        return value.toString();
    };

    const presetYears = [
        { label: '10年', value: 10 },
        { label: '20年', value: 20 },
        { label: '30年', value: 30 },
        { label: '50年', value: 50 },
    ];

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload as ProjectionData;
            return (
                <div className="projection-tooltip">
                    <p className="tooltip-year">{data.year}年 ({data.label})</p>
                    <p className="tooltip-value">評価額: {formatCurrency(data.value)}</p>
                    <p className={`tooltip - pl ${data.profitLoss >= 0 ? 'positive' : 'negative'} `}>
                        含み益: {formatCurrency(data.profitLoss)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="life-plan-simulator card">
            <div className="card-header">
                <h3 className="card-title">
                    <Target size={18} />
                    売却益シミュレーター
                </h3>
            </div>

            <div className="simulator-content">
                <div className="simulator-inputs">
                    <div className="input-group">
                        <label className="input-label">想定年利回り</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input mono"
                                value={expectedReturn}
                                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                                min={1}
                                max={20}
                                step={0.5}
                            />
                            <span className="input-unit">%</span>
                        </div>
                        <input
                            type="range"
                            className="yield-slider"
                            value={expectedReturn}
                            onChange={(e) => setExpectedReturn(Number(e.target.value))}
                            min={1}
                            max={15}
                            step={0.5}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">シミュレーション期間</label>
                        <div className="preset-buttons">
                            {presetYears.map((preset) => (
                                <button
                                    key={preset.value}
                                    className={`preset-btn ${projectionYears === preset.value ? 'active' : ''} `}
                                    onClick={() => setProjectionYears(preset.value)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projection Chart */}
                <div className="projection-chart">
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={projectionData.slice(0, projectionYears + 1)} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--sentiment-positive)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--sentiment-positive)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={{ stroke: 'var(--border-primary)' }}
                                tickLine={false}
                                interval={Math.floor(projectionYears / 5)}
                            />
                            <YAxis
                                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={formatAxisValue}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <ReferenceLine y={acquisitionCost} stroke="var(--text-muted)" strokeDasharray="3 3" />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="var(--sentiment-positive)"
                                fill="url(#profitGradient)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Result Summary */}
                <div className="simulator-results">
                    <div className="result-cards">
                        <div className="result-card">
                            <span className="result-label">
                                <Calendar size={14} />
                                {projectionYears}年後の予想評価額
                            </span>
                            <span className="result-value">{formatCurrency(targetData.value)}</span>
                        </div>
                        <div className="result-card highlight">
                            <span className="result-label">
                                <TrendingUp size={14} />
                                予想含み益（売却益）
                            </span>
                            <span className={`result - value ${targetProfitLoss >= 0 ? 'positive' : 'negative'} `}>
                                {formatCurrency(targetProfitLoss)}
                            </span>
                        </div>
                    </div>
                    <p className="result-note">
                        ※ 年利{expectedReturn}%で複利運用した場合の試算です。実際の運用成績を保証するものではありません。
                    </p>
                </div>
            </div>
        </div>
    );
}

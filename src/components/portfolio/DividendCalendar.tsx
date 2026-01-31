import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DividendEntry } from '../../../data/types';
import './DividendCalendar.css';

interface DividendCalendarProps {
    data: DividendEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload as DividendEntry;
        const total = data.total;

        return (
            <div className="dividend-tooltip">
                <p className="tooltip-label">{label}の配当予測</p>
                <div className="tooltip-total-section">
                    <span className="tooltip-total-label">合計</span>
                    <span className="tooltip-total-value">¥{Math.floor(total).toLocaleString()}</span>
                </div>

                {data.breakdown && (
                    <div className="tooltip-breakdown">
                        <p className="breakdown-header">主な内訳</p>
                        {data.breakdown.map((item, idx) => (
                            <div key={idx} className="breakdown-row">
                                <div className="breakdown-name">
                                    <span className={`dot ${item.type}`}></span>
                                    {item.name}
                                </div>
                                <span className="breakdown-value">¥{Math.floor(item.value).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default function DividendCalendar({ data }: DividendCalendarProps) {
    const annualTotal = data.reduce((sum, d) => sum + d.total, 0);
    const monthlyAverage = annualTotal / 12;

    const formatCurrency = (val: number) => {
        if (val >= 10000) {
            return `¥${Math.floor(val / 10000).toLocaleString()}万`;
        }
        return `¥${Math.floor(val).toLocaleString()}`;
    };

    if (!data || data.length === 0) {
        return (
            <div className="dividend-calendar card p-8 flex items-center justify-center text-muted">
                Loading dividend data...
            </div>
        );
    }

    const maxMonth = data.reduce((max, d) => d.total > max.total ? d : max, data[0]);

    return (
        <div className="dividend-calendar card">
            <div className="card-header">
                <h3 className="card-title">
                    <Calendar className="icon" />
                    配当カレンダー
                </h3>
                <div className="calendar-stats">
                    <div className="stat-item">
                        <span className="stat-label">年間合計</span>
                        <span className="stat-value">{formatCurrency(annualTotal)}</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">月平均</span>
                        <span className="stat-value">{formatCurrency(monthlyAverage)}</span>
                    </div>
                </div>
            </div>

            <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        barGap={0}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-card-border)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="var(--text-muted)"
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="var(--text-muted)"
                            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                        <Legend iconType="circle" />
                        <Bar
                            dataKey="stocks"
                            stackId="a"
                            fill="var(--accent-secondary)"
                            radius={[0, 0, 0, 0]}
                            name="stocks"
                        />
                        <Bar
                            dataKey="staking"
                            stackId="a"
                            fill="var(--accent-primary)"
                            radius={[4, 4, 0, 0]}
                            name="staking"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="calendar-footer">
                <div className="peak-month">
                    <span className="peak-label">配当集中月:</span>
                    <span className="peak-value">{maxMonth.month}</span>
                    <span className="peak-amount">(¥{Math.floor(maxMonth.total).toLocaleString()})</span>
                </div>
            </div>
        </div>
    );
}

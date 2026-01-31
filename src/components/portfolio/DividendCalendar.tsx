import { Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DividendEntry } from '../../data/mockData';
import './DividendCalendar.css';

interface DividendCalendarProps {
    data: DividendEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const stockValue = payload.find((p: any) => p.dataKey === 'stocks')?.value || 0;
        const stakingValue = payload.find((p: any) => p.dataKey === 'staking')?.value || 0;
        const total = stockValue + stakingValue;

        return (
            <div className="dividend-tooltip">
                <p className="tooltip-label">{label}</p>
                <div className="tooltip-row">
                    <span className="tooltip-dot stocks"></span>
                    <span>株式配当: </span>
                    <span className="tooltip-value">¥{stockValue.toLocaleString()}</span>
                </div>
                <div className="tooltip-row">
                    <span className="tooltip-dot staking"></span>
                    <span>ステーキング: </span>
                    <span className="tooltip-value">¥{stakingValue.toLocaleString()}</span>
                </div>
                <div className="tooltip-total">
                    <span>合計: </span>
                    <span className="tooltip-value">¥{total.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};

export default function DividendCalendar({ data }: DividendCalendarProps) {
    const annualTotal = data.reduce((sum, d) => sum + d.total, 0);
    const monthlyAverage = annualTotal / 12;
    const maxMonth = data.reduce((max, d) => d.total > max.total ? d : max, data[0]);

    return (
        <div className="dividend-calendar card">
            <div className="card-header">
                <h3 className="card-title">
                    <Calendar size={18} />
                    配当カレンダー（12ヶ月予測）
                </h3>
                <div className="calendar-stats">
                    <div className="calendar-stat">
                        <span className="stat-value">¥{(annualTotal / 10000).toFixed(1)}万</span>
                        <span className="stat-label">年間合計</span>
                    </div>
                    <div className="calendar-stat">
                        <span className="stat-value">¥{(monthlyAverage / 10000).toFixed(1)}万</span>
                        <span className="stat-label">月平均</span>
                    </div>
                </div>
            </div>

            <div className="calendar-chart">
                <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            axisLine={{ stroke: 'var(--border-primary)' }}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                        <Legend
                            wrapperStyle={{ paddingTop: '10px' }}
                            formatter={(value) => value === 'stocks' ? '株式配当' : 'ステーキング'}
                        />
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
                    <span className="peak-amount">(¥{maxMonth.total.toLocaleString()})</span>
                </div>
            </div>
        </div>
    );
}

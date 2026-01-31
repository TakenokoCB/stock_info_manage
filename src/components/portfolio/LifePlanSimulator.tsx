import { useState } from 'react';
import { Target, Calculator, TrendingUp, ChevronRight } from 'lucide-react';
import './LifePlanSimulator.css';

interface LifePlanSimulatorProps {
    currentMonthlyIncome: number;
}

export default function LifePlanSimulator({ currentMonthlyIncome }: LifePlanSimulatorProps) {
    const [targetIncome, setTargetIncome] = useState(50000);
    const [expectedYield, setExpectedYield] = useState(4);

    const currentAnnualIncome = currentMonthlyIncome * 12;
    const targetAnnualIncome = targetIncome * 12;
    const remainingAnnualIncome = Math.max(0, targetAnnualIncome - currentAnnualIncome);

    // 必要な追加投資額 = 残り年間収入 / (利回り / 100)
    const additionalInvestmentNeeded = expectedYield > 0
        ? remainingAnnualIncome / (expectedYield / 100)
        : 0;

    const progressPercent = Math.min(100, (currentAnnualIncome / targetAnnualIncome) * 100);
    const isGoalAchieved = currentAnnualIncome >= targetAnnualIncome;

    const formatCurrency = (value: number): string => {
        if (value >= 100000000) {
            return `¥${(value / 100000000).toFixed(2)}億`;
        }
        if (value >= 10000) {
            return `¥${(value / 10000).toFixed(1)}万`;
        }
        return `¥${Math.round(value).toLocaleString()}`;
    };

    const presetGoals = [
        { label: '月3万円', value: 30000 },
        { label: '月5万円', value: 50000 },
        { label: '月10万円', value: 100000 },
        { label: '月20万円', value: 200000 },
    ];

    return (
        <div className="life-plan-simulator card">
            <div className="card-header">
                <h3 className="card-title">
                    <Target size={18} />
                    ライフプラン・シミュレーター
                </h3>
            </div>

            <div className="simulator-content">
                <div className="simulator-inputs">
                    <div className="input-group">
                        <label className="input-label">目標月額配当</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input mono"
                                value={targetIncome}
                                onChange={(e) => setTargetIncome(Number(e.target.value))}
                                min={0}
                                step={10000}
                            />
                            <span className="input-unit">円/月</span>
                        </div>
                        <div className="preset-buttons">
                            {presetGoals.map((preset) => (
                                <button
                                    key={preset.value}
                                    className={`preset-btn ${targetIncome === preset.value ? 'active' : ''}`}
                                    onClick={() => setTargetIncome(preset.value)}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">想定利回り</label>
                        <div className="input-with-unit">
                            <input
                                type="number"
                                className="input mono"
                                value={expectedYield}
                                onChange={(e) => setExpectedYield(Number(e.target.value))}
                                min={0}
                                max={20}
                                step={0.5}
                            />
                            <span className="input-unit">%</span>
                        </div>
                        <input
                            type="range"
                            className="yield-slider"
                            value={expectedYield}
                            onChange={(e) => setExpectedYield(Number(e.target.value))}
                            min={1}
                            max={10}
                            step={0.5}
                        />
                    </div>
                </div>

                <div className="simulator-results">
                    <div className="progress-section">
                        <div className="progress-header">
                            <span className="progress-label">目標達成率</span>
                            <span className={`progress-value ${isGoalAchieved ? 'achieved' : ''}`}>
                                {progressPercent.toFixed(1)}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${isGoalAchieved ? 'achieved' : ''}`}
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="progress-comparison">
                            <div className="comparison-item">
                                <span className="comparison-label">現在</span>
                                <span className="comparison-value">{formatCurrency(currentMonthlyIncome)}/月</span>
                            </div>
                            <ChevronRight size={16} className="comparison-arrow" />
                            <div className="comparison-item">
                                <span className="comparison-label">目標</span>
                                <span className="comparison-value target">{formatCurrency(targetIncome)}/月</span>
                            </div>
                        </div>
                    </div>

                    {!isGoalAchieved && (
                        <div className="investment-needed">
                            <div className="needed-header">
                                <Calculator size={16} />
                                <span>目標達成に必要な追加投資</span>
                            </div>
                            <div className="needed-value">
                                {formatCurrency(additionalInvestmentNeeded)}
                            </div>
                            <p className="needed-explanation">
                                利回り{expectedYield}%で運用した場合、上記の追加投資により、
                                月{formatCurrency(targetIncome - currentMonthlyIncome)}の配当増が見込めます。
                            </p>
                        </div>
                    )}

                    {isGoalAchieved && (
                        <div className="goal-achieved">
                            <TrendingUp size={24} />
                            <span>おめでとうございます！目標達成しています</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

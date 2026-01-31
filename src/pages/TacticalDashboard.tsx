import MultiChart from '../components/tactical/MultiChart';
import Screener from '../components/tactical/Screener';
import CorrelationMatrix from '../components/tactical/CorrelationMatrix';
import { correlationMatrix, screenerAssets } from '../data/mockData';
import './TacticalDashboard.css';

export default function TacticalDashboard() {
    return (
        <div className="tactical-dashboard">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Tactical Dashboard</h1>
                    <p className="page-subtitle">相関分析 & スクリーナー</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value">{screenerAssets.length}</span>
                        <span className="quick-stat-label">スクリーニング対象</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">5</span>
                        <span className="quick-stat-label">相関分析資産</span>
                    </div>
                </div>
            </header>

            <div className="tactical-grid">
                <div className="tactical-chart">
                    <MultiChart />
                </div>
                <div className="tactical-matrix">
                    <CorrelationMatrix data={correlationMatrix} />
                </div>
                <div className="tactical-screener">
                    <Screener />
                </div>
            </div>
        </div>
    );
}

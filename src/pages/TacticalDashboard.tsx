import Screener from '../components/tactical/Screener';
import { screenerAssets, globalScreenerAssets } from '../data/mockData';
import './TacticalDashboard.css';

export default function TacticalDashboard() {
    const totalStocks = screenerAssets.length + globalScreenerAssets.length;

    return (
        <div className="tactical-dashboard">
            <header className="page-header">
                <div className="page-title-section">
                    <h1 className="page-title">Tactical Dashboard</h1>
                    <p className="page-subtitle">AI銘柄スクリーナー</p>
                </div>
                <div className="page-stats">
                    <div className="quick-stat">
                        <span className="quick-stat-value">{screenerAssets.length}</span>
                        <span className="quick-stat-label">日本銘柄</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">{globalScreenerAssets.length}</span>
                        <span className="quick-stat-label">世界銘柄</span>
                    </div>
                    <div className="quick-stat">
                        <span className="quick-stat-value">{totalStocks}</span>
                        <span className="quick-stat-label">合計スクリーニング対象</span>
                    </div>
                </div>
            </header>

            <div className="tactical-grid-simple">
                <div className="tactical-screener-full">
                    <Screener />
                </div>
            </div>
        </div>
    );
}

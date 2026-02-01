import {
    Briefcase,
    Newspaper,
    Activity,
    Target
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
}

const navItems = [
    {
        id: 'portfolio',
        label: 'Portfolio Simulator',
        labelJa: 'ポートフォリオ',
        icon: Briefcase,
        description: '配当・将来予測',
    },
    {
        id: 'market',
        label: 'Market Intelligence',
        labelJa: 'AI分析',
        icon: Newspaper,
        description: 'ニュース・センチメント分析',
    },
    {
        id: 'tactical',
        label: 'Tactical Dashboard',
        labelJa: '戦略ダッシュボード',
        icon: Target,
        description: '相関分析・スクリーナー',
    },
];

import { useState, useEffect } from 'react';
import { getMarketStatus, MarketInfo } from '../../utils/marketHours';

// ... (existing imports)

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
    const [marketInfo, setMarketInfo] = useState<MarketInfo[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Initial fetch
        setMarketInfo(getMarketStatus());

        // Update status every minute
        const statusTimer = setInterval(() => {
            setMarketInfo(getMarketStatus());
        }, 60000);

        // Cycle display every 3 seconds
        const cycleTimer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % 3); // Cycle 0, 1, 2
        }, 4000);

        return () => {
            clearInterval(statusTimer);
            clearInterval(cycleTimer);
        };
    }, []);

    const currentMarket = marketInfo[currentIndex] || { name: 'Loading...', status: 'closed' };
    const isMarketOpen = currentMarket.status === 'open';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <Activity className="logo-icon" />
                    <div className="logo-text">
                        <span className="logo-title">FinAnalytics</span>
                        <span className="logo-subtitle">Pro Terminal</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">メインメニュー</span>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                            onClick={() => onPageChange(item.id)}
                        >
                            <item.icon className="nav-icon" />
                            <div className="nav-content">
                                <span className="nav-label">{item.labelJa}</span>
                                <span className="nav-description">{item.description}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="market-status">
                    <span className={`status-indicator ${isMarketOpen ? 'live' : 'closed'}`}></span>
                    <span className="status-text">
                        {currentMarket.name} {isMarketOpen ? '開場中' : '閉場'}
                    </span>
                </div>
                <div className="last-update">
                    最終更新: {new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </aside>
    );
}

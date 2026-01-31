import {
    LayoutDashboard,
    LineChart,
    Briefcase,
    TrendingUp,
    Newspaper,
    PieChart,
    Activity,
    BarChart3,
    Target
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
    activePage: string;
    onPageChange: (page: string) => void;
}

const navItems = [
    {
        id: 'market',
        label: 'Market Intelligence',
        labelJa: 'AI分析',
        icon: Newspaper,
        description: 'ニュース・センチメント分析',
    },
    {
        id: 'portfolio',
        label: 'Portfolio Simulator',
        labelJa: 'ポートフォリオ',
        icon: Briefcase,
        description: '配当・将来予測',
    },
    {
        id: 'tactical',
        label: 'Tactical Dashboard',
        labelJa: '戦略ダッシュボード',
        icon: Target,
        description: '相関分析・スクリーナー',
    },
];

export default function Sidebar({ activePage, onPageChange }: SidebarProps) {
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
                    <span className="status-indicator live"></span>
                    <span className="status-text">東証 開場中</span>
                </div>
                <div className="last-update">
                    最終更新: {new Date().toLocaleTimeString('ja-JP')}
                </div>
            </div>
        </aside>
    );
}

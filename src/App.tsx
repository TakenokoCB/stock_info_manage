import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/common/Sidebar';
import LoginPage from './pages/LoginPage';
import MarketIntelligence from './pages/MarketIntelligence';
import PortfolioSimulator from './pages/PortfolioSimulator';
import TacticalDashboard from './pages/TacticalDashboard';
import './App.css';

type PageType = 'market' | 'portfolio' | 'tactical';

function AppContent() {
    const [activePage, setActivePage] = useState<PageType>('market');
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginPage />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'market':
                return <MarketIntelligence />;
            case 'portfolio':
                return <PortfolioSimulator />;
            case 'tactical':
                return <TacticalDashboard />;
            default:
                return <MarketIntelligence />;
        }
    };

    return (
        <div className="app-container">
            <Sidebar activePage={activePage} onPageChange={(page) => setActivePage(page as PageType)} />
            <main className="main-content">
                <div className="page-container">
                    {renderPage()}
                </div>
            </main>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

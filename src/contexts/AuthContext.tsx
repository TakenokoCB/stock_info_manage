import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoginEnabled: boolean;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = 'finanalytics_session';

// Check if login is enabled from environment variable
const isLoginEnabled = import.meta.env.VITE_LOGIN_ENABLED === 'true';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(!isLoginEnabled);

    useEffect(() => {
        if (!isLoginEnabled) {
            // Login disabled, always authenticated
            setIsAuthenticated(true);
            return;
        }

        // Check for existing session
        const session = localStorage.getItem(SESSION_KEY);
        if (session === 'authenticated') {
            setIsAuthenticated(true);
        }
    }, []);

    const login = (username: string, password: string): boolean => {
        const validUsername = import.meta.env.VITE_LOGIN_USERNAME;
        const validPassword = import.meta.env.VITE_LOGIN_PASSWORD;

        if (username === validUsername && password === validPassword) {
            setIsAuthenticated(true);
            localStorage.setItem(SESSION_KEY, 'authenticated');
            return true;
        }
        return false;
    };

    const logout = () => {
        if (!isLoginEnabled) return; // Can't logout if login is disabled
        setIsAuthenticated(false);
        localStorage.removeItem(SESSION_KEY);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoginEnabled, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

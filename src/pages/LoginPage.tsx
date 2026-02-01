import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Lock, User, AlertCircle, LogIn, Shield } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        const success = login(username, password);

        if (!success) {
            setError('ユーザー名またはパスワードが正しくありません');
        }

        setIsLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-gradient" />
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Shield size={40} />
                        </div>
                        <h1 className="login-title">FinAnalytics</h1>
                        <p className="login-subtitle">統合型多機能分析プラットフォーム</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {error && (
                            <div className="login-error">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">
                                <User size={16} />
                                ユーザー名
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ユーザー名を入力"
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Lock size={16} />
                                パスワード
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワードを入力"
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="login-loading">認証中...</span>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    ログイン
                                </>
                            )}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>セキュアな接続で保護されています</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

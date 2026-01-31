// Mock Data for Financial Analysis Platform
// ダミーデータ（API統合可能な構造）

export interface Asset {
    id: string;
    symbol: string;
    name: string;
    nameJa: string;
    type: 'stock' | 'crypto' | 'commodity';
    price: number;
    change24h: number;
    changePercent24h: number;
    volume24h: number;
    marketCap?: number;
    high24h: number;
    low24h: number;
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string[];
    source: string;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    relatedAssets: string[];
    aiScore: number;
}

export interface SentimentData {
    assetId: string;
    symbol: string;
    twitterMentions: number;
    redditMentions: number;
    overallSentiment: number; // -100 to 100
    changeFromYesterday: number;
    trending: boolean;
}

export interface PortfolioAsset {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'commodity';
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    dividendYield?: number;
    stakingApr?: number;
    nextDividendDate?: string;
}

export interface DividendEntry {
    month: string;
    stocks: number;
    staking: number;
    total: number;
}

export interface ScreenerAsset {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    price: number;
    per: number;
    pbr: number;
    dividendYield: number;
    snsBuzz: number;
    aiScore: number;
    change24h: number;
}

export interface CorrelationData {
    asset1: string;
    asset2: string;
    correlation: number;
}

export interface ChartDataPoint {
    date: string;
    value: number;
    value2?: number;
}

// ========================================
// WATCHLIST DATA
// ========================================

export const watchlistAssets: Asset[] = [
    {
        id: 'nikkei225',
        symbol: 'N225',
        name: 'Nikkei 225',
        nameJa: '日経平均株価',
        type: 'stock',
        price: 38547.25,
        change24h: 285.50,
        changePercent24h: 0.75,
        volume24h: 2500000000,
        high24h: 38612.00,
        low24h: 38245.00,
    },
    {
        id: 'topix',
        symbol: 'TOPIX',
        name: 'TOPIX',
        nameJa: '東証株価指数',
        type: 'stock',
        price: 2734.82,
        change24h: 18.45,
        changePercent24h: 0.68,
        volume24h: 1800000000,
        high24h: 2740.00,
        low24h: 2715.00,
    },
    {
        id: 'toyota',
        symbol: '7203',
        name: 'Toyota Motor',
        nameJa: 'トヨタ自動車',
        type: 'stock',
        price: 2847.50,
        change24h: -32.50,
        changePercent24h: -1.13,
        volume24h: 8500000,
        marketCap: 46000000000000,
        high24h: 2890.00,
        low24h: 2838.00,
    },
    {
        id: 'sony',
        symbol: '6758',
        name: 'Sony Group',
        nameJa: 'ソニーグループ',
        type: 'stock',
        price: 3125.00,
        change24h: 45.00,
        changePercent24h: 1.46,
        volume24h: 5200000,
        marketCap: 19200000000000,
        high24h: 3145.00,
        low24h: 3080.00,
    },
    {
        id: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        nameJa: 'ビットコイン',
        type: 'crypto',
        price: 6478500,
        change24h: 125000,
        changePercent24h: 1.97,
        volume24h: 4200000000000,
        marketCap: 127000000000000,
        high24h: 6520000,
        low24h: 6350000,
    },
    {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        nameJa: 'イーサリアム',
        type: 'crypto',
        price: 342500,
        change24h: -5200,
        changePercent24h: -1.49,
        volume24h: 1800000000000,
        marketCap: 41200000000000,
        high24h: 350000,
        low24h: 338000,
    },
    {
        id: 'gold',
        symbol: 'XAU',
        name: 'Gold',
        nameJa: '金',
        type: 'commodity',
        price: 12450,
        change24h: 85,
        changePercent24h: 0.69,
        volume24h: 0,
        high24h: 12480,
        low24h: 12360,
    },
    {
        id: 'silver',
        symbol: 'XAG',
        name: 'Silver',
        nameJa: '銀',
        type: 'commodity',
        price: 152.30,
        change24h: 2.15,
        changePercent24h: 1.43,
        volume24h: 0,
        high24h: 153.50,
        low24h: 150.00,
    },
];

// ========================================
// NEWS DATA
// ========================================

export const newsItems: NewsItem[] = [
    {
        id: 'news-1',
        title: 'トヨタ自動車、EV販売目標を上方修正 2025年度は150万台へ',
        summary: [
            'トヨタが2025年度のEV販売目標を従来比20%増の150万台に上方修正',
            '北米・欧州市場での需要増加が背景、中国市場も回復基調',
            '新型バッテリー技術の量産開始で競争力強化を狙う',
        ],
        source: '日経新聞',
        timestamp: '2026-02-01T02:30:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['7203', 'N225'],
        aiScore: 85,
    },
    {
        id: 'news-2',
        title: 'ビットコイン、7万ドル突破 機関投資家の買い加速',
        summary: [
            'BTCが24時間で2%上昇、7万ドルの節目を突破',
            'ETF資金流入が継続、機関投資家の長期保有意欲が高まる',
            'ドル安傾向もリスク資産への追い風に',
        ],
        source: 'CoinDesk Japan',
        timestamp: '2026-02-01T01:45:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['BTC', 'ETH'],
        aiScore: 78,
    },
    {
        id: 'news-3',
        title: '日銀、金融政策維持も追加利上げ示唆 市場は警戒モード',
        summary: [
            '日銀が政策金利0.5%据え置きを決定',
            '総裁会見で追加利上げの可能性に言及、市場は円高に反応',
            '輸出関連銘柄に売り圧力、内需株に資金シフトの動き',
        ],
        source: 'Bloomberg',
        timestamp: '2026-02-01T00:15:00+09:00',
        sentiment: 'negative',
        relatedAssets: ['N225', 'TOPIX', '7203'],
        aiScore: 72,
    },
    {
        id: 'news-4',
        title: '金価格、1オンス2,100ドル台で推移 地政学リスクで安全資産需要',
        summary: [
            '金先物が2,100ドル台を維持、年初来高値圏',
            '中東情勢の不透明感から安全資産への資金流入が継続',
            'インフレヘッジとしても機関投資家が注目',
        ],
        source: 'ロイター',
        timestamp: '2026-01-31T23:30:00+09:00',
        sentiment: 'neutral',
        relatedAssets: ['XAU', 'XAG'],
        aiScore: 65,
    },
    {
        id: 'news-5',
        title: 'ソニー、ゲーム事業好調で通期予想を上方修正',
        summary: [
            'PS5ソフト売上が計画を大幅上回る、ネットワークサービス収益も拡大',
            '通期営業利益予想を前回比8%増に修正',
            '映画・音楽部門も堅調、エンタメ事業全体が牽引',
        ],
        source: '日経新聞',
        timestamp: '2026-01-31T22:00:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['6758'],
        aiScore: 88,
    },
];

// ========================================
// SENTIMENT DATA
// ========================================

export const sentimentData: SentimentData[] = [
    { assetId: 'btc', symbol: 'BTC', twitterMentions: 45200, redditMentions: 8900, overallSentiment: 72, changeFromYesterday: 15, trending: true },
    { assetId: 'eth', symbol: 'ETH', twitterMentions: 28400, redditMentions: 5600, overallSentiment: 58, changeFromYesterday: -8, trending: false },
    { assetId: 'toyota', symbol: '7203', twitterMentions: 12300, redditMentions: 890, overallSentiment: 45, changeFromYesterday: 22, trending: true },
    { assetId: 'sony', symbol: '6758', twitterMentions: 18900, redditMentions: 2100, overallSentiment: 81, changeFromYesterday: 35, trending: true },
    { assetId: 'gold', symbol: 'XAU', twitterMentions: 8700, redditMentions: 1200, overallSentiment: 55, changeFromYesterday: 5, trending: false },
    { assetId: 'nikkei225', symbol: 'N225', twitterMentions: 15600, redditMentions: 980, overallSentiment: 38, changeFromYesterday: -12, trending: false },
    { assetId: 'silver', symbol: 'XAG', twitterMentions: 4200, redditMentions: 650, overallSentiment: 62, changeFromYesterday: 18, trending: false },
    { assetId: 'topix', symbol: 'TOPIX', twitterMentions: 6800, redditMentions: 420, overallSentiment: 42, changeFromYesterday: -5, trending: false },
];

// ========================================
// PORTFOLIO DATA
// ========================================

export const portfolioAssets: PortfolioAsset[] = [
    { id: '7203', symbol: '7203', name: 'トヨタ自動車', type: 'stock', quantity: 300, avgPrice: 2650, currentPrice: 2847.50, dividendYield: 2.8, nextDividendDate: '2026-03-31' },
    { id: '6758', symbol: '6758', name: 'ソニーグループ', type: 'stock', quantity: 100, avgPrice: 2980, currentPrice: 3125.00, dividendYield: 0.6, nextDividendDate: '2026-03-31' },
    { id: '8306', symbol: '8306', name: '三菱UFJ FG', type: 'stock', quantity: 500, avgPrice: 1150, currentPrice: 1285.00, dividendYield: 3.2, nextDividendDate: '2026-03-31' },
    { id: '9432', symbol: '9432', name: 'NTT', type: 'stock', quantity: 1000, avgPrice: 168, currentPrice: 175.50, dividendYield: 3.0, nextDividendDate: '2026-03-31' },
    { id: 'btc', symbol: 'BTC', name: 'ビットコイン', type: 'crypto', quantity: 0.5, avgPrice: 5500000, currentPrice: 6478500, stakingApr: 0 },
    { id: 'eth', symbol: 'ETH', name: 'イーサリアム', type: 'crypto', quantity: 3, avgPrice: 320000, currentPrice: 342500, stakingApr: 4.2 },
    { id: 'gold', symbol: 'XAU', name: '金', type: 'commodity', quantity: 100, avgPrice: 11800, currentPrice: 12450 },
];

// ========================================
// DIVIDEND CALENDAR DATA
// ========================================

export const dividendCalendar: DividendEntry[] = [
    { month: '2月', stocks: 0, staking: 3580, total: 3580 },
    { month: '3月', stocks: 42500, staking: 3620, total: 46120 },
    { month: '4月', stocks: 0, staking: 3650, total: 3650 },
    { month: '5月', stocks: 0, staking: 3680, total: 3680 },
    { month: '6月', stocks: 15200, staking: 3710, total: 18910 },
    { month: '7月', stocks: 0, staking: 3740, total: 3740 },
    { month: '8月', stocks: 0, staking: 3770, total: 3770 },
    { month: '9月', stocks: 38600, staking: 3800, total: 42400 },
    { month: '10月', stocks: 0, staking: 3830, total: 3830 },
    { month: '11月', stocks: 0, staking: 3860, total: 3860 },
    { month: '12月', stocks: 28400, staking: 3890, total: 32290 },
    { month: '1月', stocks: 0, staking: 3920, total: 3920 },
];

// ========================================
// SCREENER DATA
// ========================================

export const screenerAssets: ScreenerAsset[] = [
    { id: '7203', symbol: '7203', name: 'トヨタ自動車', sector: '輸送用機器', price: 2847.50, per: 9.2, pbr: 1.1, dividendYield: 2.8, snsBuzz: 68, aiScore: 82, change24h: -1.13 },
    { id: '6758', symbol: '6758', name: 'ソニーグループ', sector: '電気機器', price: 3125.00, per: 16.5, pbr: 2.3, dividendYield: 0.6, snsBuzz: 85, aiScore: 88, change24h: 1.46 },
    { id: '8306', symbol: '8306', name: '三菱UFJ FG', sector: '銀行', price: 1285.00, per: 10.8, pbr: 0.7, dividendYield: 3.2, snsBuzz: 45, aiScore: 72, change24h: 0.55 },
    { id: '9432', symbol: '9432', name: 'NTT', sector: '通信', price: 175.50, per: 11.2, pbr: 1.4, dividendYield: 3.0, snsBuzz: 52, aiScore: 75, change24h: -0.28 },
    { id: '6861', symbol: '6861', name: 'キーエンス', sector: '電気機器', price: 68500.00, per: 38.5, pbr: 6.2, dividendYield: 0.3, snsBuzz: 62, aiScore: 90, change24h: 2.15 },
    { id: '9983', symbol: '9983', name: 'ファーストリテイリング', sector: '小売業', price: 42850.00, per: 35.2, pbr: 5.8, dividendYield: 0.9, snsBuzz: 78, aiScore: 85, change24h: 0.82 },
    { id: '4063', symbol: '4063', name: '信越化学工業', sector: '化学', price: 5420.00, per: 14.2, pbr: 2.1, dividendYield: 2.2, snsBuzz: 38, aiScore: 79, change24h: -0.65 },
    { id: '7974', symbol: '7974', name: '任天堂', sector: 'その他製品', price: 8250.00, per: 18.8, pbr: 3.5, dividendYield: 2.5, snsBuzz: 92, aiScore: 86, change24h: 1.88 },
];

// ========================================
// CORRELATION DATA
// ========================================

export const correlationMatrix: CorrelationData[] = [
    { asset1: 'N225', asset2: 'N225', correlation: 1.00 },
    { asset1: 'N225', asset2: 'TOPIX', correlation: 0.98 },
    { asset1: 'N225', asset2: 'BTC', correlation: 0.35 },
    { asset1: 'N225', asset2: 'XAU', correlation: -0.15 },
    { asset1: 'N225', asset2: 'USD/JPY', correlation: 0.72 },
    { asset1: 'TOPIX', asset2: 'TOPIX', correlation: 1.00 },
    { asset1: 'TOPIX', asset2: 'BTC', correlation: 0.32 },
    { asset1: 'TOPIX', asset2: 'XAU', correlation: -0.12 },
    { asset1: 'TOPIX', asset2: 'USD/JPY', correlation: 0.68 },
    { asset1: 'BTC', asset2: 'BTC', correlation: 1.00 },
    { asset1: 'BTC', asset2: 'XAU', correlation: 0.22 },
    { asset1: 'BTC', asset2: 'USD/JPY', correlation: 0.18 },
    { asset1: 'XAU', asset2: 'XAU', correlation: 1.00 },
    { asset1: 'XAU', asset2: 'USD/JPY', correlation: -0.45 },
    { asset1: 'USD/JPY', asset2: 'USD/JPY', correlation: 1.00 },
];

// ========================================
// CHART DATA
// ========================================

export const generateChartData = (days: number, baseValue: number, volatility: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    let value = baseValue;

    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const change = (Math.random() - 0.5) * volatility;
        value = value * (1 + change);
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 100) / 100,
        });
    }

    return data;
};

export const nikkeiChartData = generateChartData(90, 37500, 0.015);
export const btcChartData = generateChartData(90, 5800000, 0.035);
export const goldChartData = generateChartData(90, 11800, 0.008);

// Dual chart data for correlation view
export const dualChartData: ChartDataPoint[] = nikkeiChartData.map((point, index) => ({
    ...point,
    value2: goldChartData[index]?.value || 0,
}));

// Mock Data - ポートフォリオデータと連携するモックデータ
// 市場分析・戦術ダッシュボード用のデータ

import { storedPortfolioAssets } from '../../data/portfolioData';
import { hydrateAsset } from '../services/marketData';
import type { Portfolio, PortfolioAsset, DividendEntry } from '../../data/types';

// Reconstruct Hydrated Portfolio from Stored Data (Synchronous Mock)
const hydratedAssets: PortfolioAsset[] = storedPortfolioAssets.map(hydrateAsset);

const calculateSummary = (assets: PortfolioAsset[]) => {
    let totalMarketValue = 0;
    let totalProfitLoss = 0;

    assets.forEach(asset => {
        if (asset.type === 'foreign_stock') {
            totalMarketValue += asset.marketValueJpy;
            totalProfitLoss += asset.profitLossJpy;
        } else {
            totalMarketValue += asset.marketValue;
            totalProfitLoss += asset.profitLoss;
        }
    });

    const totalProfitLossPercent = totalMarketValue - totalProfitLoss > 0
        ? (totalProfitLoss / (totalMarketValue - totalProfitLoss)) * 100
        : 0;

    return {
        totalMarketValue,
        totalProfitLoss,
        totalProfitLossPercent: Number(totalProfitLossPercent.toFixed(2)),
    };
};

export const portfolioData: Portfolio = {
    updatedAt: new Date().toISOString(),
    assets: hydratedAssets,
    summary: calculateSummary(hydratedAssets),
};

// ===== 型定義 =====

// ===== 型定義 =====
export interface Asset {
    id: string;
    symbol: string;
    name: string;
    nameJa: string;
    type: 'stock' | 'crypto' | 'commodity' | 'bond' | 'trust';
    price: number;
    change24h: number;
    changePercent24h: number;
    volume24h: number;
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
    overallSentiment: number;
    changeFromYesterday: number;
    trending: boolean;
}

export interface PortfolioAssetLegacy {
    id: string;
    symbol: string;
    name: string;
    type: 'stock' | 'crypto' | 'commodity' | 'bond' | 'trust';
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    totalValue: number;
    profitLoss: number;
    profitLossPercent: number;
    annualIncome?: number;
    broker: string;
    account: string;
}

// Duplicate DividendEntry definition removed

export interface ScreenerAsset {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    per: number;
    pbr: number;
    dividendYield: number;
    snsBuzz: number;
    aiScore: number;
    price: number;
    change: number;
}

export interface CorrelationData {
    assets: string[];
    matrix: number[][];
}

export interface ChartDataPoint {
    date: string;
    nikkei: number;
    gold: number;
    bitcoin: number;
}

// ===== ポートフォリオデータから変換 =====
function convertToLegacyAssets(portfolio: Portfolio): PortfolioAssetLegacy[] {
    return portfolio.assets.map((asset, index) => {
        const base = {
            id: `asset-${index}`,
            broker: 'broker' in asset ? asset.broker : 'other',
            account: 'account' in asset ? asset.account : 'general',
        };

        switch (asset.type) {
            case 'domestic_stock':
                return {
                    ...base,
                    symbol: asset.code,
                    name: asset.name,
                    type: 'stock' as const,
                    quantity: asset.quantity,
                    avgPrice: asset.avgPrice,
                    currentPrice: asset.currentPrice,
                    totalValue: asset.marketValue,
                    profitLoss: asset.profitLoss,
                    profitLossPercent: asset.profitLossPercent,
                    annualIncome: 0,
                };
            case 'foreign_stock':
                return {
                    ...base,
                    symbol: asset.ticker,
                    name: asset.name,
                    type: 'stock' as const,
                    quantity: asset.quantity,
                    avgPrice: asset.avgPriceUsd,
                    currentPrice: asset.currentPriceUsd,
                    totalValue: asset.marketValueJpy,
                    profitLoss: asset.profitLossJpy,
                    profitLossPercent: (asset.profitLossJpy / (asset.marketValueJpy - asset.profitLossJpy)) * 100,
                    annualIncome: 0,
                };
            case 'investment_trust':
                return {
                    ...base,
                    symbol: asset.name.slice(0, 10),
                    name: asset.name,
                    type: 'trust' as const,
                    quantity: asset.units,
                    avgPrice: asset.avgNavPrice,
                    currentPrice: asset.currentNavPrice,
                    totalValue: asset.marketValue,
                    profitLoss: asset.profitLoss,
                    profitLossPercent: asset.profitLossPercent,
                    annualIncome: 0,
                };
            case 'crypto':
                return {
                    ...base,
                    symbol: asset.symbol,
                    name: asset.name,
                    type: 'crypto' as const,
                    quantity: asset.quantity,
                    avgPrice: asset.avgPrice,
                    currentPrice: asset.currentPrice,
                    totalValue: asset.marketValue,
                    profitLoss: asset.profitLoss,
                    profitLossPercent: asset.marketValue - asset.profitLoss !== 0 ? (asset.profitLoss / (asset.marketValue - asset.profitLoss)) * 100 : 0,
                    annualIncome: 0,
                };
            case 'bond':
                return {
                    ...base,
                    symbol: 'BOND',
                    name: asset.name,
                    type: 'bond' as const,
                    quantity: asset.faceValue,
                    avgPrice: asset.acquisitionCost / asset.faceValue,
                    currentPrice: asset.marketValue / asset.faceValue,
                    totalValue: asset.marketValue,
                    profitLoss: asset.profitLoss,
                    profitLossPercent: asset.profitLossPercent,
                    annualIncome: 0,
                };
            default:
                return {
                    ...base,
                    id: `unknown-${index}`,
                    symbol: 'UNKNOWN',
                    name: 'Unknown Asset',
                    type: 'stock' as const,
                    quantity: 0,
                    avgPrice: 0,
                    currentPrice: 0,
                    totalValue: 0,
                    profitLoss: 0,
                    profitLossPercent: 0,
                };
        }
    });
}

// ===== エクスポートデータ =====
export const portfolioAssets: PortfolioAssetLegacy[] = convertToLegacyAssets(portfolioData);

export const portfolioSummary = portfolioData.summary;

// ===== ウォッチリスト（主要指数 + 保有銘柄） =====
export const watchlistAssets: Asset[] = [
    {
        id: 'nikkei',
        symbol: 'N225',
        name: 'Nikkei 225',
        nameJa: '日経平均株価',
        type: 'stock',
        price: 38547.25,
        change24h: 215.45,
        changePercent24h: 0.56,
        volume24h: 1250000000,
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
        change24h: 12.35,
        changePercent24h: 0.45,
        volume24h: 980000000,
        high24h: 2742.00,
        low24h: 2718.00,
    },
    {
        id: 'btc',
        symbol: 'BTC',
        name: 'Bitcoin',
        nameJa: 'ビットコイン',
        type: 'crypto',
        price: 15234000,
        change24h: 324000,
        changePercent24h: 2.18,
        volume24h: 45000000000,
        high24h: 15450000,
        low24h: 14890000,
    },
    {
        id: 'eth',
        symbol: 'ETH',
        name: 'Ethereum',
        nameJa: 'イーサリアム',
        type: 'crypto',
        price: 412000,
        change24h: -8200,
        changePercent24h: -1.95,
        volume24h: 18000000000,
        high24h: 425000,
        low24h: 408000,
    },
    {
        id: 'gold',
        symbol: 'XAU',
        name: 'Gold',
        nameJa: '金',
        type: 'commodity',
        price: 12850,
        change24h: 45,
        changePercent24h: 0.35,
        volume24h: 85000000,
        high24h: 12890,
        low24h: 12780,
    },
    {
        id: 'usdjpy',
        symbol: 'USD/JPY',
        name: 'US Dollar / Japanese Yen',
        nameJa: 'ドル円',
        type: 'commodity',
        price: 154.78,
        change24h: 0.23,
        changePercent24h: 0.15,
        volume24h: 125000000000,
        high24h: 155.12,
        low24h: 154.35,
    },
];

// ===== ニュースフィード =====
export const newsItems: NewsItem[] = [
    {
        id: 'news-1',
        title: 'トヨタ自動車、EV販売目標を上方修正 2025年度は150万台へ',
        summary: [
            'トヨタはEV販売目標を従来の120万台から150万台に上方修正',
            '北米・欧州市場での需要増加が背景',
            '電池生産能力の増強投資を加速',
        ],
        source: 'ロイター',
        timestamp: '2026-02-01T08:30:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['7203', 'TSLA'],
        aiScore: 85,
    },
    {
        id: 'news-2',
        title: 'ビットコイン、7万ドル突破 機関投資家の買い加速',
        summary: [
            '24時間で5%上昇、時価総額は過去最高を更新',
            'ETF経由の資金流入が継続',
            '半減期に向けた需給改善期待',
        ],
        source: 'CoinDesk Japan',
        timestamp: '2026-02-01T07:45:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['BTC', 'ETH'],
        aiScore: 78,
    },
    {
        id: 'news-3',
        title: '日銀、金融政策維持を決定 市場は安堵モード',
        summary: [
            '政策金利0.25%で据え置き',
            '植田総裁「賃金動向を注視」と発言',
            '次回利上げは3月以降との見方が優勢',
        ],
        source: '日本経済新聞',
        timestamp: '2026-02-01T06:00:00+09:00',
        sentiment: 'neutral',
        relatedAssets: ['N225', 'USD/JPY'],
        aiScore: 72,
    },
    {
        id: 'news-4',
        title: 'エヌビディア決算、市場予想を大幅上回る',
        summary: [
            'AI向けGPU需要が引き続き好調',
            '売上高は前年同期比3倍に急増',
            '来期ガイダンスも強気見通し',
        ],
        source: 'Bloomberg',
        timestamp: '2026-01-31T22:00:00+09:00',
        sentiment: 'positive',
        relatedAssets: ['NVDA', 'GOOGL', 'MSFT'],
        aiScore: 92,
    },
    {
        id: 'news-5',
        title: '金価格、1オンス2700ドル台で推移 地政学リスク意識',
        summary: [
            '中東情勢の不透明感からリスク回避の動き',
            '中央銀行の金購入も需要を下支え',
            'ドル安進行も追い風に',
        ],
        source: 'Nikkei Asia',
        timestamp: '2026-01-31T20:30:00+09:00',
        sentiment: 'neutral',
        relatedAssets: ['XAU', 'USD/JPY'],
        aiScore: 65,
    },
];

// ===== センチメントデータ =====
export const sentimentData: SentimentData[] = [
    { assetId: 'btc', symbol: 'BTC', twitterMentions: 125000, redditMentions: 45000, overallSentiment: 72, changeFromYesterday: 8, trending: true },
    { assetId: 'eth', symbol: 'ETH', twitterMentions: 78000, redditMentions: 32000, overallSentiment: 58, changeFromYesterday: -5, trending: false },
    { assetId: '7203', symbol: '7203', twitterMentions: 12000, redditMentions: 3500, overallSentiment: 45, changeFromYesterday: 12, trending: true },
    { assetId: '6758', symbol: '6758', twitterMentions: 8500, redditMentions: 2800, overallSentiment: 81, changeFromYesterday: 15, trending: true },
    { assetId: 'xau', symbol: 'XAU', twitterMentions: 15000, redditMentions: 5200, overallSentiment: 55, changeFromYesterday: 3, trending: false },
    { assetId: 'nvda', symbol: 'N225', twitterMentions: 95000, redditMentions: 28000, overallSentiment: 62, changeFromYesterday: 7, trending: true },
    { assetId: 'xag', symbol: 'XAG', twitterMentions: 6500, redditMentions: 1800, overallSentiment: 42, changeFromYesterday: -2, trending: false },
    { assetId: 'topix', symbol: 'TOPIX', twitterMentions: 4200, redditMentions: 1200, overallSentiment: 48, changeFromYesterday: 1, trending: false },
];

// Dividend interfaces moved to types.ts

export interface ScreenerAsset {
    id: string;
    symbol: string;
    name: string;
    sector: string;
    price: number;
    change: number; // change percent
    per: number;
    pbr: number;
    dividendYield: number;
    snsBuzz: number;
    aiScore: number; // 0-100
}


// ===== 配当カレンダー =====
export const dividendCalendar: DividendEntry[] = [
    {
        month: '2月',
        stocks: 3000,
        staking: 1200,
        total: 4200,
        breakdown: [
            { name: 'Apple', value: 2000, type: 'stock' },
            { name: 'Staking (ETH)', value: 1200, type: 'staking' },
            { name: 'Coca-Cola', value: 1000, type: 'stock' },
        ]
    },
    {
        month: '3月',
        stocks: 45000,
        staking: 1500,
        total: 46500,
        breakdown: [
            { name: 'eMAXIS Slim All', value: 25000, type: 'stock' }, // Reinvested but showing value? Or distributing? assuming distributing for calendar
            // Actually user has "reinvest" in portfolio data, but this calendar implies income visualization.
            { name: 'VYM', value: 15000, type: 'stock' },
            { name: 'Staking (DOT)', value: 1500, type: 'staking' },
            { name: 'Others', value: 5000, type: 'stock' },
        ]
    },
    {
        month: '4月',
        stocks: 2000,
        staking: 1300,
        total: 3300,
        breakdown: [
            { name: 'Staking (ETH)', value: 1300, type: 'staking' },
            { name: 'Procter & Gamble', value: 2000, type: 'stock' },
        ]
    },
    {
        month: '5月',
        stocks: 8000,
        staking: 1400,
        total: 9400,
        breakdown: [
            { name: 'AT&T', value: 5000, type: 'stock' },
            { name: 'Verizon', value: 3000, type: 'stock' },
            { name: 'Staking (SOL)', value: 1400, type: 'staking' },
        ]
    },
    {
        month: '6月',
        stocks: 25000,
        staking: 1500,
        total: 26500,
        breakdown: [
            { name: 'Japan Tobacco', value: 15000, type: 'stock' },
            { name: 'KDDI', value: 8000, type: 'stock' },
            { name: 'Staking (ETH)', value: 1500, type: 'staking' },
            { name: 'Others', value: 2000, type: 'stock' },
        ]
    },
    {
        month: '7月',
        stocks: 4000,
        staking: 1300,
        total: 5300,
        breakdown: [
            { name: 'Altria Group', value: 4000, type: 'stock' },
            { name: 'Staking (DOT)', value: 1300, type: 'staking' },
        ]
    },
    {
        month: '8月',
        stocks: 4000,
        staking: 1200,
        total: 5200,
        breakdown: [
            { name: 'Apple', value: 2000, type: 'stock' },
            { name: 'Coca-Cola', value: 2000, type: 'stock' },
            { name: 'Staking (ETH)', value: 1200, type: 'staking' },
        ]
    },
    {
        month: '9月',
        stocks: 42000,
        staking: 1500,
        total: 43500,
        breakdown: [
            { name: 'eMAXIS Slim All', value: 25000, type: 'stock' },
            { name: 'VYM', value: 12000, type: 'stock' },
            { name: 'Staking (SOL)', value: 1500, type: 'staking' },
            { name: 'Others', value: 5000, type: 'stock' },
        ]
    },
    {
        month: '10月',
        stocks: 2500,
        staking: 1400,
        total: 3900,
        breakdown: [
            { name: 'Staking (ETH)', value: 1400, type: 'staking' },
            { name: 'Procter & Gamble', value: 2500, type: 'stock' },
        ]
    },
    {
        month: '11月',
        stocks: 4000,
        staking: 1300,
        total: 5300,
        breakdown: [
            { name: 'AT&T', value: 2500, type: 'stock' },
            { name: 'Verizon', value: 1500, type: 'stock' },
            { name: 'Staking (DOT)', value: 1300, type: 'staking' },
        ]
    },
    {
        month: '12月',
        stocks: 23000,
        staking: 1500,
        total: 24500,
        breakdown: [
            { name: 'Japan Tobacco', value: 15000, type: 'stock' },
            { name: 'KDDI', value: 8000, type: 'stock' },
            { name: 'Staking (ETH)', value: 1500, type: 'staking' },
        ]
    },
    {
        month: '1月',
        stocks: 3000,
        staking: 1200,
        total: 4200,
        breakdown: [
            { name: 'Altria Group', value: 3000, type: 'stock' },
            { name: 'Staking (SOL)', value: 1200, type: 'staking' },
        ]
    },
];

// ===== スクリーナーデータ (50銘柄) =====
// 日経225構成銘柄を中心とした上昇期待銘柄ランキング
export const screenerAssets: ScreenerAsset[] = [
    // Top Tier (AI Score 85+)
    { id: '6861', symbol: '6861', name: 'キーエンス', sector: '電気機器', per: 35.2, pbr: 5.8, dividendYield: 0.3, snsBuzz: 88, aiScore: 92, price: 62500, change: 2.1 },
    { id: '6758', symbol: '6758', name: 'ソニーグループ', sector: 'エレクトロニクス', per: 15.8, pbr: 2.3, dividendYield: 0.6, snsBuzz: 92, aiScore: 90, price: 15420, change: 1.8 },
    { id: '9983', symbol: '9983', name: 'ファーストリテイリング', sector: '小売', per: 38.5, pbr: 7.2, dividendYield: 0.8, snsBuzz: 85, aiScore: 88, price: 42500, change: 1.5 },
    { id: '6954', symbol: '6954', name: 'ファナック', sector: '電気機器', per: 28.3, pbr: 3.1, dividendYield: 1.2, snsBuzz: 72, aiScore: 87, price: 4250, change: 2.3 },
    { id: '8035', symbol: '8035', name: '東京エレクトロン', sector: '電気機器', per: 22.1, pbr: 4.8, dividendYield: 1.5, snsBuzz: 90, aiScore: 89, price: 28500, change: 3.2 },
    { id: '4063', symbol: '4063', name: '信越化学工業', sector: '化学', per: 12.5, pbr: 2.1, dividendYield: 2.2, snsBuzz: 68, aiScore: 86, price: 5850, change: 1.2 },
    { id: '6902', symbol: '6902', name: 'デンソー', sector: '自動車部品', per: 14.2, pbr: 1.3, dividendYield: 2.5, snsBuzz: 65, aiScore: 85, price: 2180, change: 0.8 },

    // High Tier (AI Score 75-84)
    { id: '7203', symbol: '7203', name: 'トヨタ自動車', sector: '自動車', per: 10.2, pbr: 1.1, dividendYield: 2.8, snsBuzz: 85, aiScore: 84, price: 2850, change: 1.2 },
    { id: '6501', symbol: '6501', name: '日立製作所', sector: '電気機器', per: 16.8, pbr: 2.0, dividendYield: 1.8, snsBuzz: 75, aiScore: 83, price: 9850, change: 1.5 },
    { id: '7741', symbol: '7741', name: 'HOYA', sector: '精密機器', per: 32.5, pbr: 6.5, dividendYield: 0.9, snsBuzz: 62, aiScore: 82, price: 18500, change: 0.5 },
    { id: '6367', symbol: '6367', name: 'ダイキン工業', sector: '機械', per: 25.8, pbr: 4.2, dividendYield: 0.8, snsBuzz: 58, aiScore: 81, price: 28000, change: 0.3 },
    { id: '9984', symbol: '9984', name: 'ソフトバンクG', sector: '情報・通信', per: 8.5, pbr: 0.9, dividendYield: 0.8, snsBuzz: 88, aiScore: 80, price: 8750, change: 2.1 },
    { id: '6098', symbol: '6098', name: 'リクルートHD', sector: 'サービス', per: 28.5, pbr: 5.8, dividendYield: 0.5, snsBuzz: 78, aiScore: 79, price: 6850, change: 1.8 },
    { id: '4519', symbol: '4519', name: '中外製薬', sector: '医薬品', per: 22.3, pbr: 4.5, dividendYield: 1.2, snsBuzz: 55, aiScore: 78, price: 5200, change: 0.2 },
    { id: '9432', symbol: '9432', name: 'NTT', sector: '情報・通信', per: 11.2, pbr: 1.4, dividendYield: 3.2, snsBuzz: 55, aiScore: 77, price: 154, change: 1.0 },
    { id: '6273', symbol: '6273', name: 'SMC', sector: '機械', per: 18.5, pbr: 2.8, dividendYield: 1.5, snsBuzz: 48, aiScore: 76, price: 72500, change: 0.8 },
    { id: '4568', symbol: '4568', name: '第一三共', sector: '医薬品', per: 45.2, pbr: 5.2, dividendYield: 0.8, snsBuzz: 72, aiScore: 75, price: 4850, change: 1.2 },

    // Mid-High Tier (AI Score 70-74)
    { id: '8306', symbol: '8306', name: '三菱UFJ FG', sector: '銀行', per: 9.8, pbr: 0.7, dividendYield: 3.8, snsBuzz: 65, aiScore: 74, price: 1285, change: 0.5 },
    { id: '7267', symbol: '7267', name: 'ホンダ', sector: '自動車', per: 8.5, pbr: 0.6, dividendYield: 3.5, snsBuzz: 70, aiScore: 73, price: 1580, change: 0.8 },
    { id: '4502', symbol: '4502', name: '武田薬品工業', sector: '医薬品', per: 18.5, pbr: 1.2, dividendYield: 4.2, snsBuzz: 52, aiScore: 72, price: 4150, change: -0.2 },
    { id: '4661', symbol: '4661', name: 'オリエンタルランド', sector: 'サービス', per: 45.0, pbr: 6.2, dividendYield: 0.2, snsBuzz: 82, aiScore: 72, price: 2709, change: -1.3 },
    { id: '6503', symbol: '6503', name: '三菱電機', sector: '電気機器', per: 15.2, pbr: 1.5, dividendYield: 2.2, snsBuzz: 45, aiScore: 71, price: 2250, change: 0.5 },
    { id: '8766', symbol: '8766', name: '東京海上HD', sector: '保険', per: 12.5, pbr: 1.8, dividendYield: 3.0, snsBuzz: 42, aiScore: 71, price: 4850, change: 0.3 },
    { id: '9433', symbol: '9433', name: 'KDDI', sector: '情報・通信', per: 13.8, pbr: 1.9, dividendYield: 3.0, snsBuzz: 48, aiScore: 70, price: 4580, change: 0.2 },
    { id: '6981', symbol: '6981', name: '村田製作所', sector: '電気機器', per: 18.2, pbr: 2.2, dividendYield: 1.8, snsBuzz: 62, aiScore: 70, price: 2850, change: 1.5 },

    // Mid Tier (AI Score 65-69)
    { id: '7751', symbol: '7751', name: 'キヤノン', sector: '電気機器', per: 12.8, pbr: 1.2, dividendYield: 3.2, snsBuzz: 38, aiScore: 69, price: 4250, change: 0.5 },
    { id: '8058', symbol: '8058', name: '三菱商事', sector: '商社', per: 8.2, pbr: 1.0, dividendYield: 3.5, snsBuzz: 58, aiScore: 68, price: 2650, change: 0.8 },
    { id: '8031', symbol: '8031', name: '三井物産', sector: '商社', per: 7.8, pbr: 1.1, dividendYield: 3.2, snsBuzz: 55, aiScore: 68, price: 6850, change: 1.0 },
    { id: '3382', symbol: '3382', name: 'セブン&アイHD', sector: '小売', per: 18.5, pbr: 1.5, dividendYield: 2.5, snsBuzz: 52, aiScore: 67, price: 2150, change: -0.5 },
    { id: '6971', symbol: '6971', name: '京セラ', sector: '電気機器', per: 15.5, pbr: 0.9, dividendYield: 2.8, snsBuzz: 35, aiScore: 67, price: 1850, change: 0.2 },
    { id: '7974', symbol: '7974', name: '任天堂', sector: 'その他製品', per: 15.2, pbr: 3.5, dividendYield: 2.2, snsBuzz: 88, aiScore: 66, price: 8250, change: -0.8 },
    { id: '2801', symbol: '2801', name: 'キッコーマン', sector: '食料品', per: 35.2, pbr: 4.8, dividendYield: 0.8, snsBuzz: 42, aiScore: 66, price: 1950, change: 0.3 },
    { id: '4901', symbol: '4901', name: '富士フイルムHD', sector: '化学', per: 14.8, pbr: 1.2, dividendYield: 1.8, snsBuzz: 45, aiScore: 65, price: 3250, change: 0.5 },
    { id: '6702', symbol: '6702', name: '富士通', sector: '電気機器', per: 18.5, pbr: 2.5, dividendYield: 1.2, snsBuzz: 58, aiScore: 65, price: 2450, change: 1.2 },

    // Mid-Low Tier (AI Score 60-64)
    { id: '8801', symbol: '8801', name: '三井不動産', sector: '不動産', per: 12.5, pbr: 1.2, dividendYield: 2.0, snsBuzz: 38, aiScore: 64, price: 1350, change: 0.2 },
    { id: '9020', symbol: '9020', name: 'JR東日本', sector: '陸運', per: 15.8, pbr: 1.3, dividendYield: 1.5, snsBuzz: 42, aiScore: 64, price: 2850, change: -0.3 },
    { id: '4503', symbol: '4503', name: 'アステラス製薬', sector: '医薬品', per: 22.5, pbr: 2.2, dividendYield: 2.8, snsBuzz: 35, aiScore: 63, price: 1650, change: -0.5 },
    { id: '6752', symbol: '6752', name: 'パナソニックHD', sector: '電気機器', per: 10.5, pbr: 0.8, dividendYield: 2.5, snsBuzz: 52, aiScore: 63, price: 1450, change: 0.8 },
    { id: '2730', symbol: '2730', name: 'エディオン', sector: '小売', per: 12.5, pbr: 0.8, dividendYield: 3.5, snsBuzz: 35, aiScore: 62, price: 2117, change: 0.8 },
    { id: '9022', symbol: '9022', name: 'JR東海', sector: '陸運', per: 10.2, pbr: 1.0, dividendYield: 0.8, snsBuzz: 38, aiScore: 62, price: 3450, change: 0.2 },
    { id: '5401', symbol: '5401', name: '日本製鉄', sector: '鉄鋼', per: 6.5, pbr: 0.6, dividendYield: 5.2, snsBuzz: 45, aiScore: 61, price: 3250, change: 1.5 },
    { id: '6301', symbol: '6301', name: 'コマツ', sector: '機械', per: 11.2, pbr: 1.5, dividendYield: 3.2, snsBuzz: 42, aiScore: 61, price: 4150, change: 0.5 },
    { id: '8802', symbol: '8802', name: '三菱地所', sector: '不動産', per: 15.8, pbr: 1.5, dividendYield: 1.8, snsBuzz: 35, aiScore: 60, price: 2150, change: -0.2 },

    // Lower Tier (AI Score 55-59)
    { id: '9021', symbol: '9021', name: 'JR西日本', sector: '陸運', per: 12.8, pbr: 1.1, dividendYield: 2.2, snsBuzz: 32, aiScore: 59, price: 2850, change: -0.5 },
    { id: '5108', symbol: '5108', name: 'ブリヂストン', sector: 'ゴム', per: 10.5, pbr: 1.2, dividendYield: 3.5, snsBuzz: 28, aiScore: 58, price: 5650, change: 0.2 },
    { id: '7011', symbol: '7011', name: '三菱重工業', sector: '機械', per: 18.5, pbr: 1.8, dividendYield: 1.5, snsBuzz: 55, aiScore: 58, price: 1250, change: 2.5 },
    { id: '2502', symbol: '2502', name: 'アサヒグループHD', sector: '食料品', per: 15.2, pbr: 1.5, dividendYield: 2.2, snsBuzz: 38, aiScore: 57, price: 5850, change: -0.3 },
    { id: '2914', symbol: '2914', name: 'JT', sector: '食料品', per: 12.8, pbr: 1.8, dividendYield: 4.8, snsBuzz: 42, aiScore: 56, price: 4250, change: 0.2 },
    { id: '4452', symbol: '4452', name: '花王', sector: '化学', per: 28.5, pbr: 3.2, dividendYield: 2.5, snsBuzz: 35, aiScore: 55, price: 5450, change: -0.8 },
    { id: '8316', symbol: '8316', name: '三井住友FG', sector: '銀行', per: 9.2, pbr: 0.8, dividendYield: 4.0, snsBuzz: 48, aiScore: 54, price: 2950, change: 0.5 },
];

// ===== グローバルスクリーナーデータ (50銘柄) =====
// 米国・欧州・アジアの主要銘柄ランキング
export const globalScreenerAssets: ScreenerAsset[] = [
    // Top Tier (AI Score 85+) - US Tech Giants
    { id: 'NVDA', symbol: 'NVDA', name: 'NVIDIA', sector: 'Semiconductors', per: 65.2, pbr: 28.5, dividendYield: 0.03, snsBuzz: 98, aiScore: 95, price: 875, change: 3.5 },
    { id: 'MSFT', symbol: 'MSFT', name: 'Microsoft', sector: 'Software', per: 35.8, pbr: 12.5, dividendYield: 0.7, snsBuzz: 92, aiScore: 93, price: 415, change: 1.8 },
    { id: 'AAPL', symbol: 'AAPL', name: 'Apple', sector: 'Consumer Electronics', per: 28.5, pbr: 45.2, dividendYield: 0.5, snsBuzz: 95, aiScore: 91, price: 225, change: 1.2 },
    { id: 'GOOGL', symbol: 'GOOGL', name: 'Alphabet', sector: 'Internet Services', per: 22.8, pbr: 6.2, dividendYield: 0.0, snsBuzz: 88, aiScore: 90, price: 175, change: 2.1 },
    { id: 'META', symbol: 'META', name: 'Meta Platforms', sector: 'Social Media', per: 28.5, pbr: 8.2, dividendYield: 0.4, snsBuzz: 90, aiScore: 89, price: 485, change: 2.5 },
    { id: 'AMZN', symbol: 'AMZN', name: 'Amazon', sector: 'E-Commerce', per: 42.5, pbr: 8.8, dividendYield: 0.0, snsBuzz: 85, aiScore: 88, price: 185, change: 1.5 },
    { id: 'AVGO', symbol: 'AVGO', name: 'Broadcom', sector: 'Semiconductors', per: 32.5, pbr: 12.2, dividendYield: 1.8, snsBuzz: 78, aiScore: 87, price: 1250, change: 2.8 },

    // High Tier (AI Score 75-84) - Tech & Healthcare
    { id: 'TSLA', symbol: 'TSLA', name: 'Tesla', sector: 'Electric Vehicles', per: 58.2, pbr: 12.5, dividendYield: 0.0, snsBuzz: 98, aiScore: 84, price: 385, change: 4.2 },
    { id: 'AMD', symbol: 'AMD', name: 'AMD', sector: 'Semiconductors', per: 45.8, pbr: 4.5, dividendYield: 0.0, snsBuzz: 88, aiScore: 83, price: 165, change: 2.8 },
    { id: 'LLY', symbol: 'LLY', name: 'Eli Lilly', sector: 'Pharmaceuticals', per: 85.2, pbr: 52.5, dividendYield: 0.7, snsBuzz: 82, aiScore: 82, price: 785, change: 1.5 },
    { id: 'ASML', symbol: 'ASML', name: 'ASML Holding', sector: 'Semiconductors', per: 42.5, pbr: 22.8, dividendYield: 0.8, snsBuzz: 75, aiScore: 81, price: 985, change: 1.2 },
    { id: 'TSM', symbol: 'TSM', name: 'TSMC', sector: 'Semiconductors', per: 22.5, pbr: 6.8, dividendYield: 1.5, snsBuzz: 80, aiScore: 80, price: 165, change: 2.2 },
    { id: 'V', symbol: 'V', name: 'Visa', sector: 'Financial Services', per: 28.5, pbr: 15.2, dividendYield: 0.8, snsBuzz: 55, aiScore: 79, price: 285, change: 0.5 },
    { id: 'MA', symbol: 'MA', name: 'Mastercard', sector: 'Financial Services', per: 32.8, pbr: 55.2, dividendYield: 0.6, snsBuzz: 52, aiScore: 78, price: 465, change: 0.8 },
    { id: 'UNH', symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', per: 22.5, pbr: 6.5, dividendYield: 1.5, snsBuzz: 48, aiScore: 77, price: 525, change: 0.2 },
    { id: 'CRM', symbol: 'CRM', name: 'Salesforce', sector: 'Software', per: 45.2, pbr: 4.2, dividendYield: 0.0, snsBuzz: 72, aiScore: 76, price: 285, change: 1.8 },
    { id: 'ORCL', symbol: 'ORCL', name: 'Oracle', sector: 'Software', per: 32.5, pbr: 38.5, dividendYield: 1.2, snsBuzz: 65, aiScore: 75, price: 165, change: 1.5 },

    // Mid-High Tier (AI Score 70-74) - Industrial & Consumer
    { id: 'NFLX', symbol: 'NFLX', name: 'Netflix', sector: 'Entertainment', per: 42.8, pbr: 15.5, dividendYield: 0.0, snsBuzz: 85, aiScore: 74, price: 625, change: 2.2 },
    { id: 'COST', symbol: 'COST', name: 'Costco', sector: 'Retail', per: 52.5, pbr: 15.8, dividendYield: 0.5, snsBuzz: 58, aiScore: 73, price: 885, change: 0.5 },
    { id: 'NVO', symbol: 'NVO', name: 'Novo Nordisk', sector: 'Pharmaceuticals', per: 38.5, pbr: 28.5, dividendYield: 1.2, snsBuzz: 78, aiScore: 72, price: 125, change: 1.8 },
    { id: 'ADBE', symbol: 'ADBE', name: 'Adobe', sector: 'Software', per: 45.2, pbr: 15.2, dividendYield: 0.0, snsBuzz: 62, aiScore: 72, price: 585, change: 0.8 },
    { id: 'SAP', symbol: 'SAP', name: 'SAP SE', sector: 'Software', per: 35.8, pbr: 5.2, dividendYield: 1.5, snsBuzz: 48, aiScore: 71, price: 215, change: 0.5 },
    { id: 'LVMH', symbol: 'MC.PA', name: 'LVMH', sector: 'Luxury Goods', per: 22.5, pbr: 5.8, dividendYield: 1.8, snsBuzz: 68, aiScore: 71, price: 785, change: -0.5 },
    { id: 'DIS', symbol: 'DIS', name: 'Walt Disney', sector: 'Entertainment', per: 65.2, pbr: 2.1, dividendYield: 0.0, snsBuzz: 75, aiScore: 70, price: 112, change: 1.2 },
    { id: 'PEP', symbol: 'PEP', name: 'PepsiCo', sector: 'Beverages', per: 25.8, pbr: 12.5, dividendYield: 2.8, snsBuzz: 42, aiScore: 70, price: 175, change: 0.2 },

    // Mid Tier (AI Score 65-69) - Diversified
    { id: 'ACN', symbol: 'ACN', name: 'Accenture', sector: 'IT Services', per: 28.5, pbr: 8.2, dividendYield: 1.5, snsBuzz: 45, aiScore: 69, price: 345, change: 0.5 },
    { id: 'BABA', symbol: 'BABA', name: 'Alibaba', sector: 'E-Commerce', per: 12.5, pbr: 1.5, dividendYield: 0.0, snsBuzz: 72, aiScore: 68, price: 85, change: 2.5 },
    { id: 'KO', symbol: 'KO', name: 'Coca-Cola', sector: 'Beverages', per: 22.5, pbr: 10.5, dividendYield: 3.2, snsBuzz: 45, aiScore: 68, price: 62, change: 0.2 },
    { id: 'NKE', symbol: 'NKE', name: 'Nike', sector: 'Apparel', per: 28.5, pbr: 8.5, dividendYield: 1.8, snsBuzz: 68, aiScore: 67, price: 98, change: -0.8 },
    { id: 'MCD', symbol: 'MCD', name: 'McDonald\'s', sector: 'Restaurants', per: 25.2, pbr: 0.0, dividendYield: 2.2, snsBuzz: 52, aiScore: 67, price: 285, change: 0.5 },
    { id: 'JPM', symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Banking', per: 11.5, pbr: 1.8, dividendYield: 2.5, snsBuzz: 58, aiScore: 66, price: 195, change: 0.8 },
    { id: 'HSBC', symbol: 'HSBC', name: 'HSBC Holdings', sector: 'Banking', per: 8.5, pbr: 0.9, dividendYield: 5.2, snsBuzz: 42, aiScore: 66, price: 42, change: 0.5 },
    { id: 'TM', symbol: 'TM', name: 'Toyota (ADR)', sector: 'Automobiles', per: 10.2, pbr: 1.1, dividendYield: 2.5, snsBuzz: 55, aiScore: 65, price: 185, change: 0.8 },
    { id: 'SNY', symbol: 'SNY', name: 'Sanofi', sector: 'Pharmaceuticals', per: 12.5, pbr: 1.5, dividendYield: 4.2, snsBuzz: 35, aiScore: 65, price: 48, change: 0.2 },

    // Mid-Low Tier (AI Score 60-64)
    { id: 'INTC', symbol: 'INTC', name: 'Intel', sector: 'Semiconductors', per: 0.0, pbr: 1.2, dividendYield: 1.5, snsBuzz: 72, aiScore: 64, price: 32, change: -1.5 },
    { id: 'BAC', symbol: 'BAC', name: 'Bank of America', sector: 'Banking', per: 10.8, pbr: 1.1, dividendYield: 2.8, snsBuzz: 48, aiScore: 64, price: 38, change: 0.5 },
    { id: 'WMT', symbol: 'WMT', name: 'Walmart', sector: 'Retail', per: 28.5, pbr: 6.8, dividendYield: 1.2, snsBuzz: 52, aiScore: 63, price: 165, change: 0.2 },
    { id: 'PFE', symbol: 'PFE', name: 'Pfizer', sector: 'Pharmaceuticals', per: 45.2, pbr: 1.5, dividendYield: 5.8, snsBuzz: 55, aiScore: 63, price: 28, change: -0.5 },
    { id: 'XOM', symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', per: 12.5, pbr: 2.1, dividendYield: 3.5, snsBuzz: 48, aiScore: 62, price: 115, change: 0.8 },
    { id: 'CVX', symbol: 'CVX', name: 'Chevron', sector: 'Energy', per: 11.8, pbr: 1.8, dividendYield: 4.2, snsBuzz: 42, aiScore: 62, price: 155, change: 0.5 },
    { id: 'SHEL', symbol: 'SHEL', name: 'Shell', sector: 'Energy', per: 8.5, pbr: 1.2, dividendYield: 4.0, snsBuzz: 38, aiScore: 61, price: 68, change: 0.2 },
    { id: 'BHP', symbol: 'BHP', name: 'BHP Group', sector: 'Mining', per: 12.5, pbr: 2.8, dividendYield: 5.5, snsBuzz: 35, aiScore: 61, price: 58, change: 0.8 },
    { id: 'RIO', symbol: 'RIO', name: 'Rio Tinto', sector: 'Mining', per: 10.2, pbr: 2.2, dividendYield: 6.2, snsBuzz: 32, aiScore: 60, price: 65, change: 0.5 },

    // Lower Tier (AI Score 55-59)
    { id: 'VZ', symbol: 'VZ', name: 'Verizon', sector: 'Telecom', per: 8.5, pbr: 1.5, dividendYield: 6.8, snsBuzz: 32, aiScore: 59, price: 42, change: -0.2 },
    { id: 'T', symbol: 'T', name: 'AT&T', sector: 'Telecom', per: 9.2, pbr: 1.2, dividendYield: 6.5, snsBuzz: 35, aiScore: 58, price: 18, change: 0.2 },
    { id: 'IBM', symbol: 'IBM', name: 'IBM', sector: 'IT Services', per: 18.5, pbr: 6.8, dividendYield: 4.2, snsBuzz: 42, aiScore: 58, price: 185, change: 0.5 },
    { id: 'BA', symbol: 'BA', name: 'Boeing', sector: 'Aerospace', per: 0.0, pbr: 0.0, dividendYield: 0.0, snsBuzz: 68, aiScore: 57, price: 185, change: -1.2 },
    { id: 'GE', symbol: 'GE', name: 'GE Aerospace', sector: 'Aerospace', per: 35.2, pbr: 8.5, dividendYield: 0.5, snsBuzz: 52, aiScore: 56, price: 165, change: 0.8 },
    { id: 'F', symbol: 'F', name: 'Ford Motor', sector: 'Automobiles', per: 6.5, pbr: 1.0, dividendYield: 4.8, snsBuzz: 48, aiScore: 55, price: 12, change: -0.5 },
];

// ===== 相関マトリックス =====
export const correlationData: CorrelationData = {
    assets: ['N225', 'TOPIX', 'BTC', 'XAU', 'USD/JPY'],
    matrix: [
        [1.00, 0.98, 0.35, -0.15, 0.42],
        [0.98, 1.00, 0.32, -0.18, 0.45],
        [0.35, 0.32, 1.00, 0.28, -0.22],
        [-0.15, -0.18, 0.28, 1.00, -0.55],
        [0.42, 0.45, -0.22, -0.55, 1.00],
    ],
};

// CorrelationMatrix component expects array format
export interface CorrelationPair {
    asset1: string;
    asset2: string;
    correlation: number;
}

export const correlationMatrix: CorrelationPair[] = (() => {
    const pairs: CorrelationPair[] = [];
    const assets = correlationData.assets;
    for (let i = 0; i < assets.length; i++) {
        for (let j = 0; j < assets.length; j++) {
            pairs.push({
                asset1: assets[i],
                asset2: assets[j],
                correlation: correlationData.matrix[i][j],
            });
        }
    }
    return pairs;
})();

// ===== チャートデータ生成 =====
export function generateChartData(): ChartDataPoint[] {
    const data: ChartDataPoint[] = [];
    const now = new Date();

    let nikkei = 37500;
    let gold = 12500;
    let bitcoin = 13500000;

    for (let i = 89; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        nikkei += (Math.random() - 0.48) * 300;
        gold += (Math.random() - 0.48) * 50;
        bitcoin += (Math.random() - 0.48) * 200000;

        data.push({
            date: date.toISOString().split('T')[0],
            nikkei: Math.round(nikkei * 100) / 100,
            gold: Math.round(gold * 100) / 100,
            bitcoin: Math.round(bitcoin),
        });
    }

    return data;
}

export const chartData = generateChartData();

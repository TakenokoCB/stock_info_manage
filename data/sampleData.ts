// Sample Portfolio Data
// サンプルポートフォリオデータ（実データの構造を示すサンプル）
// 実際のデータは data/portfolioData.ts に配置してください

import { Portfolio } from './types';

/**
 * サンプルポートフォリオデータ
 * 実際のデータ構造を示すためのサンプルです
 */
export const samplePortfolio: Portfolio = {
    updatedAt: '2026-02-01T00:00:00+09:00',
    assets: [
        // 国内株式サンプル
        {
            type: 'domestic_stock',
            broker: 'sbi',
            account: 'specific',
            code: '7203',
            name: 'トヨタ自動車',
            quantity: 100,
            avgPrice: 2500,
            currentPrice: 2800,
            acquisitionCost: 250000,
            marketValue: 280000,
            profitLoss: 30000,
            profitLossPercent: 12.0,
        },
        {
            type: 'domestic_stock',
            broker: 'rakuten',
            account: 'specific',
            code: '9432',
            name: 'NTT',
            quantity: 200,
            avgPrice: 155,
            currentPrice: 160,
            acquisitionCost: 31000,
            marketValue: 32000,
            profitLoss: 1000,
            profitLossPercent: 3.23,
        },

        // 海外株式サンプル
        {
            type: 'foreign_stock',
            broker: 'sbi',
            account: 'specific',
            ticker: 'AAPL',
            name: 'アップル',
            quantity: 5,
            avgPriceUsd: 180.00,
            currentPriceUsd: 220.00,
            marketValueUsd: 1100.00,
            marketValueJpy: 170000,
            profitLossUsd: 200.00,
            profitLossJpy: 31000,
        },
        {
            type: 'foreign_stock',
            broker: 'sbi',
            account: 'specific',
            ticker: 'NVDA',
            name: 'エヌビディア',
            quantity: 10,
            avgPriceUsd: 120.00,
            currentPriceUsd: 190.00,
            marketValueUsd: 1900.00,
            marketValueJpy: 293000,
            profitLossUsd: 700.00,
            profitLossJpy: 108000,
        },

        // 投資信託サンプル
        {
            type: 'investment_trust',
            broker: 'sbi',
            account: 'nisa_growth',
            name: 'eMAXIS Slim 全世界株式（オール・カントリー）',
            units: 1500000,
            avgNavPrice: 26000,
            currentNavPrice: 33000,
            acquisitionCost: 3900000,
            marketValue: 4950000,
            profitLoss: 1050000,
            profitLossPercent: 26.92,
            dividendMethod: 'reinvest',
        },
        {
            type: 'investment_trust',
            broker: 'rakuten',
            account: 'specific',
            name: '楽天・プラス・オールカントリー株式インデックス・ファンド',
            units: 1000000,
            avgNavPrice: 14000,
            currentNavPrice: 17000,
            acquisitionCost: 1400000,
            marketValue: 1700000,
            profitLoss: 300000,
            profitLossPercent: 21.43,
            dividendMethod: 'reinvest',
        },

        // 仮想通貨サンプル
        {
            type: 'crypto',
            broker: 'bitpoint',
            symbol: 'BTC',
            name: 'ビットコイン',
            quantity: 0.01,
            avgPrice: 13000000,
            currentPrice: 15000000,
            acquisitionCost: 130000,
            marketValue: 150000,
            profitLoss: 20000,
        },
        {
            type: 'crypto',
            broker: 'bitpoint',
            symbol: 'ETH',
            name: 'イーサリアム',
            quantity: 0.5,
            avgPrice: 350000,
            currentPrice: 400000,
            acquisitionCost: 175000,
            marketValue: 200000,
            profitLoss: 25000,
        },

        // 債券サンプル
        {
            type: 'bond',
            broker: 'rakuten',
            account: 'specific',
            name: '米国国債 米ドル建ストリップス債券 2044/8/15',
            faceValue: 10000,
            maturityDate: '2044/08/15',
            acquisitionCost: 600000,
            marketValue: 580000,
            profitLoss: -20000,
            profitLossPercent: -3.33,
        },
    ],
    summary: {
        totalMarketValue: 8355000,
        totalProfitLoss: 1545000,
        totalProfitLossPercent: 22.68,
    },
};

/**
 * サンプル配当データ
 */
export const sampleDividends = [
    { month: '2月', stocks: 0, staking: 3500, total: 3500 },
    { month: '3月', stocks: 45000, staking: 3600, total: 48600 },
    { month: '4月', stocks: 0, staking: 3700, total: 3700 },
    { month: '5月', stocks: 0, staking: 3800, total: 3800 },
    { month: '6月', stocks: 18000, staking: 3900, total: 21900 },
    { month: '7月', stocks: 0, staking: 4000, total: 4000 },
    { month: '8月', stocks: 0, staking: 4100, total: 4100 },
    { month: '9月', stocks: 42000, staking: 4200, total: 46200 },
    { month: '10月', stocks: 0, staking: 4300, total: 4300 },
    { month: '11月', stocks: 0, staking: 4400, total: 4400 },
    { month: '12月', stocks: 30000, staking: 4500, total: 34500 },
    { month: '1月', stocks: 0, staking: 4600, total: 4600 },
];

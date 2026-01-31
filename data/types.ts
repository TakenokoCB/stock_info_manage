// Portfolio Data Types
// 保有投資商品のデータ型定義

/**
 * 資産種別
 */
export type AssetType =
    | 'domestic_stock'    // 国内株式
    | 'foreign_stock'     // 海外株式
    | 'investment_trust'  // 投資信託
    | 'crypto'            // 仮想通貨
    | 'bond'              // 債券
    | 'commodity';        // コモディティ（金・プラチナ等）

/**
 * 口座種別
 */
export type AccountType =
    | 'specific'          // 特定口座
    | 'general'           // 一般口座
    | 'nisa_growth'       // NISA成長投資枠
    | 'nisa_tsumitate';   // NISAつみたて投資枠

/**
 * 証券会社
 */
export type Broker =
    | 'sbi'               // SBI証券
    | 'rakuten'           // 楽天証券
    | 'bitpoint'          // ビットポイント
    | 'au_kabucom'        // auカブコム証券
    | 'other';            // その他

/**
 * 国内株式 (Stored)
 */
// ... (Domestic Stock)
export interface StoredDomesticStock {
    type: 'domestic_stock';
    broker: Broker;
    account: AccountType;
    code: string;
    name: string;
    quantity: number;
    avgPrice: number;
}

export interface DomesticStock extends StoredDomesticStock {
    currentPrice: number;
    marketValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

/**
 * 海外株式 (Stored)
 */
export interface StoredForeignStock {
    type: 'foreign_stock';
    broker: Broker;
    account: AccountType;
    ticker: string;
    name: string;
    quantity: number;
    avgPriceUsd: number;
}

export interface ForeignStock extends StoredForeignStock {
    currentPriceUsd: number;
    marketValueUsd: number;
    marketValueJpy: number;
    marketValue: number; // For consistency (same as marketValueJpy)
    profitLossUsd: number;
    profitLossJpy: number;
}

/**
 * 投資信託 (Stored)
 */
export interface StoredInvestmentTrust {
    type: 'investment_trust';
    broker: Broker;
    account: AccountType;
    name: string;
    units: number;
    avgNavPrice: number;
    dividendMethod: 'reinvest' | 'receive';
}

export interface InvestmentTrust extends StoredInvestmentTrust {
    currentNavPrice: number;
    marketValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

/**
 * 仮想通貨 (Stored)
 */
export interface StoredCrypto {
    type: 'crypto';
    broker: Broker;
    symbol: string;
    name: string;
    quantity: number;
    avgPrice: number;
}

export interface Crypto extends StoredCrypto {
    currentPrice: number;
    marketValue: number;
    profitLoss: number;
}

/**
 * 債券 (Stored)
 */
export interface StoredBond {
    type: 'bond';
    broker: Broker;
    account: AccountType;
    name: string;
    faceValue: number;
    maturityDate: string;
    acquisitionCost: number;
}

export interface Bond extends StoredBond {
    marketValue: number;
    profitLoss: number;
    profitLossPercent: number;
}

/**
 * 全資産共通型 (Stored)
 */
export type StoredPortfolioAsset =
    | StoredDomesticStock
    | StoredForeignStock
    | StoredInvestmentTrust
    | StoredCrypto
    | StoredBond;

/**
 * 全資産共通型 (Enriched/Hydrated)
 */
export type PortfolioAsset =
    | DomesticStock
    | ForeignStock
    | InvestmentTrust
    | Crypto
    | Bond;

/**
 * ポートフォリオ全体
 */
// Dividend Data Types
export interface DividendEntry {
    month: string;
    stocks: number;
    staking: number;
    total: number;
    breakdown?: {
        name: string;
        value: number;
        type: 'stock' | 'staking';
    }[];
}

export interface Portfolio {
    updatedAt: string;
    assets: PortfolioAsset[];
    summary: {
        totalMarketValue: number;
        totalProfitLoss: number;
        totalProfitLossPercent: number;
    };
}

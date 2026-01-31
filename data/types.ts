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
    | 'other';            // その他

/**
 * 国内株式
 */
export interface DomesticStock {
    type: 'domestic_stock';
    broker: Broker;
    account: AccountType;
    code: string;           // 銘柄コード（例: "7203"）
    name: string;           // 銘柄名
    quantity: number;       // 保有株数
    avgPrice: number;       // 平均取得単価（円）
    currentPrice: number;   // 現在値（円）
    acquisitionCost: number; // 取得金額（円）
    marketValue: number;    // 評価額（円）
    profitLoss: number;     // 評価損益（円）
    profitLossPercent: number; // 評価損益（%）
}

/**
 * 海外株式
 */
export interface ForeignStock {
    type: 'foreign_stock';
    broker: Broker;
    account: AccountType;
    ticker: string;         // ティッカー（例: "AAPL"）
    name: string;           // 銘柄名
    quantity: number;       // 保有株数
    avgPriceUsd: number;    // 平均取得単価（USD）
    currentPriceUsd: number; // 現在値（USD）
    marketValueUsd: number; // 外貨建評価額（USD）
    marketValueJpy: number; // 円換算評価額（円）
    profitLossUsd: number;  // 外貨建評価損益（USD）
    profitLossJpy: number;  // 円換算評価損益（円）
}

/**
 * 投資信託
 */
export interface InvestmentTrust {
    type: 'investment_trust';
    broker: Broker;
    account: AccountType;
    name: string;           // ファンド名
    units: number;          // 保有口数
    avgNavPrice: number;    // 平均取得単価（円）
    currentNavPrice: number; // 基準価額（円）
    acquisitionCost: number; // 取得金額（円）
    marketValue: number;    // 評価額（円）
    profitLoss: number;     // 評価損益（円）
    profitLossPercent: number; // 評価損益（%）
    dividendMethod: 'reinvest' | 'receive'; // 分配金受取方法
}

/**
 * 仮想通貨
 */
export interface Crypto {
    type: 'crypto';
    broker: Broker;
    symbol: string;         // シンボル（例: "BTC"）
    name: string;           // 通貨名
    quantity: number;       // 保有数量
    avgPrice: number;       // 平均取得単価（円）
    currentPrice: number;   // 現在値（円）
    acquisitionCost: number; // 取得金額（円）
    marketValue: number;    // 評価額（円）
    profitLoss: number;     // 評価損益（円）
}

/**
 * 債券
 */
export interface Bond {
    type: 'bond';
    broker: Broker;
    account: AccountType;
    name: string;           // 銘柄名
    faceValue: number;      // 額面
    maturityDate: string;   // 満期日（YYYY/MM/DD）
    acquisitionCost: number; // 取得金額（円）
    marketValue: number;    // 評価額（円）
    profitLoss: number;     // 評価損益（円）
    profitLossPercent: number; // 評価損益（%）
}

/**
 * 全資産共通型
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
export interface Portfolio {
    updatedAt: string;      // 更新日時（ISO 8601）
    assets: PortfolioAsset[];
    summary: {
        totalMarketValue: number;     // 総評価額（円）
        totalProfitLoss: number;      // 総評価損益（円）
        totalProfitLossPercent: number; // 総評価損益（%）
    };
}

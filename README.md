# FinAnalytics Pro Terminal

**日本株・仮想通貨・コモディティ対応 統合型多機能分析プラットフォーム**

[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 📖 概要

日本国内で取引可能なあらゆる投資商品（株式、仮想通貨、金・銀等）を分析・管理できる、**PC閲覧専用の多機能分析サイト**です。

金融端末（Bloomberg Terminal等）を彷彿とさせる**情報密度の高いダークモードUI**を採用し、プロフェッショナルな投資分析環境を提供します。

---

## ✨ 主な機能

### 🔍 Page 1: Market Intelligence（AI分析 & センチメント監視）

| 機能 | 説明 |
|------|------|
| **AIニュースフィード** | 最新の決算短信やニュースをAIが「ポジティブ/ネガティブ」で色分けし、3つのポイントで要約表示 |
| **センチメント・ヒートマップ** | X(旧Twitter)や掲示板の盛り上がりをグリッド形式で可視化、トレンド銘柄にアニメーション効果 |
| **マルチアセット・ウォッチリスト** | 株式、ビットコイン、金などを一覧表示し、前日比をリアルタイム風に更新 |

### 💼 Page 2: Portfolio Simulator（配当 & 将来予測）

| 機能 | 説明 |
|------|------|
| **統合資産管理** | 株式の配当金、仮想通貨のステーキング報酬、貴金属の評価額を合算してダッシュボード表示 |
| **配当カレンダー** | 12ヶ月の配当・ステーキング収入予定をインタラクティブな棒グラフで表示 |
| **ライフプラン・シミュレーター** | 「月5万円の配当まであといくら必要か」を目標から逆算して計算、進捗をプログレスバーで可視化 |

### 📊 Page 3: Tactical Dashboard（相関分析 & スクリーナー）

| 機能 | 説明 |
|------|------|
| **マルチチャート** | PCの大画面を活かし、異なる資産（日経平均と金先物など）を重ね合わせて比較分析 |
| **高度なスクリーナー** | PER/PBR等の指標に加え、「SNS注目度」「AIスコア」でのフィルタリングが可能 |
| **相関マトリックス** | 各資産間の相関係数をカラーコードで数値化して表示 |

---

## 🛠️ 技術スタック

### フロントエンド

| カテゴリ | 技術 | バージョン |
|----------|------|-----------|
| **フレームワーク** | React | 19.0 |
| **ビルドツール** | Vite | 6.0 |
| **言語** | TypeScript | 5.6 |
| **チャート** | Recharts | 2.15 |
| **アイコン** | Lucide React | 0.469 |
| **スタイリング** | Vanilla CSS (カスタムプロパティ) | - |

### デザインシステム

```css
/* カラーパレット */
--bg-primary: #0a0f1a;        /* メイン背景 */
--bg-card: #1a2332;           /* カード背景 */
--accent-primary: #00d4aa;    /* プライマリアクセント */
--accent-secondary: #0ea5e9;  /* セカンダリアクセント */
--sentiment-positive: #22c55e; /* ポジティブ */
--sentiment-negative: #ef4444; /* ネガティブ */
```

---

## 📁 プロジェクト構成

```
stock_info_manage/
├── src/
│   ├── components/
│   │   ├── common/               # 共通コンポーネント
│   │   │   ├── Sidebar.tsx       # サイドバーナビゲーション
│   │   │   └── Sidebar.css
│   │   ├── market/               # Market Intelligence用
│   │   │   ├── NewsFeed.tsx      # AIニュースフィード
│   │   │   ├── SentimentHeatmap.tsx  # センチメントヒートマップ
│   │   │   └── WatchList.tsx     # ウォッチリスト
│   │   ├── portfolio/            # Portfolio Simulator用
│   │   │   ├── AssetSummary.tsx  # 統合資産管理
│   │   │   ├── DividendCalendar.tsx  # 配当カレンダー
│   │   │   └── LifePlanSimulator.tsx # ライフプランシミュレーター
│   │   └── tactical/             # Tactical Dashboard用
│   │       ├── MultiChart.tsx    # マルチチャート
│   │       ├── Screener.tsx      # 高度なスクリーナー
│   │       └── CorrelationMatrix.tsx # 相関マトリックス
│   ├── data/
│   │   └── mockData.ts           # ダミーデータ（API統合可能な構造）
│   ├── pages/
│   │   ├── MarketIntelligence.tsx
│   │   ├── PortfolioSimulator.tsx
│   │   └── TacticalDashboard.tsx
│   ├── styles/
│   │   └── index.css             # グローバルスタイル・デザインシステム
│   ├── App.tsx                   # メインアプリケーション
│   └── main.tsx                  # エントリーポイント
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 セットアップ

### 必要要件

- **Node.js** 18.0 以上
- **npm** 9.0 以上 または **yarn** 1.22 以上

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd stock_info_manage

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### 利用可能なスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | 開発サーバーを起動（http://localhost:5173） |
| `npm run build` | 本番用ビルドを作成 |
| `npm run preview` | 本番ビルドをプレビュー |
| `npm run lint` | ESLintでコードをチェック |

---

## 📊 データ構造

### ポートフォリオデータ

`data/` ディレクトリに保有投資商品のデータを管理します。

| ファイル | 説明 | Git |
|----------|------|-----|
| `data/types.ts` | 型定義（全資産タイプ対応） | ✅ アップ |
| `data/sampleData.ts` | サンプルデータ | ✅ アップ |
| `data/portfolioData.ts` | 実際の保有データ（マスター） | ❌ 除外 |
| `data/original/` | 証券会社からのCSVファイル | ❌ 除外 |

### 資産タイプ

```typescript
type AssetType = 
  | 'domestic_stock'    // 国内株式
  | 'foreign_stock'     // 海外株式
  | 'investment_trust'  // 投資信託
  | 'crypto'            // 仮想通貨
  | 'bond'              // 債券
  | 'commodity';        // コモディティ
```

### 主要インターフェース

#### 国内株式（DomesticStock）

```typescript
interface DomesticStock {
  type: 'domestic_stock';
  broker: 'sbi' | 'rakuten' | 'other';
  account: 'specific' | 'general' | 'nisa_growth' | 'nisa_tsumitate';
  code: string;           // 銘柄コード
  name: string;           // 銘柄名
  quantity: number;       // 保有株数
  avgPrice: number;       // 平均取得単価（円）
  currentPrice: number;   // 現在値（円）
  marketValue: number;    // 評価額（円）
  profitLoss: number;     // 評価損益（円）
  profitLossPercent: number;
}
```

#### 海外株式（ForeignStock）

```typescript
interface ForeignStock {
  type: 'foreign_stock';
  ticker: string;         // ティッカー
  name: string;           // 銘柄名
  quantity: number;       // 保有株数
  avgPriceUsd: number;    // 取得単価（USD）
  currentPriceUsd: number;
  marketValueJpy: number; // 円換算評価額
  profitLossJpy: number;  // 円換算損益
}
```

#### 投資信託（InvestmentTrust）

```typescript
interface InvestmentTrust {
  type: 'investment_trust';
  name: string;           // ファンド名
  units: number;          // 保有口数
  avgNavPrice: number;    // 平均取得単価
  currentNavPrice: number; // 基準価額
  marketValue: number;    // 評価額
  dividendMethod: 'reinvest' | 'receive';
}
```

#### 仮想通貨（Crypto）

```typescript
interface Crypto {
  type: 'crypto';
  symbol: string;         // BTC, ETH等
  quantity: number;       // 保有数量
  avgPrice: number;       // 平均取得単価（円）
  currentPrice: number;   // 現在値（円）
  marketValue: number;    // 評価額（円）
}
```

### サンプルデータの使用

```typescript
import { samplePortfolio } from './data/sampleData';

// ポートフォリオ全体の評価額
console.log(samplePortfolio.summary.totalMarketValue);

// 国内株式のみ取得
const domesticStocks = samplePortfolio.assets.filter(
  asset => asset.type === 'domestic_stock'
);
```

---

## 🔌 API統合ガイド

現在はダミーデータで動作していますが、以下のAPIとの統合を想定しています。

### 推奨API

| データ種別 | 推奨API | 用途 |
|------------|---------|------|
| 日本株 | [J-Quants API](https://jpx.gitbook.io/j-quants-ja/) | 株価・財務データ |
| 仮想通貨 | [CoinGecko API](https://www.coingecko.com/api/documentation) | リアルタイム価格 |
| 貴金属 | [Metals.live API](https://metals.live/) | 金・銀価格 |
| ニュース | [NewsAPI](https://newsapi.org/) | 金融ニュース |

### 統合方法

1. `src/data/mockData.ts` のダミーデータ生成関数をAPI呼び出しに置換
2. `src/hooks/` にカスタムフック（`useAssets`, `useNews` 等）を作成
3. React QueryやSWR等でキャッシュ・再検証を実装

---

## 🎨 UIカスタマイズ

### カラーテーマの変更

`src/styles/index.css` の CSS変数を編集することで、全体のカラーテーマを変更できます。

```css
:root {
  /* 背景色をカスタマイズ */
  --bg-primary: #YOUR_COLOR;
  
  /* アクセントカラーをカスタマイズ */
  --accent-primary: #YOUR_COLOR;
}
```

### フォントの変更

`index.html` のGoogle Fonts読み込み部分を編集してください。

---

## 📱 ブラウザサポート

| ブラウザ | サポート状況 |
|----------|-------------|
| Chrome 90+ | ✅ 完全サポート |
| Firefox 88+ | ✅ 完全サポート |
| Safari 14+ | ✅ 完全サポート |
| Edge 90+ | ✅ 完全サポート |

> ⚠️ **注意**: 本アプリケーションはPCブラウザ向けに最適化されています。モバイルデバイスでの利用は推奨しません。

---

## 🔧 開発ガイドライン

### コンポーネント作成規則

1. **ファイル構成**: 各コンポーネントは `.tsx` と `.css` をペアで作成
2. **命名規則**: PascalCase（例: `NewsFeed.tsx`）
3. **Props型定義**: 必ずinterfaceで定義

```typescript
interface ComponentNameProps {
  data: DataType[];
  onAction?: () => void;
}

export default function ComponentName({ data, onAction }: ComponentNameProps) {
  // 実装
}
```

### CSSクラス命名規則

BEM（Block Element Modifier）に準拠:

```css
.block {}
.block-element {}
.block-element.modifier {}
```

---

## 📄 ライセンス

MIT License

---

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## � 更新履歴

### 2026-02-01
- **UI/UX改善**: アプリケーション全体の数値表示を整数表記（小数点切り捨て）に統一し、視認性を向上
- **バグ修正**: `DividendCalendar` コンポーネントでデータ空時にクラッシュする不具合を修正
- **型定義修正**: `DomesticStock`, `Crypto`, `InvestmentTrust` 等の `acquisitionCost` プロパティの不整合を解消
- **機能改善**: 各種チャート・ツールチップのフォーマットを整数表示に最適化

---

## �📞 お問い合わせ

バグ報告や機能リクエストは、GitHubのIssuesにてお願いします。

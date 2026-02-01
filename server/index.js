import express from 'express';
import cors from 'cors';
import Parser from 'rss-parser';

const app = express();
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'media'],
            ['dc:creator', 'creator'],
        ]
    }
});

app.use(cors());
app.use(express.json());

// RSS Feed Sources - 金融ニュース関連
const RSS_FEEDS = {
    // 日本語ニュース
    nikkei: 'https://www.nikkei.com/rss/news.rdf',
    yahooFinanceJP: 'https://news.yahoo.co.jp/rss/topics/business.xml',

    // 仮想通貨ニュース  
    coinpost: 'https://coinpost.jp/?feed=rss2',

    // 海外金融ニュース
    yahooFinance: 'https://finance.yahoo.com/news/rssindex',
    marketwatch: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',

    // テック・株式
    techcrunch: 'https://techcrunch.com/feed/',
};

// ポートフォリオ銘柄のキーワード
const PORTFOLIO_KEYWORDS = [
    // 日本株
    'トヨタ', 'toyota', '7203',
    'NTT', '9432', '日本電信電話',
    // 米国株
    'apple', 'aapl', 'アップル',
    'nvidia', 'nvda', 'エヌビディア',
    // 仮想通貨
    'bitcoin', 'btc', 'ビットコイン',
    'ethereum', 'eth', 'イーサリアム',
    // 投信関連
    'emaxis', 'オルカン', 'オールカントリー', 'S&P500', 's&p', 'インデックス',
    // 一般金融
    '株価', '市場', '投資', '配当', '決算',
];

// Filter news by portfolio keywords
const filterByPortfolio = (items) => {
    return items.filter(item => {
        const text = `${item.title || ''} ${item.contentSnippet || ''} ${item.content || ''}`.toLowerCase();
        return PORTFOLIO_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()));
    });
};

// Sentiment analysis (simple keyword-based)
const analyzeSentiment = (text) => {
    const positiveWords = ['上昇', '好調', '最高', '増加', '成長', 'bullish', 'gains', 'surge', 'rally', '増益', '上方修正'];
    const negativeWords = ['下落', '低迷', '減少', '暴落', 'bearish', 'crash', 'drop', 'decline', '減益', '下方修正'];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
};

// Extract related assets from text
const extractRelatedAssets = (text) => {
    const assets = [];
    const lowerText = text.toLowerCase();

    if (lowerText.includes('トヨタ') || lowerText.includes('toyota') || lowerText.includes('7203')) assets.push('7203');
    if (lowerText.includes('ntt') || lowerText.includes('9432') || lowerText.includes('日本電信電話')) assets.push('9432');
    if (lowerText.includes('apple') || lowerText.includes('アップル') || lowerText.includes('aapl')) assets.push('AAPL');
    if (lowerText.includes('nvidia') || lowerText.includes('エヌビディア') || lowerText.includes('nvda')) assets.push('NVDA');
    if (lowerText.includes('bitcoin') || lowerText.includes('ビットコイン') || lowerText.includes('btc')) assets.push('BTC');
    if (lowerText.includes('ethereum') || lowerText.includes('イーサリアム') || lowerText.includes('eth')) assets.push('ETH');
    if (lowerText.includes('emaxis') || lowerText.includes('オルカン') || lowerText.includes('オールカントリー')) assets.push('eMAXIS');

    return assets.length > 0 ? assets : ['市場全般'];
};

// Calculate AI score based on relevance and sentiment
const calculateAiScore = (item, sentiment) => {
    let score = 50;

    // Boost for portfolio keywords
    const text = `${item.title || ''} ${item.contentSnippet || ''}`.toLowerCase();
    const matchCount = PORTFOLIO_KEYWORDS.filter(k => text.includes(k.toLowerCase())).length;
    score += matchCount * 5;

    // Boost for sentiment clarity
    if (sentiment !== 'neutral') score += 10;

    // Cap at 100
    return Math.min(score, 100);
};

// Fetch and parse RSS feed
const fetchFeed = async (url, sourceName) => {
    try {
        const feed = await parser.parseURL(url);
        return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate || item.isoDate,
            contentSnippet: item.contentSnippet || item.content?.substring(0, 200),
            source: sourceName,
        }));
    } catch (error) {
        console.error(`Error fetching ${sourceName}:`, error.message);
        return [];
    }
};

// API: Get portfolio-related news
app.get('/api/news', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const allNews = [];

        // Fetch from multiple sources in parallel
        const feedPromises = [
            fetchFeed(RSS_FEEDS.nikkei, '日経新聞'),
            fetchFeed(RSS_FEEDS.yahooFinanceJP, 'Yahoo!ファイナンス'),
            fetchFeed(RSS_FEEDS.coinpost, 'CoinPost'),
            fetchFeed(RSS_FEEDS.yahooFinance, 'Yahoo Finance'),
        ];

        const results = await Promise.allSettled(feedPromises);

        results.forEach(result => {
            if (result.status === 'fulfilled') {
                allNews.push(...result.value);
            }
        });

        // Filter by portfolio relevance
        let filteredNews = filterByPortfolio(allNews);

        // If not enough portfolio news, include general market news
        if (filteredNews.length < limit) {
            const generalNews = allNews
                .filter(item => !filteredNews.includes(item))
                .slice(0, limit - filteredNews.length);
            filteredNews = [...filteredNews, ...generalNews];
        }

        // Sort by date (newest first)
        filteredNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        // Transform to frontend format
        const transformedNews = filteredNews.slice(0, limit).map((item, index) => {
            const text = `${item.title || ''} ${item.contentSnippet || ''}`;
            const sentiment = analyzeSentiment(text);

            return {
                id: `rss-${index}-${Date.now()}`,
                title: item.title || 'No title',
                summary: item.contentSnippet
                    ? [item.contentSnippet.substring(0, 100) + '...']
                    : ['詳細はリンク先をご確認ください'],
                source: item.source,
                timestamp: item.pubDate || new Date().toISOString(),
                sentiment,
                relatedAssets: extractRelatedAssets(text),
                aiScore: calculateAiScore(item, sentiment),
                link: item.link,
            };
        });

        res.json({
            success: true,
            updatedAt: new Date().toISOString(),
            count: transformedNews.length,
            news: transformedNews,
        });

    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`RSS Proxy Server running on http://localhost:${PORT}`);
    console.log('Available endpoints:');
    console.log('  GET /api/news - Fetch portfolio-related news');
    console.log('  GET /api/health - Health check');
});

export type MarketStatus = 'open' | 'closed' | 'pre-market' | 'after-hours';

export interface MarketInfo {
    id: string;
    name: string;
    status: MarketStatus;
    nextOpen?: string;
    nextClose?: string;
}

export const getMarketStatus = (): MarketInfo[] => {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
    const utcHour = now.getUTCHours();
    const utcMinute = now.getUTCMinutes();
    const totalUtcMinutes = utcHour * 60 + utcMinute;

    // Helper: Convert generic time to string
    // Simplified for this demo, focusing on "Open" vs "Closed" in UI

    // --- TSE (Tokyo Stock Exchange) ---
    // Open: Mon-Fri 9:00-11:30, 12:30-15:00 JST
    // JST = UTC+9
    // 9:00 JST = 0:00 UTC
    // 11:30 JST = 2:30 UTC
    // 12:30 JST = 3:30 UTC
    // 15:00 JST = 6:00 UTC
    let tseStatus: MarketStatus = 'closed';
    if (utcDay >= 1 && utcDay <= 5) {
        if (
            (totalUtcMinutes >= 0 && totalUtcMinutes < 150) || // 0:00-2:30 UTC (9:00-11:30 JST)
            (totalUtcMinutes >= 210 && totalUtcMinutes < 360)  // 3:30-6:00 UTC (12:30-15:00 JST)
        ) {
            tseStatus = 'open';
        }
    }

    // --- NYSE (New York Stock Exchange) ---
    // Open: Mon-Fri 9:30-16:00 EST (UTC-5) / EDT (UTC-4)
    // Assuming Standard Time (UTC-5) for simplicity roughly
    // 9:30 EST = 14:30 UTC
    // 16:00 EST = 21:00 UTC
    // Note: Daylight savings adds complexity, strictly mocking standard for now or using simple boundaries
    let nyseStatus: MarketStatus = 'closed';
    if (utcDay >= 1 && utcDay <= 5) {
        if (totalUtcMinutes >= 870 && totalUtcMinutes < 1260) { // 14:30 - 21:00 UTC
            nyseStatus = 'open';
        }
    }

    // --- Crypto ---
    // 24/7
    const cryptoStatus: MarketStatus = 'open';

    return [
        { id: 'tse', name: '東証', status: tseStatus },
        { id: 'nyse', name: '米国', status: nyseStatus },
        { id: 'crypto', name: 'Crypto', status: cryptoStatus },
    ];
};

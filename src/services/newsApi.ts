// News API Service - Fetches real news from RSS proxy server

export interface RssNewsItem {
    id: string;
    title: string;
    summary: string[];
    source: string;
    timestamp: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    relatedAssets: string[];
    aiScore: number;
    link?: string;
}

export interface NewsApiResponse {
    success: boolean;
    updatedAt: string;
    count: number;
    news: RssNewsItem[];
    error?: string;
}

const API_BASE_URL = 'http://localhost:3001';

/**
 * Fetch portfolio-related news from RSS proxy server
 */
export const fetchNews = async (limit: number = 20): Promise<NewsApiResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/news?limit=${limit}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: NewsApiResponse = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to fetch news:', error);

        // Return empty response on error
        return {
            success: false,
            updatedAt: new Date().toISOString(),
            count: 0,
            news: [],
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};

/**
 * Check if the news server is available
 */
export const checkNewsServerHealth = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/health`);
        return response.ok;
    } catch {
        return false;
    }
};

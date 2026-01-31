import { useState, useEffect } from 'react';
import { PortfolioAsset } from '../../data/types';
import { storedPortfolioAssets } from '../../data/portfolioData';
import { fetchMarketData } from '../services/marketData';

export function usePortfolioData() {
    const [assets, setAssets] = useState<PortfolioAsset[]>([]);

    useEffect(() => {
        // Initial fetch
        const loadData = async () => {
            const data = await fetchMarketData(storedPortfolioAssets);
            setAssets(data);
        };
        loadData();

        // Update interval (5 minutes)
        const updateInterval = 5 * 60 * 1000;
        const intervalId = setInterval(async () => {
            const data = await fetchMarketData(storedPortfolioAssets);
            setAssets(data);
        }, updateInterval);

        return () => clearInterval(intervalId);
    }, []);

    return assets;
}

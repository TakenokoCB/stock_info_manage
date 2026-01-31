import { useState, useEffect } from 'react';
import { PortfolioAsset, DividendEntry } from '../../data/types';
import { fetchDividendData } from '../services/dividendData';

export function useDividendData(assets: PortfolioAsset[]) {
    const [dividendData, setDividendData] = useState<DividendEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        async function load() {
            setLoading(true);
            try {
                const data = await fetchDividendData(assets);
                if (active) {
                    setDividendData(data);
                }
            } catch (error) {
                console.error("Failed to fetch dividend data", error);
            } finally {
                if (active) setLoading(false);
            }
        }

        if (assets.length > 0) {
            load();
        } else {
            setDividendData([]);
            setLoading(false);
        }

        return () => { active = false; };
    }, [assets]);

    return { dividendData, loading };
}

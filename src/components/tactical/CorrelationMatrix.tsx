import { useMemo } from 'react';
import { Grid3X3 } from 'lucide-react';
import './CorrelationMatrix.css';

interface CorrelationMatrixProps {
    data: { asset1: string; asset2: string; correlation: number }[];
}

export default function CorrelationMatrix({ data }: CorrelationMatrixProps) {
    // Extract unique assets
    const assets = useMemo(() => {
        const uniqueAssets = new Set<string>();
        data.forEach(d => {
            uniqueAssets.add(d.asset1);
            uniqueAssets.add(d.asset2);
        });
        return Array.from(uniqueAssets);
    }, [data]);

    // Create matrix lookup
    const getCorrelation = (asset1: string, asset2: string): number | null => {
        const found = data.find(
            d => (d.asset1 === asset1 && d.asset2 === asset2) ||
                (d.asset1 === asset2 && d.asset2 === asset1)
        );
        return found ? found.correlation : null;
    };

    // Get color based on correlation value
    const getColor = (value: number | null): string => {
        if (value === null) return 'var(--bg-input)';
        if (value === 1) return 'var(--accent-primary)';
        if (value >= 0.7) return 'hsl(142, 60%, 40%)';
        if (value >= 0.4) return 'hsl(142, 40%, 35%)';
        if (value >= 0.1) return 'hsl(60, 40%, 35%)';
        if (value >= -0.1) return 'hsl(0, 0%, 30%)';
        if (value >= -0.4) return 'hsl(25, 50%, 40%)';
        return 'hsl(0, 60%, 45%)';
    };

    const getTextColor = (value: number | null): string => {
        if (value === null) return 'var(--text-muted)';
        return 'white';
    };

    return (
        <div className="correlation-matrix card">
            <div className="card-header">
                <h3 className="card-title">
                    <Grid3X3 size={18} />
                    相関マトリックス
                </h3>
            </div>

            <div className="matrix-container">
                <div className="matrix-grid" style={{ gridTemplateColumns: `80px repeat(${assets.length}, 1fr)` }}>
                    {/* Header row */}
                    <div className="matrix-cell header corner"></div>
                    {assets.map(asset => (
                        <div key={`header-${asset}`} className="matrix-cell header">
                            {asset}
                        </div>
                    ))}

                    {/* Data rows */}
                    {assets.map(rowAsset => (
                        <>
                            <div key={`row-${rowAsset}`} className="matrix-cell header row-header">
                                {rowAsset}
                            </div>
                            {assets.map(colAsset => {
                                const correlation = getCorrelation(rowAsset, colAsset);
                                return (
                                    <div
                                        key={`${rowAsset}-${colAsset}`}
                                        className={`matrix-cell data ${rowAsset === colAsset ? 'diagonal' : ''}`}
                                        style={{
                                            backgroundColor: getColor(correlation),
                                            color: getTextColor(correlation),
                                        }}
                                        title={`${rowAsset} vs ${colAsset}: ${correlation?.toFixed(2) || 'N/A'}`}
                                    >
                                        {correlation !== null ? correlation.toFixed(2) : '—'}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>

            <div className="matrix-legend">
                <span className="legend-label">相関係数:</span>
                <div className="legend-scale">
                    <div className="scale-item" style={{ background: 'hsl(0, 60%, 45%)' }}>-1.0</div>
                    <div className="scale-item" style={{ background: 'hsl(25, 50%, 40%)' }}>-0.5</div>
                    <div className="scale-item" style={{ background: 'hsl(0, 0%, 30%)' }}>0</div>
                    <div className="scale-item" style={{ background: 'hsl(142, 40%, 35%)' }}>+0.5</div>
                    <div className="scale-item" style={{ background: 'hsl(142, 60%, 40%)' }}>+1.0</div>
                </div>
                <div className="legend-description">
                    <span className="desc-item"><span className="positive">正</span>: 同方向に動く</span>
                    <span className="desc-item"><span className="negative">負</span>: 逆方向に動く</span>
                </div>
            </div>
        </div>
    );
}

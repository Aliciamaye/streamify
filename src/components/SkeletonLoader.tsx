import React from 'react';

export const SkeletonLoader: React.FC = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image shimmer"></div>
            <div className="skeleton-content">
                <div className="skeleton-title shimmer"></div>
                <div className="skeleton-subtitle shimmer"></div>
            </div>
        </div>
    );
};

export const SongListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
    return (
        <div className="song-grid">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonLoader key={i} />
            ))}
        </div>
    );
};

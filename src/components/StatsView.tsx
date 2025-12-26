import React from 'react';
import { BarChart, Activity, Music } from 'lucide-react';
import { Song } from '../types';

interface StatsViewProps {
    likedSongs: Song[];
}

export const StatsView: React.FC<StatsViewProps> = ({ likedSongs }) => {
    // Mock data for now since history DB is just being prioritized
    const topArtists = [
        { name: 'M83', count: 42 },
        { name: 'The Weeknd', count: 38 },
        { name: 'Tame Impala', count: 25 },
        { name: 'Daft Punk', count: 18 },
    ];

    return (
        <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] p-8 overflow-y-auto pb-40 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
                <Activity className="w-8 h-8 text-green-500" />
                Listening Stats
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Summary Card */}
                <div className="bg-[#181818] p-6 rounded-xl border border-white/5 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Music className="w-5 h-5 text-purple-400" /> Total Tracks Played
                    </h2>
                    <div className="text-4xl font-black text-white">124</div>
                    <div className="text-sm text-white/50 mt-2">Hours listened: 8.5</div>
                </div>

                {/* Top Artists Card */}
                <div className="bg-[#181818] p-6 rounded-xl border border-white/5 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <BarChart className="w-5 h-5 text-blue-400" /> Top Artists
                    </h2>
                    <div className="space-y-4">
                        {topArtists.map((artist, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium text-sm">{artist.name}</span>
                                        <span className="text-xs text-white/50">{artist.count} plays</span>
                                    </div>
                                    <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(artist.count / 50) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Liked Songs Stats */}
                <div className="bg-[#181818] p-6 rounded-xl border border-white/5 shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Library Stats</h2>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-white/70">Liked Songs</span>
                        <span className="font-bold">{likedSongs.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-white/5">
                        <span className="text-white/70">Playlists Created</span>
                        <span className="font-bold">3</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

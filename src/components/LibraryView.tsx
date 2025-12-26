import React from 'react';
import { Playlist, Song } from '../types';
import { Heart, ListMusic, Plus, Clock } from 'lucide-react';

interface LibraryViewProps {
    playlists: Playlist[];
    likedSongs: Song[];
    onPlayPlaylist: (playlist: Playlist) => void;
    onPlaySong: (song: Song) => void;
    onSelectPlaylist: (playlist: Playlist) => void;
    onCreatePlaylist: () => void;
    accentColor: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
    playlists, likedSongs, onPlayPlaylist, onPlaySong, onSelectPlaylist, onCreatePlaylist, accentColor
}) => {
    return (
        <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-auto pb-40 p-4 md:p-8 animate-fade-in">
            <h1 className="text-3xl font-bold mb-8">Your Library</h1>

            {/* Stats / Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <div
                    onClick={onCreatePlaylist}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Create Playlist</h3>
                    <p className="text-sm text-white/50">Curate your own vibes</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl border border-white/5 relative overflow-hidden group cursor-pointer">
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
                        </div>
                        <h3 className="font-bold text-lg">Liked Songs</h3>
                        <p className="text-sm text-white/50">{likedSongs.length} songs</p>
                    </div>
                    <Heart className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
                </div>
            </div>

            {/* Playlists Grid */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ListMusic className="w-5 h-5" style={{ color: accentColor }} />
                Playlists
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
                {playlists.map(playlist => (
                    <div
                        key={playlist.id}
                        onClick={() => onSelectPlaylist(playlist)}
                        className="bg-[#181818] hover:bg-[#282828] p-4 rounded-lg transition-all cursor-pointer group"
                    >
                        <div className="relative mb-3 shadow-lg aspect-square">
                            <img src={playlist.coverUrl} className="w-full h-full object-cover rounded-md" alt="" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                                    onClick={(e) => { e.stopPropagation(); onPlayPlaylist(playlist); }}
                                >
                                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-bold truncate text-sm md:text-base">{playlist.name}</h3>
                        <p className="text-xs text-[#b3b3b3] truncate">{playlist.songs.length} songs</p>
                    </div>
                ))}
            </div>

            {/* Liked Songs List */}
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5" style={{ color: accentColor }} />
                Liked Songs
            </h2>
            <div className="bg-[#181818]/50 rounded-xl overflow-hidden">
                {likedSongs.length === 0 ? (
                    <div className="p-8 text-center text-white/50">No liked songs yet. Go explore!</div>
                ) : (
                    likedSongs.map((song, i) => (
                        <div key={song.id} className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => onPlaySong(song)}>
                            <div className="w-8 text-center text-[#b3b3b3] text-sm group-hover:hidden">{i + 1}</div>
                            <div className="w-8 text-center hidden group-hover:block">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent mx-auto"></div>
                            </div>
                            <img src={song.coverUrl} className="w-10 h-10 rounded" alt="" />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-white truncate" style={{ color: i === -1 ? accentColor : 'white' }}>{song.title}</div>
                                <div className="text-sm text-[#b3b3b3] truncate">{song.artist}</div>
                            </div>
                            <div className="text-sm text-[#b3b3b3] hidden md:block">{song.album}</div>
                            <div className="text-sm text-[#b3b3b3] w-12 text-right">{song.duration}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

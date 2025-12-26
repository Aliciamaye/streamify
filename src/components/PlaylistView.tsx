import React from 'react';
import { Play, Clock3, MoreHorizontal, Wand2 } from 'lucide-react';
import { Playlist, Song } from '../types';

interface PlaylistViewProps {
  playlist: Playlist;
  onPlaySong: (song: Song) => void;
  onEditCover: (playlist: Playlist) => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlist, onPlaySong, onEditCover }) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-auto pb-32">
      {/* Header */}
      <div className={`h-80 bg-gradient-to-b ${playlist.color} to-transparent p-8 flex items-end gap-6`}>
        <div className="relative group shadow-2xl">
           <img 
            src={playlist.coverUrl} 
            alt={playlist.name} 
            className="w-52 h-52 object-cover shadow-[0_8px_40px_rgba(0,0,0,0.5)]" 
           />
           {/* Edit overlay */}
           <div 
             onClick={() => onEditCover(playlist)}
             className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
           >
             <Wand2 className="w-10 h-10 text-white mb-2" />
             <span className="text-white font-bold text-sm">Edit with AI</span>
           </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider">Playlist</span>
          <h1 className="text-7xl font-black tracking-tight">{playlist.name}</h1>
          <p className="text-[#e0e0e0] mt-4 text-sm font-medium opacity-80">{playlist.description}</p>
          <div className="flex items-center gap-1 text-sm font-bold mt-2">
            <span>Streamify</span>
            <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
            <span>{playlist.songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 py-6 flex items-center gap-8">
        <button 
            className="w-14 h-14 bg-[#1ed760] rounded-full flex items-center justify-center hover:scale-105 transition-transform hover:bg-[#3be477]"
            onClick={() => playlist.songs.length > 0 && onPlaySong(playlist.songs[0])}
        >
          <Play className="w-7 h-7 text-black fill-black ml-1" />
        </button>
        <MoreHorizontal className="w-8 h-8 text-[#b3b3b3] hover:text-white cursor-pointer" />
      </div>

      {/* Table Header */}
      <div className="px-8 sticky top-0 bg-[#121212] z-10 border-b border-[#282828] mb-4">
        <div className="grid grid-cols-[16px_1fr_1fr_40px] gap-4 py-2 px-4 text-[#b3b3b3] text-sm uppercase">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <Clock3 className="w-4 h-4 justify-self-end" />
        </div>
      </div>

      {/* Songs */}
      <div className="px-8 flex flex-col">
        {playlist.songs.map((song, idx) => (
          <div 
            key={song.id}
            onClick={() => onPlaySong(song)}
            className="grid grid-cols-[16px_1fr_1fr_40px] gap-4 py-2 px-4 text-[#b3b3b3] text-sm hover:bg-[#2a2a2a] rounded-md group cursor-pointer items-center"
          >
            <span className="group-hover:text-white">{idx + 1}</span>
            <div className="flex items-center gap-4">
               <img src={song.coverUrl} className="w-10 h-10" alt="" />
               <div className="flex flex-col">
                 <span className="text-white font-medium text-base group-hover:underline">{song.title}</span>
                 <span className="group-hover:text-white">{song.artist}</span>
               </div>
            </div>
            <span className="group-hover:text-white">{song.album}</span>
            <span className="justify-self-end group-hover:text-white">{song.duration}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
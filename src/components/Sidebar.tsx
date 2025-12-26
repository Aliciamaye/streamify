import React from 'react';
import { Home, Search, Library, PlusSquare, Heart, Sparkles, Music, Mic, Settings, Activity } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onCreatePlaylist: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onCreatePlaylist }) => {
  const getItemClass = (view: ViewState) =>
    `flex items-center gap-4 cursor-pointer hover:text-white transition-colors py-1 ${currentView === view ? 'text-white' : 'text-[#b3b3b3]'}`;

  return (
    <div className="hidden md:flex w-64 bg-black h-full flex-col p-6 gap-6 flex-shrink-0 z-40 border-r border-[#282828]">
      <div className="flex items-center gap-2 mb-2 text-white cursor-pointer hover:scale-105 transition-transform" onClick={() => onChangeView('home')}>
        <div className="bg-white p-1.5 rounded-lg">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <span className="font-bold text-xl tracking-tighter">Streamify</span>
      </div>

      <nav className="flex flex-col gap-3">
        <div className={getItemClass('home')} onClick={() => onChangeView('home')}>
          <Home className="w-6 h-6" />
          <span className="font-bold">Home</span>
        </div>
        <div className={getItemClass('search')} onClick={() => onChangeView('search')}>
          <Search className="w-6 h-6" />
          <span className="font-bold">Search</span>
        </div>
        <div className={getItemClass('library')} onClick={() => onChangeView('library')}>
          <Library className="w-6 h-6" />
          <span className="font-bold">Your Library</span>
        </div>
      </nav>

      <div className="mt-2 pt-4 border-t border-[#282828] flex flex-col gap-3">
        <div className="flex items-center gap-4 cursor-pointer text-[#b3b3b3] hover:text-white transition-colors" onClick={onCreatePlaylist}>
          <div className="bg-[#b3b3b3] p-1 rounded-sm">
            <PlusSquare className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold">Create Playlist</span>
        </div>
        <div className="flex items-center gap-4 cursor-pointer text-[#b3b3b3] hover:text-white transition-colors" onClick={() => onChangeView('library')}>
          <div className="bg-gradient-to-br from-indigo-700 to-blue-300 p-1 rounded-sm opacity-70">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold">Liked Songs</span>
        </div>
        <div className="flex items-center gap-4 cursor-pointer text-[#b3b3b3] hover:text-white transition-colors" onClick={() => alert("Podcasts coming soon!")}>
          <div className="bg-green-700 p-1 rounded-sm opacity-70">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Podcasts</span>
        </div>
        {/* New Settings Link */}
        <div className={getItemClass('settings')} onClick={() => onChangeView('settings')}>
          <Settings className="w-6 h-6" />
          <span className="font-bold">Settings</span>
        </div>
        <div className={getItemClass('stats')} onClick={() => onChangeView('stats')}>
          <Activity className="w-6 h-6" />
          <span className="font-bold">Stats & History</span>
        </div>
      </div>

      <div className="mt-auto bg-gradient-to-br from-[#1a1a1a] to-[#282828] rounded-xl p-5 border border-white/5 shadow-lg group">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-4 h-4 text-[#1ed760]" />
            <span className="font-bold text-sm">AI Studio</span>
          </div>
          <p className="text-xs text-[#b3b3b3] leading-relaxed group-hover:text-white transition-colors">Create custom covers or generate playlists from moods.</p>
          <button
            onClick={() => onChangeView('ai-editor')}
            className="bg-white text-black text-sm font-bold py-2 px-4 rounded-full mt-2 hover:scale-105 transition-transform w-full shadow-lg"
          >
            Open Studio
          </button>
        </div>
      </div>
    </div>
  );
};

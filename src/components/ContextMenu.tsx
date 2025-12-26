import React, { useEffect, useRef } from 'react';
import { Play, ListPlus, Heart, Share2, Radio, Disc, Mic2, Trash2 } from 'lucide-react';
import { Song, Playlist } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  type: 'song' | 'playlist';
  data: any;
  onClose: () => void;
  onAction: (action: string, data: any) => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, type, data, onClose, onAction }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position if it goes off screen
  const style = {
    top: Math.min(y, window.innerHeight - 300),
    left: Math.min(x, window.innerWidth - 250),
  };

  const handleAction = (action: string) => {
    onAction(action, data);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="fixed z-[100] w-56 bg-[#282828] border border-[#3e3e3e] rounded-md shadow-2xl py-1 animate-scale-in origin-top-left"
      style={style}
    >
      {type === 'song' && (
        <>
           <div className="px-4 py-2 border-b border-white/10 mb-1">
             <div className="font-bold text-sm truncate text-white">{(data as Song).title}</div>
             <div className="text-xs text-[#b3b3b3] truncate">{(data as Song).artist}</div>
           </div>
           
           <MenuItem icon={Play} label="Play Now" onClick={() => handleAction('play')} />
           <MenuItem icon={ListPlus} label="Add to Queue" onClick={() => handleAction('queue')} />
           <MenuItem icon={Heart} label="Save to Liked Songs" onClick={() => handleAction('like')} />
           <div className="h-px bg-white/10 my-1 mx-2" />
           <MenuItem icon={Radio} label="Go to Artist Radio" onClick={() => handleAction('artist')} />
           <MenuItem icon={Disc} label="Go to Album" onClick={() => handleAction('album')} />
           <MenuItem icon={Mic2} label="Show Lyrics" onClick={() => handleAction('lyrics')} />
           <div className="h-px bg-white/10 my-1 mx-2" />
           <MenuItem icon={Share2} label="Share" onClick={() => handleAction('share')} />
        </>
      )}

      {type === 'playlist' && (
        <>
           <div className="px-4 py-2 border-b border-white/10 mb-1">
             <div className="font-bold text-sm truncate text-white">{(data as Playlist).name}</div>
           </div>
           <MenuItem icon={Play} label="Play Playlist" onClick={() => handleAction('play')} />
           <MenuItem icon={ListPlus} label="Add to Queue" onClick={() => handleAction('queue')} />
           <div className="h-px bg-white/10 my-1 mx-2" />
           <MenuItem icon={Share2} label="Share" onClick={() => handleAction('share')} />
           <MenuItem icon={Trash2} label="Delete Playlist" onClick={() => handleAction('delete')} variant="danger" />
        </>
      )}
    </div>
  );
};

const MenuItem: React.FC<{ icon: any, label: string, onClick: () => void, variant?: 'default' | 'danger' }> = ({ icon: Icon, label, onClick, variant = 'default' }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[#3e3e3e] transition-colors ${variant === 'danger' ? 'text-red-400 hover:text-red-300' : 'text-[#e0e0e0] hover:text-white'}`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, ListMusic, Loader2, Heart, Maximize2, ChevronDown } from 'lucide-react';
import { Song } from '../types';
import { Visualizer } from './Visualizer';
import { isSongDownloaded } from '../services/db';
import { musicEngine } from '../services/MusicEngine';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  accentColor: string;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (val: number) => void;
  onToggleLyrics: () => void;
  onDownload: (song: Song) => void;
  onLike: (song: Song) => void;
  isLiked: boolean;
  showLyrics: boolean;
  queue: Song[];
  onSeek: (time: number) => void;
  repeatMode: string; // 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle'
  onToggleRepeat: () => void;
  shuffle: boolean;
  onToggleShuffle: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  currentSong, isPlaying, volume, accentColor, onPlayPause, onNext, onPrev, onVolumeChange, onLike, isLiked, queue, onSeek, repeatMode, onToggleRepeat, shuffle, onToggleShuffle
}) => {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const requestRef = useRef<number>(0);

  // Sync Duration when song changes
  useEffect(() => {
    if (currentSong) {
      // We can get duration from engine if metadata loaded, or reset
      setDuration(musicEngine.duration || 0);
      setProgress(0);
    }
  }, [currentSong]);

  // Animation Loop for progress
  const updateProgress = () => {
    setProgress(musicEngine.currentTime);
    setDuration(musicEngine.duration);
    requestRef.current = requestAnimationFrame(updateProgress);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateProgress);
    } else {
      cancelAnimationFrame(requestRef.current);
      // Sync one last time to be sure
      setProgress(musicEngine.currentTime);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setProgress(time);
    onSeek(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  if (!currentSong) return null;

  // --- Full Screen Player ---
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-gradient-to-b from-gray-900 to-black flex flex-col p-8 animate-slide-up">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => setIsFullScreen(false)} className="p-2 hover:bg-white/10 rounded-full text-white">
            <ChevronDown className="w-8 h-8" />
          </button>
          <div className="text-xs font-bold tracking-widest uppercase text-white/50">Playing Now</div>
          <button className="p-2 hover:bg-white/10 rounded-full text-white">
            <ListMusic className="w-6 h-6" onClick={() => setShowQueue(!showQueue)} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <img src={currentSong.coverUrl} className="w-full max-w-sm aspect-square rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="" />
        </div>

        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h1>
              <p className="text-lg text-white/60">{currentSong.artist}</p>
            </div>
            <Heart className={`w-8 h-8 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} onClick={() => onLike(currentSong)} />
          </div>

          <div className="mb-6">
            <input
              type="range"
              min="0" max={duration || 100}
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
            />
            <div className="flex justify-between text-xs text-white/50 mt-2 font-mono">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Shuffle className={`w-6 h-6 ${shuffle ? 'text-green-500' : 'text-white/60'}`} onClick={onToggleShuffle} />
            <SkipBack className="w-10 h-10 text-white cursor-pointer" onClick={onPrev} />
            <button onClick={onPlayPause} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
              {isPlaying ? <Pause className="w-8 h-8 text-black fill-black" /> : <Play className="w-8 h-8 text-black fill-black ml-1" />}
            </button>
            <SkipForward className="w-10 h-10 text-white cursor-pointer" onClick={onNext} />
            <Repeat className={`w-6 h-6 ${repeatMode !== 'normal' ? 'text-green-500' : 'text-white/60'}`} onClick={onToggleRepeat} />
            {repeatMode === 'repeat-one' && <span className="absolute text-[10px] text-green-500 font-bold ml-1 -mt-2">1</span>}
          </div>
        </div>
      </div>
    );
  }

  // --- Normal Player Bar ---
  return (
    <>
      {/* Queue Drawer */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-80 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl p-4 z-40 max-h-[60vh] overflow-y-auto animate-fade-in-up">
          <h3 className="font-bold text-white mb-4 border-b border-white/10 pb-2">Queue ({queue.length})</h3>
          {queue.length === 0 ? (
            <p className="text-white/50 text-sm">Queue is empty</p>
          ) : (
            queue.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer group">
                <span className="text-xs text-green-500 w-4">{i + 1}</span>
                <img src={s.coverUrl} className="w-8 h-8 rounded" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-white">{s.title}</div>
                  <div className="text-xs text-white/50 truncate">{s.artist}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <div className="h-20 md:h-24 bg-[#181818]/95 backdrop-blur-xl border-t border-[#282828] flex items-center justify-between px-4 md:px-6 fixed bottom-[50px] md:bottom-0 w-full z-50 transition-all duration-300 shadow-[0_-5px_30px_rgba(0,0,0,0.5)]">

        {/* Info */}
        <div className="flex items-center gap-3 md:gap-4 w-[30%]">
          <div className="relative group flex-shrink-0 cursor-pointer" onClick={() => setIsFullScreen(true)}>
            <img src={currentSong.coverUrl} alt="Cover" className={`w-12 h-12 md:w-14 md:h-14 rounded-md shadow-lg object-cover ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
              <Maximize2 className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="text-white text-xs md:text-sm font-bold truncate hover:underline cursor-pointer">{currentSong.title}</span>
            <span className="text-[#b3b3b3] text-[10px] md:text-xs truncate hover:underline cursor-pointer">{currentSong.artist}</span>
          </div>
          <Heart
            className={`w-4 h-4 ml-2 cursor-pointer transition-transform duration-200 ${isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-[#b3b3b3] hover:scale-110 active:scale-90'}`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent full screen toggle
              onLike(currentSong);
              const el = e.currentTarget;
              el.classList.add('animate-bounce');
              setTimeout(() => el.classList.remove('animate-bounce'), 500);
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-1 md:gap-2 w-[40%]">
          <div className="flex items-center gap-4 md:gap-6">
            <Shuffle className={`hidden md:block w-4 h-4 cursor-pointer transition-colors ${shuffle ? 'text-green-500' : 'text-[#b3b3b3] hover:text-white'}`} onClick={onToggleShuffle} />
            <SkipBack onClick={onPrev} className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
            <button onClick={onPlayPause} className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg">
              {isPlaying ? <Pause className="w-4 h-4 md:w-5 md:h-5 text-black fill-black" /> : <Play className="w-4 h-4 md:w-5 md:h-5 text-black fill-black ml-0.5" />}
            </button>
            <SkipForward onClick={onNext} className="w-5 h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
            <div className="relative">
              <Repeat className={`hidden md:block w-4 h-4 cursor-pointer transition-colors ${repeatMode !== 'normal' ? 'text-green-500' : 'text-[#b3b3b3] hover:text-white'}`} onClick={onToggleRepeat} />
              {repeatMode === 'repeat-one' && <span className="absolute -top-1 -right-1 text-[8px] font-bold text-green-500 bg-[#181818] px-0.5 rounded-full">1</span>}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-[#b3b3b3] w-10 text-right font-mono">{formatTime(progress)}</span>
            <div className="flex-1 relative h-1 bg-[#4d4d4d] rounded-full group cursor-pointer">
              <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className="absolute top-0 left-0 h-full bg-white rounded-full group-hover:opacity-80 transition-colors" style={{ width: `${(progress / (duration || 1)) * 100}%`, backgroundColor: accentColor }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className="text-xs text-[#b3b3b3] w-10 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center justify-end gap-3 w-[30%] relative">
          <Visualizer isPlaying={isPlaying} />
          <ListMusic className={`w-4 h-4 cursor-pointer hidden md:block ${showQueue ? 'text-green-500' : 'text-[#b3b3b3]'}`} onClick={() => setShowQueue(!showQueue)} />
          <div className="hidden md:flex items-center gap-2 w-24 group">
            <Volume2 className="w-4 h-4 text-[#b3b3b3]" />
            <div className="h-1 flex-1 bg-[#4d4d4d] rounded-full relative overflow-hidden">
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="h-full group-hover:opacity-80" style={{ width: `${volume * 100}%`, backgroundColor: accentColor }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

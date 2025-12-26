import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { Player } from './Player';
import { PlaylistView } from './PlaylistView';
import { LibraryView } from './LibraryView';
import { AIImageEditor } from './AIImageEditor';
import { LyricsView } from './LyricsView';
import { SettingsView } from './SettingsView';
import { ToastContainer } from './Toast';
import { SongListSkeleton } from './SkeletonLoader';
import { ContextMenu } from './ContextMenu';
import { StatsView } from './StatsView';
import { Visualizer } from './Visualizer';
import { DEMO_PLAYLISTS } from '../constants';
import { Playlist, Song, ViewState, ToastMessage, User, ContextMenuState } from '../types';
import {
  Home, Search as SearchIcon, Library, PlusCircle, Heart, Settings,
  LogOut, Menu, X, Music, User as UserIcon, Keyboard, Maximize2,
  Wand2, Plus, Music as Music2, Loader2
} from 'lucide-react';
import { musicEngine } from '../services/MusicEngine';
import { initDB } from '../services/db';
import { useMusicEngine } from '../hooks/useMusicEngine';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  // Navigation
  const [currentView, setCurrentView] = useState<ViewState>('home');

  // Data
  const [playlists, setPlaylists] = useState<Playlist[]>(DEMO_PLAYLISTS);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [homeSongs, setHomeSongs] = useState<Song[]>([]);

  // Engine
  const engine = useMusicEngine();
  // Map engine mode to UI toggle states
  const isShuffle = engine.repeatMode === 'shuffle';
  // Simplified mapping: engine has specific modes, UI might toggle them differently.
  // We'll pass the engine's raw mode and let Player handle display, or map it here.

  // History for UI (Engine keeps a queue, but history is often separate)
  // For now we rely on Engine's internal playlist management.

  // Appearance
  const [accentColor, setAccentColor] = useState('#1ed760');

  // Context Menu & Modals
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Search & AI
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [moodPrompt, setMoodPrompt] = useState('');

  // UI
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsText, setLyricsText] = useState<string>(''); // Placeholder for actual lyrics service
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [isLoadingHome, setIsLoadingHome] = useState(true);

  // --- INITIALIZATION ---
  useEffect(() => {
    setIsLoadingHome(true);
    musicEngine.getCharts().then(songs => {
      setHomeSongs(songs);
      setIsLoadingHome(false);
    }).catch(error => {
      console.error('Failed to load home songs:', error);
      addToast('Failed to load trending songs', 'error');
      setIsLoadingHome(false);
    });

    initDB().then(db => {
      const tx = db.transaction("favorites", "readonly");
      const request = tx.objectStore("favorites").getAll();
      request.onsuccess = () => setLikedSongs(request.result);
    });

    const savedColor = localStorage.getItem('streamify_accent_color');
    if (savedColor) setAccentColor(savedColor);
  }, []);

  const handleUpdateAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('streamify_accent_color', color);
  };

  // --- SHORTCUTS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          engine.togglePlay();
          break;
        case 'ArrowRight':
          engine.seek(engine.currentTime + 5);
          break;
        case 'ArrowLeft':
          engine.seek(engine.currentTime - 5);
          break;
        case 'KeyM':
          engine.setVolume(engine.volume === 0 ? 0.8 : 0);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handlePlaySong = (song: Song, contextPlaylist?: Song[]) => {
    if (contextPlaylist) {
      // Reset queue with this context
      engine.setQueue(contextPlaylist);
      engine.play(song);
    } else {
      engine.play(song);
    }
  };

  const handleToggleLike = async (song: Song) => {
    const isLiked = likedSongs.some(s => s.id === song.id);
    let newLiked;

    const db = await initDB();
    const tx = db.transaction("favorites", "readwrite");
    const store = tx.objectStore("favorites");

    if (isLiked) {
      store.delete(song.id);
      newLiked = likedSongs.filter(s => s.id !== song.id);
      addToast("Removed from Liked Songs", 'info');
    } else {
      store.put(song);
      newLiked = [...likedSongs, song];
      addToast("Added to Liked Songs", 'success');
    }
    setLikedSongs(newLiked);
  };

  // --- CONTEXT MENU HANDLER ---
  const handleContextMenu = (e: React.MouseEvent, type: 'song' | 'playlist', data: any) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type,
      data
    });
  };

  const handleContextMenuAction = (action: string, data: any) => {
    if (action === 'play') handlePlaySong(data);
    if (action === 'queue') {
      engine.addToQueue(data);
      addToast("Added to Queue", 'success');
    }
    if (action === 'like') handleToggleLike(data);
    if (action === 'delete' && contextMenu?.type === 'playlist') {
      setPlaylists(prev => prev.filter(p => p.id !== data.id));
      addToast("Playlist Deleted", 'info');
    }
  };

  // --- PLAYLIST CREATION ---
  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    const newPlaylist: Playlist = {
      id: `custom-${Date.now()}`,
      name: newPlaylistName,
      description: 'My custom playlist',
      coverUrl: 'https://picsum.photos/500/500',
      songs: [],
      color: 'from-gray-700'
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName('');
    setShowCreatePlaylist(false);
    addToast(`Created playlist "${newPlaylist.name}"`, 'success');
  };

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        if (!query.trim()) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        setIsSearching(true);
        timeoutId = setTimeout(async () => {
          try {
            const results = await musicEngine.search(query);
            setSearchResults(results);
            if (results.length === 0) {
              addToast('No results found', 'info');
            }
          } catch (error) {
            addToast('Search failed. Using fallback music.', 'error');
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        }, 500);
      };
    })(),
    []
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    debouncedSearch(searchQuery);
  };

  // Auto-search as user types
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const renderHome = () => (
    <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-auto pb-40 p-4 md:p-8">
      {/* AI Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 w-full md:w-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-2 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-yellow-300" />
            AI Playlist Generator
          </h2>
          <p className="text-[#e0e0e0] mb-4 max-w-lg text-sm md:text-base">Enter a mood, and Gemini will curate the vibe.</p>
          <div className="flex gap-2 w-full">
            <input
              type="text"
              value={moodPrompt}
              onChange={(e) => setMoodPrompt(e.target.value)}
              placeholder="e.g., 'Rainy jazz cafe'"
              className="bg-black/30 border border-white/20 rounded-full px-4 py-2 flex-1 md:w-80 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-400"
            />
            <button
              className="bg-white text-black px-4 md:px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform"
            >
              Go
            </button>
          </div>
        </div>
        <Music2 className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/5 rotate-12" />
      </div>

      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Made For You</h2>
      {isLoadingHome ? (
        <SongListSkeleton count={10} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {homeSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song, homeSongs)}
              onContextMenu={(e) => handleContextMenu(e, 'song', song)}
              className="bg-[#181818] p-3 md:p-4 rounded-lg hover:bg-[#282828] transition-colors cursor-pointer group animate-fade-in"
            >
              <div className="relative mb-3">
                <img src={song.coverUrl} className="w-full aspect-square object-cover rounded-md shadow-lg" alt="" loading="lazy" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: accentColor }}>
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <h3 className="font-bold truncate mb-1 text-white text-sm md:text-base">{song.title}</h3>
              <p className="text-xs md:text-sm text-[#b3b3b3] truncate">{song.artist}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Your Playlists</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Create New Card */}
        <div
          onClick={() => setShowCreatePlaylist(true)}
          className="bg-[#181818] hover:bg-[#282828] border-2 border-dashed border-[#333] transition-all p-3 md:p-4 rounded-lg cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-sm">Create Playlist</span>
        </div>

        {playlists.map(playlist => (
          <div
            key={playlist.id}
            onClick={() => { setSelectedPlaylist(playlist); setCurrentView('playlist'); }}
            onContextMenu={(e) => handleContextMenu(e, 'playlist', playlist)}
            className="bg-[#181818] hover:bg-[#282828] transition-all p-3 md:p-4 rounded-lg cursor-pointer group"
          >
            <div className="relative mb-3 shadow-lg">
              <img src={playlist.coverUrl} alt={playlist.name} className="w-full aspect-square object-cover rounded-md" />
            </div>
            <h3 className="font-bold truncate text-sm md:text-base">{playlist.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-white/30" onClick={() => setContextMenu(null)}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={handleContextMenuAction}
        />
      )}

      {/* Create Playlist Modal */}
      {showCreatePlaylist && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#282828] p-6 rounded-xl w-full max-w-sm animate-scale-in">
            <h3 className="text-xl font-bold mb-4">Create Playlist</h3>
            <input
              autoFocus
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              placeholder="Playlist Name"
              className="w-full bg-[#3e3e3e] p-3 rounded-md text-white mb-4 outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={e => e.key === 'Enter' && handleCreatePlaylist()}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreatePlaylist(false)} className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white">Cancel</button>
              <button onClick={handleCreatePlaylist} className="px-6 py-2 bg-green-500 rounded-full text-black font-bold text-sm hover:scale-105 transition-transform">Create</button>
            </div>
          </div>
        </div>
      )}

      <Sidebar
        currentView={currentView}
        onChangeView={(view) => {
          setCurrentView(view);
          setShowLyrics(false); // Ensure lyrics mode is exited when navigating
        }}
        onCreatePlaylist={() => setShowCreatePlaylist(true)}
      />
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowShortcuts(false)}>
          <div className="bg-[#181818] border border-white/10 rounded-xl p-8 max-w-md w-full shadow-2xl scale-100" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Keyboard className="w-6 h-6 text-green-500" /> Keyboard Shortcuts
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/70">Play / Pause</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">Space</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/70">Next Track</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">N</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/70">Previous Track</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">P</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/70">Mute / Unmute</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">M</kbd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-white/70">Seek Forward 10s</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">L</kbd>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-white/70">Seek Backward 10s</span>
                <kbd className="bg-white/10 px-2 py-1 rounded text-sm min-w-[30px] text-center">J</kbd>
              </div>
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-8 w-full py-3 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Zen Mode Overlay */}
      {currentView === 'zen' && (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-fade-in cursor-none" onClick={() => setCurrentView('home')}>
          <div className="text-white/20 mb-8 text-2xl font-light tracking-widest uppercase">Zen Mode</div>
          <Visualizer isPlaying={engine.isPlaying} />
          <div className="mt-8 text-white/10 text-sm">Click anywhere to exit</div>
        </div>
      )}

      {/* Main Content Area */}
      {currentView !== 'zen' && (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute top-4 right-8 z-40 hidden md:flex items-center gap-4">
            {/* Shortcuts Prompt */}
            <button onClick={() => setShowShortcuts(true)} className="p-2 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white" title="Keyboard Shortcuts">
              <Keyboard className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('zen')}
              className={`p-2 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-colors text-white/70 hover:text-white`}
              title="Zen Mode"
            >
              <Maximize2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md p-1 pl-3 pr-1 rounded-full border border-white/10 hover:bg-[#282828] cursor-pointer group relative">
              <span className="text-sm font-bold text-white">{currentUser.name}</span>
              {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-8 h-8 rounded-full" /> : <UserIcon className="w-4 h-4" />}
              <div className="absolute top-full right-0 mt-2 w-40 bg-[#282828] rounded-md shadow-xl py-1 hidden group-hover:block border border-white/5">
                <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-[#3e3e3e] text-white flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </div>
          </div>

          {showLyrics && engine.currentSong ? (
            <LyricsView song={engine.currentSong} lyrics={lyricsText} />
          ) : (
            <>
              {currentView === 'home' && renderHome()}
              {currentView === 'search' && (
                <div className="flex-1 bg-gradient-to-b from-[#1e1e1e] to-[#121212] overflow-auto pb-40 p-4 md:p-8">
                  <div className="sticky top-0 bg-gradient-to-b from-[#1e1e1e] to-transparent z-20 pb-6">
                    <form onSubmit={handleSearch} className="relative max-w-2xl w-full">
                      <SearchIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                      {isSearching && <Loader2 className="absolute right-4 top-3.5 w-5 h-5 text-green-500 animate-spin" />}
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for songs, artists, or albums..."
                        className="w-full bg-white text-black rounded-full py-3 pl-12 pr-12 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      />
                    </form>
                  </div>

                  {isSearching ? (
                    <SongListSkeleton count={8} />
                  ) : searchResults.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {searchResults.map((song) => (
                        <div
                          key={song.id}
                          onClick={() => handlePlaySong(song, searchResults)}
                          onContextMenu={(e) => handleContextMenu(e, 'song', song)}
                          className="bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer group animate-fade-in"
                        >
                          <div className="relative mb-3">
                            <img src={song.coverUrl} className="w-full aspect-square object-cover rounded-md shadow-lg" alt="" loading="lazy" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" style={{ backgroundColor: accentColor }}>
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
                              </div>
                            </div>
                          </div>
                          <h3 className="font-bold truncate mb-1 text-white">{song.title}</h3>
                          <p className="text-sm text-[#b3b3b3] truncate">{song.artist}</p>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Music className="w-16 h-16 text-gray-600 mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">No results found</h3>
                      <p className="text-gray-500">Try searching for something else</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <SearchIcon className="w-16 h-16 text-gray-600 mb-4" />
                      <h3 className="text-xl font-bold text-gray-400 mb-2">Search for music</h3>
                      <p className="text-gray-500">Find your favorite songs, artists, and albums</p>
                    </div>
                  )}
                </div>
              )}
              {currentView === 'playlist' && selectedPlaylist && (
                <PlaylistView
                  playlist={selectedPlaylist}
                  onPlaySong={(s) => handlePlaySong(s, selectedPlaylist.songs)}
                  onEditCover={(p) => { setSelectedPlaylist(p); setCurrentView('ai-editor'); }}
                />
              )}
              {currentView === 'library' && (
                <LibraryView
                  playlists={playlists}
                  likedSongs={likedSongs}
                  onPlayPlaylist={(p) => handlePlaySong(p.songs[0], p.songs)}
                  onPlaySong={(s) => handlePlaySong(s)}
                  onSelectPlaylist={(p) => { setSelectedPlaylist(p); setCurrentView('playlist'); }}
                  onCreatePlaylist={() => setShowCreatePlaylist(true)}
                  accentColor={accentColor}
                />
              )}
              {currentView === 'stats' && <StatsView likedSongs={likedSongs} />}
              {currentView === 'settings' && (
                <SettingsView user={currentUser} onUpdateUser={setCurrentUser} />
              )}
              {currentView === 'ai-editor' && (
                <AIImageEditor initialImage={selectedPlaylist?.coverUrl} targetPlaylist={selectedPlaylist} onBack={() => setCurrentView('playlist')} onSave={() => setCurrentView('playlist')} />
              )}
            </>
          )}
        </div>
      )}

      <div className="md:hidden fixed bottom-1 mb-[95px] w-full bg-[#121212] flex justify-around items-center h-[50px] z-50">
        {['home', 'search', 'library', 'settings'].map((view) => (
          <div key={view} onClick={() => setCurrentView(view as ViewState)} className={`flex flex-col items-center gap-1 ${currentView === view ? 'text-white' : 'text-[#b3b3b3]'}`} style={{ color: currentView === view ? accentColor : undefined }}>
            {view === 'home' && <Home className="w-5 h-5" />}
            {view === 'search' && <SearchIcon className="w-5 h-5" />}
            {view === 'library' && <Library className="w-5 h-5" />}
            {view === 'settings' && <Settings className="w-5 h-5" />}
          </div>
        ))}
      </div>

      <Player
        currentSong={engine.currentSong}
        isPlaying={engine.isPlaying}
        volume={engine.volume}
        accentColor={accentColor}
        onPlayPause={engine.togglePlay}
        onNext={engine.next}
        onPrev={engine.previous}
        onVolumeChange={engine.setVolume}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
        onDownload={() => addToast("Added to offline", 'success')}
        onLike={handleToggleLike}
        isLiked={engine.currentSong ? likedSongs.some(s => s.id === engine.currentSong!.id) : false}
        showLyrics={showLyrics}
        queue={engine.queue}
        onSeek={engine.seek}
        repeatMode={engine.repeatMode}  // engine mode string 'normal'|'repeat-all' etc
        onToggleRepeat={() => {
          // Toggle logic: normal -> repeat-all -> repeat-one -> normal
          const modes = ['normal', 'repeat-all', 'repeat-one'];
          const nextIdx = (modes.indexOf(engine.repeatMode === 'shuffle' ? 'normal' : engine.repeatMode) + 1) % modes.length;
          engine.setMode(modes[nextIdx] as any);
        }}
        shuffle={isShuffle}
        onToggleShuffle={() => engine.setMode(isShuffle ? 'normal' : 'shuffle')}
      />
    </div>
  );
};


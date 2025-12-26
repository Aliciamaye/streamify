import { Song } from '../types';
import { SourceRouter } from './sources/SourceRouter';
import { EmbeddedSource } from './sources/EmbeddedSource';

type PlaybackMode = 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle';

export interface EQPreset {
  name: string;
  bass: number;
  mid: number;
  treble: number;
}

export const EQ_PRESETS: Record<string, EQPreset> = {
  flat: { name: 'Flat', bass: 0, mid: 0, treble: 0 },
  rock: { name: 'Rock', bass: 5, mid: -2, treble: 4 },
  pop: { name: 'Pop', bass: 3, mid: 2, treble: 3 },
  jazz: { name: 'Jazz', bass: 2, mid: 3, treble: 2 },
  classical: { name: 'Classical', bass: -2, mid: 2, treble: 4 },
  electronic: { name: 'Electronic', bass: 6, mid: -1, treble: 5 },
  bassBoost: { name: 'Bass Boost', bass: 8, mid: 0, treble: 2 },
  vocalBoost: { name: 'Vocal Boost', bass: -2, mid: 6, treble: 3 },
};

class MusicEngine {
  private static instance: MusicEngine;
  private audio: HTMLAudioElement;
  private sourceRouter: SourceRouter;
  private fallbackSource: EmbeddedSource;

  private playlist: Song[] = [];
  private originalPlaylist: Song[] = [];
  private currentIndex: number = -1;
  private mode: PlaybackMode = 'normal';
  private listeners: Set<() => void> = new Set();

  // EQ Presets
  private currentEQPreset: string = 'flat';

  // Sleep Timer
  private sleepTimer: NodeJS.Timeout | null = null;
  private sleepTimerEnd: number = 0;

  // Crossfade
  private crossfadeDuration: number = 3; // seconds
  private nextAudio: HTMLAudioElement | null = null;
  private nextGainNode: GainNode | null = null;
  private nextSourceNode: MediaElementAudioSourceNode | null = null;

  // Gapless Playback
  private gaplessEnabled: boolean = true;
  private isPreloading: boolean = false;

  // Radio Mode
  private radioMode: boolean = false;

  // Public debug accessor
  get contextState(): AudioContextState {
    return this.audioCtx.state;
  }

  // Web Audio API
  private audioCtx: AudioContext;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode;
  private analyser: AnalyserNode;
  private bassFilter: BiquadFilterNode;
  private midFilter: BiquadFilterNode;
  private trebleFilter: BiquadFilterNode;

  private isInitialized = false;

  private constructor() {
    this.sourceRouter = SourceRouter.getInstance();
    this.fallbackSource = EmbeddedSource.getInstance();

    // 1. Setup Audio Element
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    // Important: Preload metadata to avoid loading delays
    this.audio.preload = "metadata";

    // 2. Setup Audio Context (Suspended initially)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();

    // 3. Create Nodes
    this.gainNode = this.audioCtx.createGain();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 256; // 128 bins

    this.bassFilter = this.audioCtx.createBiquadFilter();
    this.bassFilter.type = 'lowshelf';
    this.bassFilter.frequency.value = 200;

    this.midFilter = this.audioCtx.createBiquadFilter();
    this.midFilter.type = 'peaking';
    this.midFilter.frequency.value = 1000;
    this.midFilter.Q.value = 1;

    this.trebleFilter = this.audioCtx.createBiquadFilter();
    this.trebleFilter.type = 'highshelf';
    this.trebleFilter.frequency.value = 3000;

    // 4. Connect Chain (Lazy connection of sourceNode done in initAudioGraph)
    // Chain: Bass -> Mid -> Treble -> Gain -> Analyser -> Destination
    this.bassFilter.connect(this.midFilter);
    this.midFilter.connect(this.trebleFilter);
    this.trebleFilter.connect(this.gainNode);
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // 5. Restore Volume
    const savedVolume = localStorage.getItem('streamify_volume');
    if (savedVolume) {
      this.gainNode.gain.value = parseFloat(savedVolume);
    } else {
      this.gainNode.gain.value = 0.8;
    }
    this.audio.volume = 1; // Always 1, controlled by gainNode

    // 6. Restore Settings
    const savedEQPreset = localStorage.getItem('streamify_eq_preset');
    if (savedEQPreset && EQ_PRESETS[savedEQPreset]) {
      this.currentEQPreset = savedEQPreset;
      const preset = EQ_PRESETS[savedEQPreset];
      this.bassFilter.gain.value = preset.bass;
      this.midFilter.gain.value = preset.mid;
      this.trebleFilter.gain.value = preset.treble;
    }

    const savedCrossfade = localStorage.getItem('streamify_crossfade');
    if (savedCrossfade) {
      this.crossfadeDuration = parseFloat(savedCrossfade);
    }

    const savedGapless = localStorage.getItem('streamify_gapless');
    if (savedGapless !== null) {
      this.gaplessEnabled = savedGapless === 'true';
    }

    // 7. Bind Events
    this.audio.addEventListener('ended', () => this.next());
    this.audio.addEventListener('play', this.notifyListeners);
    this.audio.addEventListener('pause', this.notifyListeners);
    this.audio.addEventListener('timeupdate', () => {
      this.notifyListeners();
      // Preload next track for gapless playback at 80% progress
      if (this.gaplessEnabled && !this.isPreloading && this.duration > 0) {
        const progress = this.currentTime / this.duration;
        if (progress >= 0.8 && this.currentIndex < this.playlist.length - 1) {
          this.preloadNextTrack();
        }
      }
    });
    this.audio.addEventListener('error', (e) => {
      const error = this.audio.error;
      console.error("Audio Playback Error:", error?.code, error?.message);
      console.warn("Problematic src:", this.audio.src);

      // Retry logic removed to prevent infinite loops
      // We'll let the user decide to skip or retry
    });
  }

  static getInstance(): MusicEngine {
    if (!MusicEngine.instance) {
      MusicEngine.instance = new MusicEngine();
    }
    return MusicEngine.instance;
  }

  // --- Initialization ---
  // Must be called on user interaction!
  async initAudioGraph() {
    if (this.isInitialized) return;

    try {
      await this.audioCtx.resume();

      if (!this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
        this.sourceNode.connect(this.bassFilter);
      }
      this.isInitialized = true;
    } catch (e) {
      console.error("Failed to init Audio Graph", e);
    }
  }

  // --- API ---

  // State
  // Getters for state
  get currentSong(): Song | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.playlist.length) {
      return this.playlist[this.currentIndex];
    }
    return null;
  }

  get isPlaying(): boolean { return !this.audio.paused; }
  get currentTime(): number { return this.audio.currentTime; }
  get duration(): number { return this.audio.duration || 0; }
  get volume(): number { return this.gainNode.gain.value; }
  get playbackMode(): PlaybackMode { return this.mode; }
  get queue(): Song[] { return [...this.playlist]; }
  get repeatMode(): PlaybackMode { return this.mode; } // Alias for UI

  // Controls
  async play(song?: Song) {
    // Critical: Resume context first (browser policy)
    await this.initAudioGraph();

    if (song) {
      // New song requested
      const index = this.playlist.findIndex(s => s.id === song.id);
      if (index !== -1) {
        this.currentIndex = index;
      } else {
        // Add next and play
        this.playlist.splice(this.currentIndex + 1, 0, song);
        this.currentIndex++;
        if (this.mode !== 'shuffle') this.originalPlaylist = [...this.playlist];
      }
      await this.loadAndPlay(song);
    } else {
      // Resume current
      if (this.audio.src) {
        this.audio.play().catch(e => console.error("Resume failed:", e));
      } else if (this.currentSong) {
        await this.loadAndPlay(this.currentSong);
      }
    }
  }

  pause() {
    this.audio.pause();
  }

  togglePlay() {
    if (this.isPlaying) this.pause();
    else this.play();
  }

  next() {
    if (this.playlist.length === 0) return;

    if (this.mode === 'repeat-one') {
      this.audio.currentTime = 0;
      this.audio.play();
      return;
    }

    // Check boundary
    if (this.currentIndex < this.playlist.length - 1) {
      this.currentIndex++;
      this.loadAndPlay(this.playlist[this.currentIndex]);
    } else if (this.mode === 'repeat-all') {
      this.currentIndex = 0;
      this.loadAndPlay(this.playlist[0]);
    } else {
      // End of queue
      this.pause();
      this.audio.currentTime = 0;
    }
  }

  previous() {
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.loadAndPlay(this.playlist[this.currentIndex]);
    } else {
      this.currentIndex = 0;
      this.audio.currentTime = 0;
    }
  }

  seek(time: number) {
    if (isFinite(time)) this.audio.currentTime = time;
  }

  setVolume(vol: number) {
    const v = Math.max(0, Math.min(1, vol));
    this.gainNode.gain.value = v;
    localStorage.setItem('streamify_volume', v.toString());
    this.notifyListeners();
  }

  setEQ(band: 'bass' | 'mid' | 'treble', value: number) {
    // Value -10 to 10
    if (band === 'bass') this.bassFilter.gain.value = value;
    if (band === 'mid') this.midFilter.gain.value = value;
    if (band === 'treble') this.trebleFilter.gain.value = value;
  }

  // --- EQ Presets ---
  getEQPresets(): Record<string, EQPreset> {
    return EQ_PRESETS;
  }

  getCurrentEQPreset(): string {
    return this.currentEQPreset;
  }

  applyEQPreset(presetName: string) {
    const preset = EQ_PRESETS[presetName];
    if (!preset) {
      console.warn(`Unknown EQ preset: ${presetName}`);
      return;
    }
    this.setEQ('bass', preset.bass);
    this.setEQ('mid', preset.mid);
    this.setEQ('treble', preset.treble);
    this.currentEQPreset = presetName;
    localStorage.setItem('streamify_eq_preset', presetName);
    this.notifyListeners();
  }

  // --- Sleep Timer ---
  setSleepTimer(minutes: number) {
    this.clearSleepTimer();
    const ms = minutes * 60 * 1000;
    this.sleepTimerEnd = Date.now() + ms;

    this.sleepTimer = setTimeout(() => {
      // Fade out over 5 seconds
      const fadeSteps = 50;
      const fadeInterval = 5000 / fadeSteps;
      const volumeStep = this.gainNode.gain.value / fadeSteps;
      let step = 0;

      const fadeOut = setInterval(() => {
        step++;
        const newVolume = Math.max(0, this.gainNode.gain.value - volumeStep);
        this.gainNode.gain.value = newVolume;

        if (step >= fadeSteps) {
          clearInterval(fadeOut);
          this.pause();
          // Restore volume
          const savedVolume = localStorage.getItem('streamify_volume');
          this.gainNode.gain.value = savedVolume ? parseFloat(savedVolume) : 0.8;
          this.sleepTimer = null;
          this.sleepTimerEnd = 0;
          this.notifyListeners();
        }
      }, fadeInterval);
    }, ms);

    this.notifyListeners();
  }

  clearSleepTimer() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
      this.sleepTimerEnd = 0;
      this.notifyListeners();
    }
  }

  getSleepTimerRemaining(): number {
    if (!this.sleepTimer) return 0;
    return Math.max(0, this.sleepTimerEnd - Date.now());
  }

  // --- Crossfade ---
  setCrossfadeDuration(seconds: number) {
    this.crossfadeDuration = Math.max(0, Math.min(10, seconds));
    localStorage.setItem('streamify_crossfade', seconds.toString());
  }

  getCrossfadeDuration(): number {
    return this.crossfadeDuration;
  }

  // --- Gapless Playback ---
  setGaplessEnabled(enabled: boolean) {
    this.gaplessEnabled = enabled;
    localStorage.setItem('streamify_gapless', enabled.toString());
  }

  getGaplessEnabled(): boolean {
    return this.gaplessEnabled;
  }

  // --- Radio Mode ---
  setRadioMode(enabled: boolean) {
    this.radioMode = enabled;
    this.notifyListeners();
  }

  getRadioMode(): boolean {
    return this.radioMode;
  }

  // --- Queue Management ---
  removeFromQueue(index: number) {
    if (index < 0 || index >= this.playlist.length) return;

    this.playlist.splice(index, 1);
    if (this.mode !== 'shuffle') {
      this.originalPlaylist.splice(index, 1);
    }

    // Adjust current index if needed
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex && this.currentIndex >= this.playlist.length) {
      this.currentIndex = this.playlist.length - 1;
    }

    this.notifyListeners();
  }

  reorderQueue(fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= this.playlist.length) return;
    if (toIndex < 0 || toIndex >= this.playlist.length) return;

    const [song] = this.playlist.splice(fromIndex, 1);
    this.playlist.splice(toIndex, 0, song);

    // Update current index
    if (this.currentIndex === fromIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }

    if (this.mode !== 'shuffle') {
      this.originalPlaylist = [...this.playlist];
    }

    this.notifyListeners();
  }

  clearQueue() {
    this.playlist = [];
    this.originalPlaylist = [];
    this.currentIndex = -1;
    this.pause();
    this.audio.src = '';
    this.notifyListeners();
  }

  getAudioData(array: Uint8Array) {
    if (this.isInitialized) {
      this.analyser.getByteFrequencyData(array);
    }
  }

  // Queue Management
  setQueue(songs: Song[], startIndex = 0) {
    this.playlist = [...songs];
    this.originalPlaylist = [...songs];
    this.currentIndex = startIndex;
    if (this.mode === 'shuffle') {
      this.shuffleQueue(true);
    }
    this.loadAndPlay(this.playlist[this.currentIndex]);
  }

  addToQueue(song: Song) {
    this.playlist.push(song);
    if (this.mode !== 'shuffle') this.originalPlaylist.push(song);
    this.notifyListeners();
  }

  setMode(mode: PlaybackMode) {
    if (this.mode === mode) return;
    const oldMode = this.mode;
    this.mode = mode;

    if (mode === 'shuffle') {
      this.shuffleQueue();
    } else if (oldMode === 'shuffle') {
      // Restore order logic could be more complex, but simplified here:
      const current = this.currentSong;
      this.playlist = [...this.originalPlaylist];
      if (current) {
        const idx = this.playlist.findIndex(s => s.id === current.id);
        if (idx !== -1) this.currentIndex = idx;
      }
    }
    this.notifyListeners();
  }

  // Integrations (search, recommendations, charts)
  async search(query: string, limit: number = 20): Promise<Song[]> {
    try {
      return await this.sourceRouter.search(query, limit);
    } catch (error) {
      console.error('[MusicEngine] Search failed:', error);
      // Fallback to source if sourceRouter fails
      return this.source.search(query, limit);
    }
  }

  async getRecommendations(songId?: string): Promise<Song[]> {
    try {
      // Use backend for recommendations
      const response = await fetch(`http://localhost:3001/api/recommendations${songId ? `?videoId=${songId}` : ''}`);
      const data = await response.json();
      return data.songs || [];
    } catch (error) {
      console.error('[MusicEngine] Recommendations failed:', error);
      return [];
    }
  }

  async getCharts(): Promise<Song[]> {
    return this.sourceRouter.getCharts();
  }

  subscribe(cb: () => void) { this.listeners.add(cb); return () => this.listeners.delete(cb); }

  // Internal
  private notifyListeners = () => { this.listeners.forEach(cb => cb()); };

  private async loadAndPlay(song: Song) {
    if (!song) return;

    this.notifyListeners();

    // Only retry once to avoid spamming yt-dlp
    let retries = 1;
    let delay = 2000;

    while (retries > 0) {
      try {
        console.log(`[MusicEngine] Loading: ${song.title}`);

        // Use SourceRouter for intelligent source selection
        let url = await this.sourceRouter.getStreamUrl(song);

        if (!url) throw new Error("No URL resolved from any source");

        this.audio.src = url;
        await this.audio.play();

        // Success! Preload next track
        this.preloadNextTrack();
        return;

      } catch (e: any) {
        // Ignore AbortError (happens when skipping rapidly)
        if (e.name === 'AbortError') {
          console.log("Playback interrupted by new request");
          return;
        }

        retries--;
        if (retries > 0) {
          console.warn(`Load failed, retrying in ${delay}ms...`, e);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // Exponential backoff
        } else {
          console.error("Load failed after retry", e);
          // Don't auto-skip to prevent infinite loops
          this.notifyListeners();
        }
      }
    }
  }

  private preloadNextTrack() {
    if (!this.gaplessEnabled || this.currentIndex >= this.playlist.length - 1) return;

    const nextSong = this.playlist[this.currentIndex + 1];
    if (!nextSong || this.isPreloading) return;

    this.isPreloading = true;
    console.log(`[Gapless] Preloading next: ${nextSong.title}`);

    // Preload in background
    this.source.getStreamUrl(nextSong.id).then(url => {
      if (url) {
        // Create a hidden audio element to preload
        const preloadAudio = new Audio();
        preloadAudio.src = url;
        preloadAudio.load();
        console.log(`[Gapless] Preloaded: ${nextSong.title}`);
      }
      this.isPreloading = false;
    }).catch(err => {
      console.warn('[Gapless] Preload failed:', err);
      this.isPreloading = false;
    });
  }

  private shuffleQueue(keepCurrent = false) {
    if (this.playlist.length <= 1) return;

    let pool = [...this.playlist];
    let current: Song | null = null;

    if (keepCurrent && this.currentIndex >= 0) {
      current = this.playlist[this.currentIndex];
      pool.splice(this.currentIndex, 1);
    }

    // Smart Shuffle: Fisher-Yates + Artist Spread
    // 1. Basic Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // 2. Artist Spread (Simple heuristic: if neighbor has same artist, swap with random)
    for (let i = 0; i < pool.length - 1; i++) {
      if (pool[i].artist === pool[i + 1].artist) {
        // Swap i+1 with a random further element
        const swapIdx = i + 1 + Math.floor(Math.random() * (pool.length - (i + 1)));
        [pool[i + 1], pool[swapIdx]] = [pool[swapIdx], pool[i + 1]];
      }
    }

    if (current) {
      this.playlist = [current, ...pool];
      this.currentIndex = 0;
    } else {
      this.playlist = pool;
      this.currentIndex = -1;
    }
  }

  // --- Preloading for Gapless ---
  private async preloadNextTrack() {
    if (this.isPreloading) return;
    this.isPreloading = true;

    const nextSong = this.playlist[this.currentIndex + 1];
    if (!nextSong) {
      this.isPreloading = false;
      return;
    }

    try {
      console.log(`[MusicEngine] Preloading next track: ${nextSong.title}`);
      let url = await this.source.getStreamUrl(nextSong.id);

      if (!url) {
        url = await this.fallbackSource.getStreamUrl(nextSong.id);
      }

      if (url) {
        // Create next audio element
        this.nextAudio = new Audio();
        this.nextAudio.crossOrigin = "anonymous";
        this.nextAudio.preload = "auto";
        this.nextAudio.src = url;

        // Preload the audio
        await this.nextAudio.load();
        console.log(`[MusicEngine] Preloaded: ${nextSong.title}`);
      }
    } catch (e) {
      console.error('[MusicEngine] Preload failed:', e);
    } finally {
      this.isPreloading = false;
    }
  }

  getWaveformData(array: Uint8Array) {
    if (this.isInitialized) {
      this.analyser.getByteTimeDomainData(array);
    }
  }
}

export const musicEngine = MusicEngine.getInstance();

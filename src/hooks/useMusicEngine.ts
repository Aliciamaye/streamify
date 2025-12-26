import { useState, useEffect } from 'react';
import { musicEngine } from '../services/MusicEngine';
import { Song } from '../types';

export const useMusicEngine = () => {
    const [currentSong, setCurrentSong] = useState<Song | null>(musicEngine.currentSong);
    const [isPlaying, setIsPlaying] = useState(musicEngine.isPlaying);
    const [volume, setVolumeState] = useState(musicEngine.volume);
    const [queue, setQueue] = useState<Song[]>(musicEngine.queue);
    const [repeatMode, setRepeatMode] = useState(musicEngine.playbackMode);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // New features
    const [eqPreset, setEqPreset] = useState(musicEngine.getCurrentEQPreset());
    const [sleepTimerRemaining, setSleepTimerRemaining] = useState(0);
    const [radioMode, setRadioModeState] = useState(musicEngine.getRadioMode());
    const [gaplessEnabled, setGaplessEnabledState] = useState(musicEngine.getGaplessEnabled());
    const [crossfadeDuration, setCrossfadeDurationState] = useState(musicEngine.getCrossfadeDuration());

    useEffect(() => {
        const updateState = () => {
            setCurrentSong(musicEngine.currentSong);
            setIsPlaying(musicEngine.isPlaying);
            setVolumeState(musicEngine.volume);
            setQueue(musicEngine.queue);
            setRepeatMode(musicEngine.playbackMode);
            setCurrentTime(musicEngine.currentTime);
            setDuration(musicEngine.duration);
            setEqPreset(musicEngine.getCurrentEQPreset());
            setSleepTimerRemaining(musicEngine.getSleepTimerRemaining());
            setRadioModeState(musicEngine.getRadioMode());
            setGaplessEnabledState(musicEngine.getGaplessEnabled());
            setCrossfadeDurationState(musicEngine.getCrossfadeDuration());
        };

        // Initial sync
        updateState();

        // Subscribe to engine
        const unsubscribe = musicEngine.subscribe(updateState);

        // Polling for smooth progress and sleep timer
        const interval = setInterval(() => {
            if (musicEngine.isPlaying) {
                setCurrentTime(musicEngine.currentTime);
            }
            setSleepTimerRemaining(musicEngine.getSleepTimerRemaining());
        }, 1000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return {
        // Playback state
        currentSong,
        isPlaying,
        volume,
        queue,
        repeatMode,
        currentTime,
        duration,

        // New features state
        eqPreset,
        sleepTimerRemaining,
        radioMode,
        gaplessEnabled,
        crossfadeDuration,

        // Playback controls
        play: (song?: Song) => musicEngine.play(song),
        pause: () => musicEngine.pause(),
        togglePlay: () => musicEngine.togglePlay(),
        next: () => musicEngine.next(),
        previous: () => musicEngine.previous(),
        seek: (time: number) => musicEngine.seek(time),

        // Volume
        setVolume: (vol: number) => musicEngine.setVolume(vol),

        // Queue management
        setQueue: (songs: Song[], startIdx?: number) => musicEngine.setQueue(songs, startIdx),
        addToQueue: (song: Song) => musicEngine.addToQueue(song),
        removeFromQueue: (index: number) => musicEngine.removeFromQueue(index),
        reorderQueue: (fromIndex: number, toIndex: number) => musicEngine.reorderQueue(fromIndex, toIndex),
        clearQueue: () => musicEngine.clearQueue(),

        // Playback modes
        setMode: (mode: 'normal' | 'repeat-all' | 'repeat-one' | 'shuffle') => musicEngine.setMode(mode),

        // EQ
        applyEQPreset: (preset: string) => {
            musicEngine.applyEQPreset(preset);
            setEqPreset(preset);
        },
        getEQPresets: () => musicEngine.getEQPresets(),
        setEQ: (band: 'bass' | 'mid' | 'treble', value: number) => musicEngine.setEQ(band, value),

        // Sleep Timer
        setSleepTimer: (minutes: number) => musicEngine.setSleepTimer(minutes),
        clearSleepTimer: () => musicEngine.clearSleepTimer(),

        // Radio Mode
        setRadioMode: (enabled: boolean) => {
            musicEngine.setRadioMode(enabled);
            setRadioModeState(enabled);
        },

        // Gapless
        setGaplessEnabled: (enabled: boolean) => {
            musicEngine.setGaplessEnabled(enabled);
            setGaplessEnabledState(enabled);
        },

        // Crossfade
        setCrossfadeDuration: (seconds: number) => {
            musicEngine.setCrossfadeDuration(seconds);
            setCrossfadeDurationState(seconds);
        },

        // Search & Recommendations
        search: (query: string) => musicEngine.search(query),
        getRecommendations: (songId?: string) => musicEngine.getRecommendations(songId),
        getCharts: () => musicEngine.getCharts(),

        // Audio data for visualizer
        getAudioData: (array: Uint8Array) => musicEngine.getAudioData(array),
        getWaveformData: (array: Uint8Array) => musicEngine.getWaveformData(array),
    };
};

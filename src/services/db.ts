// This file is deprecated - using Supabase instead
// Keeping for backward compatibility with DownloadManager

import { Song, Playlist } from "../types";

const DB_NAME = "StreamifyDB";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export const initDB = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        dbInstance = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store Audio Blobs for offline playback
        if (!db.objectStoreNames.contains("audio_cache")) {
          db.createObjectStore("audio_cache", { keyPath: "id" });
        }
      };
    } catch (error) {
      // IndexedDB not available (incognito mode, etc.)
      console.warn('IndexedDB not available:', error);
      reject(error);
    }
  });
};

export const saveAudioToCache = async (id: string, blob: Blob): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio_cache", "readwrite");
      const store = tx.objectStore("audio_cache");
      const request = store.put({ id, blob, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
};

export const getAudioFromCache = async (id: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio_cache", "readonly");
      const store = tx.objectStore("audio_cache");
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to get from cache:', error);
    return null;
  }
};

export const isSongDownloaded = async (id: string): Promise<boolean> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction("audio_cache", "readonly");
      const store = tx.objectStore("audio_cache");
      const request = store.count(id);

      request.onsuccess = () => resolve(request.result > 0);
      request.onerror = () => resolve(false);
    });
  } catch (error) {
    return false;
  }
};

export const clearCache = async (): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("audio_cache", "readwrite");
      const store = tx.objectStore("audio_cache");
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

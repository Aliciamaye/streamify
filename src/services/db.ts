import { Song, Playlist } from "../types";

const DB_NAME = "StreamifyDB";
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Store Audio Blobs
      if (!db.objectStoreNames.contains("audio_cache")) {
        db.createObjectStore("audio_cache", { keyPath: "id" });
      }
      
      // Store User Data (Liked songs, custom playlists)
      if (!db.objectStoreNames.contains("playlists")) {
        db.createObjectStore("playlists", { keyPath: "id" });
      }
      
      // Store Liked Songs IDs
      if (!db.objectStoreNames.contains("favorites")) {
        db.createObjectStore("favorites", { keyPath: "id" });
      }
    };
  });
};

export const saveAudioToCache = async (id: string, blob: Blob): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("audio_cache", "readwrite");
    const store = tx.objectStore("audio_cache");
    const request = store.put({ id, blob, timestamp: Date.now() });
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getAudioFromCache = async (id: string): Promise<Blob | null> => {
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
};

export const isSongDownloaded = async (id: string): Promise<boolean> => {
  const db = await initDB();
  return new Promise((resolve) => {
    const tx = db.transaction("audio_cache", "readonly");
    const store = tx.objectStore("audio_cache");
    const request = store.count(id);
    
    request.onsuccess = () => resolve(request.result > 0);
    request.onerror = () => resolve(false);
  });
};

export const clearCache = async (): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("audio_cache", "readwrite");
    const store = tx.objectStore("audio_cache");
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

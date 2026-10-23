// Dastarkhwan Image Caching & Offline Storage Engine
// Uses modern browser Cache Storage API and IndexedDB for persistent offline availability

const DB_NAME = "DastarkhwanImageCache";
const STORE_NAME = "images";
const DB_VERSION = 1;
const CACHE_NAME = "dastarkhwan-media-cache-v1";

// Memory cache for synchronous instant rendering within the same session
const memoryCache = new Map<string, string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported"));
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveImageToIndexedDb(key: string, dataUrl: string): Promise<void> {
  if (!key || !dataUrl) return;
  memoryCache.set(key, dataUrl);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({
        key,
        data: dataUrl,
        timestamp: Date.now(),
        size: dataUrl.length,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("Failed to cache image in IndexedDB:", err);
  }
}

export async function getImageFromIndexedDb(key: string): Promise<string | null> {
  if (!key) return null;
  if (memoryCache.has(key)) return memoryCache.get(key)!;
  try {
    const db = await openDb();
    return await new Promise<string | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        const result = req.result?.data || null;
        if (result) memoryCache.set(key, result);
        resolve(result);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Convert blob to DataURL helper
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Fetch and cache external image URL (e.g. unsplash or /media/ files)
export async function cacheExternalImage(url: string): Promise<string> {
  if (!url) return "";
  if (url.startsWith("data:")) {
    await saveImageToIndexedDb(url.slice(0, 50), url);
    return url;
  }

  // Check memory cache first
  if (memoryCache.has(url)) return memoryCache.get(url)!;

  // Check IndexedDB
  const stored = await getImageFromIndexedDb(url);
  if (stored) return stored;

  // Try Cache Storage API
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      const cache = await window.caches.open(CACHE_NAME);
      const matched = await cache.match(url);
      if (matched) {
        const blob = await matched.blob();
        const dataUrl = await blobToDataUrl(blob);
        await saveImageToIndexedDb(url, dataUrl);
        return dataUrl;
      }
    } catch {
      // Ignore cache match error
    }
  }

  // Fetch online and store in both Cache API and IndexedDB
  try {
    const res = await fetch(url, { mode: "cors", credentials: "omit" });
    if (res.ok) {
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      await saveImageToIndexedDb(url, dataUrl);

      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cache = await window.caches.open(CACHE_NAME);
          cache.put(url, new Response(blob));
        } catch {}
      }
      return dataUrl;
    }
  } catch (err) {
    // Offline or network error: return original URL as fallback
  }

  return url;
}

// Preload and cache a list of image URLs in the background
export async function preloadMenuImages(urls: string[]): Promise<number> {
  if (!urls || !urls.length) return 0;
  let cachedCount = 0;
  const uniqueUrls = [...new Set(urls.filter(Boolean))];

  for (const url of uniqueUrls) {
    try {
      await cacheExternalImage(url);
      cachedCount++;
    } catch {
      // Continue next
    }
  }
  return cachedCount;
}

export async function getImageCacheStats(): Promise<{ count: number; sizeBytes: number }> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const items = req.result || [];
        const sizeBytes = items.reduce((acc: number, it: any) => acc + (it.size || 0), 0);
        resolve({ count: items.length, sizeBytes });
      };
      req.onerror = () => resolve({ count: 0, sizeBytes: 0 });
    });
  } catch {
    return { count: 0, sizeBytes: 0 };
  }
}

export async function clearImageCache(): Promise<void> {
  memoryCache.clear();
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
  } catch {}
  if (typeof window !== "undefined" && "caches" in window) {
    try {
      await window.caches.delete(CACHE_NAME);
    } catch {}
  }
}

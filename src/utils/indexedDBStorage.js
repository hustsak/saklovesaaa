// Native IndexedDB Persistence Engine for SakSa Love Archive
// Provides virtually unlimited, quota-free local storage for images and data of ANY size

const DB_NAME = 'SakSaLoveArchiveDB';
const DB_VERSION = 2;

const STORES = {
  KEYVAL: 'keyval_store',
  PHOTOS: 'photos_store'
};

let dbPromise = null;

const getDB = () => {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORES.KEYVAL)) {
          db.createObjectStore(STORES.KEYVAL, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
          db.createObjectStore(STORES.PHOTOS, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.warn('IndexedDB open error:', event.target.error);
        resolve(null);
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked');
        resolve(null);
      };
    } catch (e) {
      console.warn('IndexedDB initialization failed:', e);
      resolve(null);
    }
  });

  return dbPromise;
};

// Generic Key-Value Set (supports full arrays/objects of any size)
export const idbSet = async (key, val) => {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction([STORES.KEYVAL], 'readwrite');
      const store = tx.objectStore(STORES.KEYVAL);
      const req = store.put({ key, value: val, updatedAt: Date.now() });

      req.onsuccess = () => resolve(true);
      req.onerror = (err) => {
        console.warn(`IndexedDB set error for [${key}]:`, err);
        resolve(false);
      };
    });
  } catch (e) {
    console.warn(`IndexedDB write exception for [${key}]:`, e);
    return false;
  }
};

// Generic Key-Value Get
export const idbGet = async (key) => {
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction([STORES.KEYVAL], 'readonly');
      const store = tx.objectStore(STORES.KEYVAL);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ? req.result.value : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    console.warn(`IndexedDB read exception for [${key}]:`, e);
    return null;
  }
};

// Dedicated Image Store for High-Resolution Blobs or DataURLs of any size
export const idbStorePhoto = async (id, dataUrlOrBlob, metadata = {}) => {
  try {
    const db = await getDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction([STORES.PHOTOS], 'readwrite');
      const store = tx.objectStore(STORES.PHOTOS);
      const req = store.put({
        id,
        data: dataUrlOrBlob,
        timestamp: Date.now(),
        ...metadata
      });

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    console.warn('Failed to store high-res photo in IndexedDB:', e);
    return false;
  }
};

export const idbGetPhoto = async (id) => {
  try {
    const db = await getDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction([STORES.PHOTOS], 'readonly');
      const store = tx.objectStore(STORES.PHOTOS);
      const req = store.get(id);

      req.onsuccess = () => {
        resolve(req.result ? req.result.data : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

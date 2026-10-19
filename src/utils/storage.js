// Local Storage & Archive Persistence Engine with Firebase Cloud Sync
// Project: love-c9700 (Viraksak Koy & Chanreaksa Sok)

import { initialMemories, initialLoveLetters, initialFuturePlans } from './defaultMemories';
import { saveMemoryToFirestore, deleteMemoryFromFirestore } from './firebase';
import { idbSet, idbGet } from './indexedDBStorage';

const STORAGE_KEYS = {
  MEMORIES: 'love_archive_memories_v1',
  LETTERS: 'love_archive_letters_v3',
  FUTURE: 'love_archive_future_v1',
  AUTH: 'love_archive_auth_session',
  SETTINGS: 'love_archive_settings_v1',
  TEXTS: 'love_archive_custom_texts_v1',
  IMAGES: 'love_archive_custom_images_v1'
};

// Immediate cache read (localStorage)
export const getStoredMemories = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Could not read memories from storage:', e);
  }
  return initialMemories;
};

// Asynchronous deep read from IndexedDB (supports unlimited photo size and quantity)
export const getStoredMemoriesAsync = async () => {
  try {
    const idbData = await idbGet(STORAGE_KEYS.MEMORIES);
    if (idbData && Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }
  } catch (e) {
    console.warn('IndexedDB memories read error:', e);
  }
  return getStoredMemories();
};

export const saveStoredMemories = async (memories, changedMemory = null, isDelete = false) => {
  // 1. Unlimited persistent local store via IndexedDB
  try {
    await idbSet(STORAGE_KEYS.MEMORIES, memories);
  } catch (e) {
    console.warn('IndexedDB memory write notice:', e);
  }

  // 2. LocalStorage fast-cache (with quota guard)
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.warn('LocalStorage quota limit reached (safely stored in IndexedDB):', e.message);
  }

  // Cloud sync to Firestore
  try {
    if (changedMemory) {
      if (isDelete) {
        await deleteMemoryFromFirestore(changedMemory.id);
      } else {
        await saveMemoryToFirestore(changedMemory);
      }
    } else {
      // Sync all
      for (const m of memories) {
        await saveMemoryToFirestore(m);
      }
    }
  } catch (e) {
    console.warn('Firestore sync notice:', e);
  }
};

export const getStoredLetters = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LETTERS);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return initialLoveLetters;
};

export const saveStoredLetters = (letters) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LETTERS, JSON.stringify(letters));
  } catch (e) {}
};

export const getStoredFuturePlans = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FUTURE);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return initialFuturePlans;
};

export const saveStoredFuturePlans = (plans) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FUTURE, JSON.stringify(plans));
  } catch (e) {}
};

// Admin Auth Session
export const getAdminSession = () => {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.AUTH);
    if (session) {
      const parsed = JSON.parse(session);
      // Valid for 24 hours
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.user;
      }
    }
  } catch (e) {}
  return null;
};

export const setAdminSession = (user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({
      user,
      timestamp: Date.now()
    }));
  } catch (e) {}
};

export const clearAdminSession = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (e) {}
};

export const getStoredCustomTexts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEXTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Could not read custom texts from storage:', e);
  }
  return {};
};

export const saveStoredCustomTexts = (texts) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXTS, JSON.stringify(texts));
  } catch (e) {
    console.error('Failed to save custom texts locally:', e);
  }
};

export const clearStoredCustomTexts = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TEXTS);
  } catch (e) {}
};

export const getStoredCustomImages = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.IMAGES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.warn('Could not read custom images from storage:', e);
  }
  return {};
};

export const getStoredCustomImagesAsync = async () => {
  try {
    const idbData = await idbGet(STORAGE_KEYS.IMAGES);
    if (idbData && typeof idbData === 'object' && Object.keys(idbData).length > 0) {
      return idbData;
    }
  } catch (e) {
    console.warn('IndexedDB custom images read error:', e);
  }
  return getStoredCustomImages();
};

export const saveStoredCustomImages = async (images) => {
  // 1. Unlimited persistent local store via IndexedDB
  try {
    await idbSet(STORAGE_KEYS.IMAGES, images);
  } catch (e) {
    console.warn('IndexedDB images write notice:', e);
  }

  // 2. LocalStorage fast-cache (with quota guard)
  try {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
  } catch (e) {
    console.warn('LocalStorage quota limit reached for images (safely stored in IndexedDB):', e.message);
  }
};

export const clearStoredCustomImages = async () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.IMAGES);
  } catch (e) {}
  try {
    await idbSet(STORAGE_KEYS.IMAGES, {});
  } catch (e) {}
};




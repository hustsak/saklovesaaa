// Local Storage & Archive Persistence Engine with Firebase Cloud Sync
// Project: love-c9700 (Viraksak Koy & Chanreaksa Sok)

import { initialMemories, initialLoveLetters, initialFuturePlans } from './defaultMemories';
import { saveMemoryToFirestore, deleteMemoryFromFirestore } from './firebase';

const STORAGE_KEYS = {
  MEMORIES: 'love_archive_memories_v1',
  LETTERS: 'love_archive_letters_v3',
  FUTURE: 'love_archive_future_v1',
  AUTH: 'love_archive_auth_session',
  SETTINGS: 'love_archive_settings_v1',
  TEXTS: 'love_archive_custom_texts_v1',
  IMAGES: 'love_archive_custom_images_v1'
};

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

export const saveStoredMemories = async (memories, changedMemory = null, isDelete = false) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  } catch (e) {
    console.error('Failed to save memories locally:', e);
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

export const saveStoredCustomImages = (images) => {
  try {
    localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save custom images locally:', e);
  }
};

export const clearStoredCustomImages = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.IMAGES);
  } catch (e) {}
};



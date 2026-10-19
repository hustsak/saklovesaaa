import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredCustomTexts,
  saveStoredCustomTexts,
  clearStoredCustomTexts,
  getStoredCustomImages,
  saveStoredCustomImages,
  clearStoredCustomImages
} from '../utils/storage';
import {
  subscribeTextsFromFirestore,
  saveTextsToFirestore,
  subscribeImagesFromFirestore,
  saveImagesToFirestore
} from '../utils/firebase';
import { sound } from '../utils/audioSynthesizer';

const SiteTextContext = createContext({
  siteTexts: {},
  getText: (key, defaultVal) => defaultVal,
  updateText: (key, newVal) => {},
  resetAllTexts: () => {},

  siteImages: {},
  getImage: (key, defaultVal) => defaultVal,
  updateImage: (key, newUrl) => {},

  isEditMode: false,
  editingKey: null,
  setEditingKey: () => {},
  adminUser: null,
  onRequestLogin: (payload) => {},
  onLogout: () => {},
  saveToastMessage: '',
  setSaveToastMessage: () => {}
});

export function SiteTextProvider({ children, adminUser, onRequestLogin, onLogout }) {
  const [siteTexts, setSiteTexts] = useState(() => getStoredCustomTexts());
  const [siteImages, setSiteImages] = useState(() => getStoredCustomImages());
  const [editingKey, setEditingKey] = useState(null);
  const [saveToastMessage, setSaveToastMessage] = useState('');

  const isEditMode = Boolean(adminUser);

  // Sync texts with Firestore
  useEffect(() => {
    const unsubscribeTexts = subscribeTextsFromFirestore((cloudTexts) => {
      if (cloudTexts && Object.keys(cloudTexts).length > 0) {
        setSiteTexts((prev) => ({ ...prev, ...cloudTexts }));
        saveStoredCustomTexts({ ...siteTexts, ...cloudTexts });
      }
    });

    const unsubscribeImages = subscribeImagesFromFirestore((cloudImages) => {
      if (cloudImages && Object.keys(cloudImages).length > 0) {
        setSiteImages((prev) => ({ ...prev, ...cloudImages }));
        saveStoredCustomImages({ ...siteImages, ...cloudImages });
      }
    });

    return () => {
      if (typeof unsubscribeTexts === 'function') unsubscribeTexts();
      if (typeof unsubscribeImages === 'function') unsubscribeImages();
    };
  }, []);

  const getText = (key, defaultVal) => {
    if (siteTexts && siteTexts[key] !== undefined && siteTexts[key] !== null) {
      return siteTexts[key];
    }
    return defaultVal;
  };

  const updateText = (key, newVal) => {
    const updated = { ...siteTexts, [key]: newVal };
    setSiteTexts(updated);
    saveStoredCustomTexts(updated);
    saveTextsToFirestore(updated);
    sound.playTapeClick();

    setSaveToastMessage(`✦ Saved: "${newVal.slice(0, 20)}${newVal.length > 20 ? '...' : ''}"`);
    setTimeout(() => {
      setSaveToastMessage('');
    }, 2400);
  };

  const getImage = (key, defaultVal) => {
    if (
      siteImages &&
      siteImages[key] &&
      typeof siteImages[key] === 'string' &&
      siteImages[key] !== '[object Object]' &&
      siteImages[key].length > 10
    ) {
      return siteImages[key];
    }
    return defaultVal;
  };

  const updateImage = (key, newUrl) => {
    const validUrl = typeof newUrl === 'string' ? newUrl : newUrl?.dataUrl;
    if (!validUrl || typeof validUrl !== 'string' || validUrl === '[object Object]') {
      console.warn('Invalid image URL skipped:', newUrl);
      return;
    }

    const updated = { ...siteImages, [key]: validUrl };
    setSiteImages(updated);
    saveStoredCustomImages(updated);
    saveImagesToFirestore(updated);
    sound.playShutterSound();

    setSaveToastMessage('✦ Photo replaced & saved!');
    setTimeout(() => {
      setSaveToastMessage('');
    }, 2400);
  };

  const resetAllTexts = () => {
    if (window.confirm('Reset all edited text and replaced photos back to original defaults?')) {
      clearStoredCustomTexts();
      clearStoredCustomImages();
      setSiteTexts({});
      setSiteImages({});
      sound.playTapeClick();
      setSaveToastMessage('↺ Restored original defaults');
      setTimeout(() => setSaveToastMessage(''), 2400);
    }
  };

  return (
    <SiteTextContext.Provider
      value={{
        siteTexts,
        getText,
        updateText,
        resetAllTexts,
        siteImages,
        getImage,
        updateImage,
        isEditMode,
        editingKey,
        setEditingKey,
        adminUser,
        onRequestLogin,
        onLogout,
        saveToastMessage,
        setSaveToastMessage
      }}
    >
      {children}
    </SiteTextContext.Provider>
  );
}

export const useSiteText = () => useContext(SiteTextContext);

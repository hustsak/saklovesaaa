// Firebase Configuration & Service Integration
// Project: love-c9700 (Viraksak Koy & Chanreaksa Sok)

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { initialMemories } from './defaultMemories';

const firebaseConfig = {
  apiKey: "AIzaSyBjEl4rIclpHKJ29f4TWOxbPzZakmZCNno",
  authDomain: "love-c9700.firebaseapp.com",
  projectId: "love-c9700",
  storageBucket: "love-c9700.firebasestorage.app",
  messagingSenderId: "324594276155",
  appId: "1:324594276155:web:0bb744e9f8ae7fff4fc91e",
  measurementId: "G-YLMK51BTRS"
};

// Initialize Firebase App & Firestore
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Lazy instances for Auth & Storage (loaded on-demand when user logs in or uploads)
let _auth = null;
let _storage = null;

export const getAuthInstance = async () => {
  if (!_auth) {
    const { getAuth } = await import('firebase/auth');
    _auth = getAuth(app);
  }
  return _auth;
};

export const getStorageInstance = async () => {
  if (!_storage) {
    const { getStorage } = await import('firebase/storage');
    _storage = getStorage(app);
  }
  return _storage;
};

export const auth = {
  get currentUser() {
    return _auth ? _auth.currentUser : null;
  }
};

// Realtime Firestore listener for memories
export const subscribeMemoriesFromFirestore = (callback) => {
  try {
    const memCol = collection(db, 'memories');
    return onSnapshot(
      memCol,
      async (snapshot) => {
        if (!snapshot.empty) {
          const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          callback(docs);
        } else {
          // If collection is empty in Firestore, automatically seed with initial memories
          console.log('Seeding initial memories to Firestore...');
          for (const mem of initialMemories) {
            await setDoc(doc(db, 'memories', mem.id), mem);
          }
          callback(initialMemories);
        }
      },
      (error) => {
        console.warn('Firestore snapshot notice (falling back to local cache):', error);
      }
    );
  } catch (e) {
    console.warn('Firestore initialization notice:', e);
    return () => {};
  }
};

// Save / Update memory in Firestore
export const saveMemoryToFirestore = async (memory) => {
  try {
    // Ensure authenticated session for Firestore security rules
    await ensureFirebaseAuth();

    const memoryRef = doc(db, 'memories', memory.id);
    await setDoc(memoryRef, memory, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving memory to Firestore:', e);
    return false;
  }
};

// Delete memory from Firestore
export const deleteMemoryFromFirestore = async (memoryId) => {
  try {
    const memoryRef = doc(db, 'memories', memoryId);
    await deleteDoc(memoryRef);
    return true;
  } catch (e) {
    console.error('Error deleting memory from Firestore:', e);
    return false;
  }
};

// Upload photo file directly to Firebase Storage
export const uploadPhotoToFirebaseStorage = async (file) => {
  try {
    // Ensure we have an authenticated session before uploading
    // Storage rules require request.auth != null
    await ensureFirebaseAuth();

    const storageInstance = await getStorageInstance();
    const { ref: storageRef, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const fileRef = storageRef(storageInstance, `photos/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (e) {
    console.error('Error uploading photo to Firebase Storage:', e);
    throw e;
  }
};

// Firebase Login helper
export const loginWithFirebase = async (emailOrUsername, password) => {
  // Convert simple usernames like "sak" or "admin" to standard email format if needed
  let email = emailOrUsername.trim();
  if (!email.includes('@')) {
    email = `${email}@love.archive`;
  }

  try {
    const authInstance = await getAuthInstance();
    const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import('firebase/auth');
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    // If user not found, try creating account automatically for the couple
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const authInstance = await getAuthInstance();
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const newUserCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        return { success: true, user: newUserCredential.user };
      } catch (signupError) {
        return { success: false, error: signupError.message };
      }
    }
    return { success: false, error: error.message };
  }
};

// Guarantee an active Firebase Auth session so request.auth != null for security rules
export const ensureFirebaseAuth = async () => {
  if (_auth && _auth.currentUser) return _auth.currentUser;
  try {
    const authInstance = await getAuthInstance();
    const { signInAnonymously } = await import('firebase/auth');
    const cred = await signInAnonymously(authInstance);
    return cred.user;
  } catch (e) {
    console.warn('Anonymous auth fallback notice:', e);
    return null;
  }
};

// Realtime Firestore listener for custom site texts
export const subscribeTextsFromFirestore = (callback) => {
  try {
    const textDocRef = doc(db, 'settings', 'site_texts');
    return onSnapshot(
      textDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        }
      },
      (error) => {
        console.warn('Firestore texts snapshot notice (using local):', error);
      }
    );
  } catch (e) {
    console.warn('Firestore texts listener notice:', e);
    return () => {};
  }
};

// Save custom site texts to Firestore
export const saveTextsToFirestore = async (texts) => {
  try {
    const textDocRef = doc(db, 'settings', 'site_texts');
    await setDoc(textDocRef, texts, { merge: true });
    return true;
  } catch (e) {
    console.warn('Error saving texts to Firestore:', e);
    return false;
  }
};

// Realtime Firestore listener for custom site images
export const subscribeImagesFromFirestore = (callback) => {
  try {
    const imgDocRef = doc(db, 'settings', 'site_images');
    return onSnapshot(
      imgDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        }
      },
      (error) => {
        console.warn('Firestore images snapshot notice (using local):', error);
      }
    );
  } catch (e) {
    console.warn('Firestore images listener notice:', e);
    return () => {};
  }
};

// Save custom site images to Firestore
export const saveImagesToFirestore = async (images) => {
  try {
    const imgDocRef = doc(db, 'settings', 'site_images');
    await setDoc(imgDocRef, images, { merge: true });
    return true;
  } catch (e) {
    console.warn('Error saving images to Firestore:', e);
    return false;
  }
};



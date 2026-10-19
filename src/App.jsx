import React, { useState, useEffect, Suspense, lazy } from 'react';
import RealisticSky from './components/Environment/RealisticSky';
import RetroNavBar from './components/Navigation/RetroNavBar';
import DigitalViewfinder from './components/CameraUI/DigitalViewfinder';
import ShutterTransition from './components/Transitions/ShutterTransition';
import HomeHero from './components/Sections/HomeHero';
import StoryTimeline from './components/Sections/StoryTimeline';
import PolaroidAlbum from './components/PhotoAlbum/PolaroidAlbum';
import LoveLetters from './components/DesktopOS/LoveLetters';
import CassettePlayer from './components/MusicPlayer/CassettePlayer';
import { SiteTextProvider } from './context/SiteTextContext';
import { useMusicPlayer } from './hooks/useMusicPlayer';

// Code-split non-critical modals and heavy secondary desktop OS
const MemoryModal = lazy(() => import('./components/PhotoAlbum/MemoryModal'));
const RetroDesktop = lazy(() => import('./components/DesktopOS/RetroDesktop'));
const RetroLoginModal = lazy(() => import('./components/Admin/RetroLoginModal'));
const AdminDashboard = lazy(() => import('./components/Admin/AdminDashboard'));
const EasterEggsModal = lazy(() => import('./components/EasterEggs/EasterEggsModal'));
const PhonePhotoUploader = lazy(() => import('./components/PhotoUpload/PhonePhotoUploader'));
const LittleUniverse = lazy(() => import('./components/Sections/LittleUniverse'));

import {
  getStoredMemories,
  getStoredMemoriesAsync,
  saveStoredMemories,
  getStoredLetters,
  saveStoredLetters,
  getAdminSession,
  clearAdminSession
} from './utils/storage';
import { subscribeMemoriesFromFirestore } from './utils/firebase';
import { sound } from './utils/audioSynthesizer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [crtMode, setCrtMode] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Centralized Music Player synced directly with D:\Downloads\love\mp3
  const musicPlayer = useMusicPlayer(isMuted);

  // Data State
  const [memories, setMemories] = useState(getStoredMemories);
  const [letters, setLetters] = useState(getStoredLetters);

  // Modals & Active Selections
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [adminUser, setAdminUser] = useState(() => getAdminSession());
  const [adminLoginReason, setAdminLoginReason] = useState('');
  const [pendingAdminAction, setPendingAdminAction] = useState(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isEasterEggOpen, setIsEasterEggOpen] = useState(false);
  const [isPhoneUploadOpen, setIsPhoneUploadOpen] = useState(false);
  const [easterEggData, setEasterEggData] = useState(null);
  const [isShutterActive, setIsShutterActive] = useState(false);

  // Hydrate memories from IndexedDB (supports unlimited photo size and quantity)
  useEffect(() => {
    let mounted = true;
    getStoredMemoriesAsync().then((idbMemories) => {
      if (mounted && idbMemories && idbMemories.length > 0) {
        setMemories((prev) => (idbMemories.length >= prev.length ? idbMemories : prev));
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Real-time Firestore sync & session check
  useEffect(() => {
    const unsubscribe = subscribeMemoriesFromFirestore((cloudMemories) => {
      if (cloudMemories && cloudMemories.length > 0) {
        setMemories(cloudMemories);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    if (isDesktopView) setIsDesktopView(false);
    setActiveTab(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      const navOffset = 65;
      const top = target.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Scroll spy to automatically highlight nav items as the user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (isDesktopView) return;
      const sections = ['home', 'story', 'memories', 'letters', 'universe'];
      const scrollPos = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(sections[i]);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDesktopView]);

  // Secret typing detector ("forever", "sak", "reaksa", "love")
  useEffect(() => {
    let keyBuffer = '';
    const secretCodes = {
      'forever': 'Forever & Always Note',
      'sak': 'Sak’s Hidden Message',
      'reaksa': 'Reaksa’s Secret Archive',
      'love': 'Secret Chamber of Love'
    };

    const handleKeyDown = (e) => {
      // If typing in input or textarea, don't trigger easter egg
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-10);

      for (const [code, title] of Object.entries(secretCodes)) {
        if (keyBuffer.endsWith(code)) {
          sound.playCrtToggle(true);
          confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
          setEasterEggData({
            title: `Unlocked: ${title}`,
            subtitle: `Secret passphrase '${code.toUpperCase()}' accepted`,
            message: `“You found the hidden keystroke archive. Every single day spent with you feels like discovering poetry in the quietest hours. Viraksak Koy & Chanreaksa Sok — our bond is carved into the stars.”`
          });
          setIsEasterEggOpen(true);
          keyBuffer = '';
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick Camera Snapshot / Random Memory Trigger
  const triggerRandomSnapshot = () => {
    setIsShutterActive(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * memories.length);
      setSelectedMemory(memories[randomIndex]);
      setIsShutterActive(false);
    }, 240);
  };

  // Open secret letter from V+C double click
  const handleOpenVCClick = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 } });
    setEasterEggData({
      title: 'The Monogram Archive: S + S',
      subtitle: 'Phnom Penh • Established 2024 • Preserved 2026',
      message: '“Two initials linked together: Viraksak & Chanreaksa. From our first quiet walk by Sisowath Quay to every tomorrow we will ever share, my heart is completely yours.”'
    });
    setIsEasterEggOpen(true);
  };

  // Admin Actions & Permissions
  const handleOpenAdmin = () => {
    if (adminUser) {
      setIsAdminDashboardOpen(true);
    } else {
      setAdminLoginReason('');
      setPendingAdminAction(null);
      setIsAdminLoginOpen(true);
    }
  };

  const handleOpenPhoneUpload = () => {
    if (adminUser) {
      setIsPhoneUploadOpen(true);
    } else {
      setAdminLoginReason('ADMIN LOGIN REQUIRED: ONLY VIRAKSAK & CHANREAKSA CAN UPLOAD PHOTOGRAPHS');
      setPendingAdminAction('upload');
      setIsAdminLoginOpen(true);
    }
  };

  const handleRequireAdminLogin = (reason) => {
    setAdminLoginReason(reason || 'ADMIN AUTHENTICATION REQUIRED');
    setPendingAdminAction(null);
    setIsAdminLoginOpen(true);
  };

  const handleRequestLogin = (payload) => {
    if (typeof payload === 'string') {
      setAdminLoginReason('AUTHENTICATION REQUIRED: LOG IN AS SAK OR REAKSA TO EDIT ARCHIVE TEXT');
      setPendingAdminAction({ type: 'editText', key: payload });
    } else if (payload && payload.type === 'editImage') {
      setAdminLoginReason('AUTHENTICATION REQUIRED: LOG IN AS SAK OR REAKSA TO EDIT & REPLACE PHOTOGRAPHS');
      setPendingAdminAction(payload);
    } else {
      setAdminLoginReason('ADMIN AUTHENTICATION REQUIRED');
      setPendingAdminAction(null);
    }
    setIsAdminLoginOpen(true);
  };

  const handleAdminLoginSuccess = (user) => {
    const active = user || getAdminSession();
    setAdminUser(active);
    setIsAdminLoginOpen(false);
    if (pendingAdminAction === 'upload') {
      setIsPhoneUploadOpen(true);
      setPendingAdminAction(null);
    } else {
      setPendingAdminAction(null);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    setAdminUser(null);
    setIsAdminDashboardOpen(false);
    setIsPhoneUploadOpen(false);
  };

  const handleSaveMemories = (updated) => {
    setMemories(updated);
    saveStoredMemories(updated);
  };

  const handleSaveLetters = (updated) => {
    setLetters(updated);
    saveStoredLetters(updated);
  };

  const handleSaveNewPhoneMemory = (newMem) => {
    const updated = [newMem, ...memories];
    setMemories(updated);
    saveStoredMemories(updated, newMem, false);
  };

  const handleUpdateMemory = (updated) => {
    const list = memories.map((m) => (m.id === updated.id ? updated : m));
    setMemories(list);
    setSelectedMemory(updated);
    saveStoredMemories(list, updated, false);
  };

  return (
    <SiteTextProvider adminUser={adminUser} onRequestLogin={handleRequestLogin} onLogout={handleLogout}>
      <div className={`app-root ${crtMode ? 'crt-mode' : ''}`}>
        {/* 1. Realistic Sunset Environment Layer (behind retro interface) */}
        <RealisticSky />

      {/* 2. Film Grain Overlay */}
      <div className="film-grain-overlay" />

      {/* 3. Camera Viewfinder HUD Overlay */}
      <DigitalViewfinder currentMemory={selectedMemory || memories[0]} />

      {/* 4. Film Shutter Blade Transition */}
      <ShutterTransition isShutterActive={isShutterActive} />

      {/* 5. Retro Top Navigation Bar */}
      <RetroNavBar
        activeTab={activeTab}
        setActiveTab={scrollToSection}
        crtMode={crtMode}
        setCrtMode={setCrtMode}
        isDesktopView={isDesktopView}
        setIsDesktopView={setIsDesktopView}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        onOpenAdmin={handleOpenAdmin}
        onOpenSecretLetter={handleOpenVCClick}
        onCameraSnap={triggerRandomSnapshot}
        onOpenPhoneUpload={handleOpenPhoneUpload}
        onToggleMusic={() => {
          sound.playTapeClick();
          musicPlayer.setIsMinimized(!musicPlayer.isMinimized);
        }}
        adminUser={adminUser}
        onLogout={handleLogout}
      />

      {/* 6. Main Content Area */}
      <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
        {isDesktopView ? (
          /* Retro Early 2000s OS Desktop Mode */
          <Suspense fallback={null}>
            <RetroDesktop
              memories={memories}
              letters={letters}
              onSelectMemory={(m) => setSelectedMemory(m)}
              musicPlayer={musicPlayer}
            />
          </Suspense>
        ) : (
          /* Connected Scrollable Digital Diary Experience */
          <div className="connected-scroll-page">
            {/* 1. HOME SECTION */}
            <section id="home">
              <HomeHero
                onExploreMemories={() => scrollToSection('story')}
              />
            </section>

            <div className="section-divider-film">
              <div className="section-divider-line" />
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-burgundy)', letterSpacing: '2px' }}>
                ✦ CHAPTER I &bull; STORY ✦
              </span>
              <div className="section-divider-line" />
            </div>

            {/* 2. STORY SECTION */}
            <section id="story">
              <StoryTimeline onSelectPhoto={(m) => setSelectedMemory(m)} />
            </section>

            <div className="section-divider-film">
              <div className="section-divider-line" />
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-burgundy)', letterSpacing: '2px' }}>
                ✦ TIME-STAMPED PHOTOGRAPHS ✦
              </span>
              <div className="section-divider-line" />
            </div>

            {/* 3. MEMORIES SECTION */}
            <section id="memories">
              <PolaroidAlbum
                memories={memories}
                onSelectMemory={(m) => setSelectedMemory(m)}
                onOpenUpload={handleOpenPhoneUpload}
              />
            </section>

            <div className="section-divider-film">
              <div className="section-divider-line" />
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-burgundy)', letterSpacing: '2px' }}>
                ✦ CONFIDENTIAL LETTERS ✦
              </span>
              <div className="section-divider-line" />
            </div>

            {/* 4. LETTERS SECTION ("OPEN WHEN YOU NEED ME") */}
            <section id="letters" style={{ maxWidth: '820px', margin: '0 auto', padding: '50px 20px 70px 20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '44px' }}>
                {/* Handwritten Heart & Envelope Illustration */}
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                  <svg width="42" height="42" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.9 }}>
                    <path d="M22 36C22 36 7 26.5 7 15.5C7 10 11.5 5.5 17 5.5C20.3 5.5 22 7.7 22 7.7C22 7.7 23.7 5.5 27 5.5C32.5 5.5 37 10 37 15.5C37 26.5 22 36 22 36Z" stroke="#682A36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(104, 42, 54, 0.08)"/>
                    <path d="M14 15L22 21.5L30 15" stroke="#682A36" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* Main Title */}
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)',
                    color: 'var(--retro-charcoal)',
                    fontWeight: 600,
                    letterSpacing: '-0.5px',
                    marginBottom: '10px',
                    lineHeight: 1.2
                  }}
                >
                  ♡ Open When You Need Me
                </h2>

                {/* Subtle Handwritten Subtitle */}
                <p
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: 'clamp(1.25rem, 2.6vw, 1.55rem)',
                    color: 'var(--retro-brown)',
                    fontWeight: 500,
                    margin: 0
                  }}
                >
                  A few little words, for whenever you need them.
                </p>
              </div>
              <LoveLetters letters={letters} />
            </section>

            <div className="section-divider-film">
              <div className="section-divider-line" />
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-burgundy)', letterSpacing: '2px' }}>
                ✦ A LITTLE UNIVERSE &bull; COSMOS ✦
              </span>
              <div className="section-divider-line" />
            </div>

            {/* 5. A LITTLE UNIVERSE SECTION */}
            <section id="universe">
              <Suspense fallback={<div style={{ minHeight: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--retro-brown)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>✦ GATHERING STARLIGHT...</div>}>
                <LittleUniverse />
              </Suspense>
            </section>
          </div>
        )}
      </main>

      {/* 7. Cassette & MP3 Player Widget */}
      <CassettePlayer musicPlayer={musicPlayer} isMuted={isMuted} />

      {/* 8. Memory Viewfinder & Journal Page Modal */}
      {selectedMemory && (
        <Suspense fallback={null}>
          <MemoryModal
            memory={selectedMemory}
            memories={memories}
            onClose={() => setSelectedMemory(null)}
            onSelectMemory={(m) => setSelectedMemory(m)}
            onUpdateMemory={handleUpdateMemory}
            adminUser={adminUser}
            onRequireAdminLogin={handleRequireAdminLogin}
          />
        </Suspense>
      )}

      {/* 9. Retro Admin Login Modal ("PRIVATE ARCHIVE") */}
      {isAdminLoginOpen && (
        <Suspense fallback={null}>
          <RetroLoginModal
            isOpen={isAdminLoginOpen}
            onClose={() => setIsAdminLoginOpen(false)}
            onLoginSuccess={handleAdminLoginSuccess}
            reasonText={adminLoginReason}
          />
        </Suspense>
      )}

      {/* 10. Admin Memory Management Dashboard */}
      {isAdminDashboardOpen && (
        <Suspense fallback={null}>
          <AdminDashboard
            memories={memories}
            onSaveMemories={handleSaveMemories}
            letters={letters}
            onSaveLetters={handleSaveLetters}
            onClose={() => setIsAdminDashboardOpen(false)}
          />
        </Suspense>
      )}

      {/* 11. Secret Easter Egg Modal */}
      {isEasterEggOpen && (
        <Suspense fallback={null}>
          <EasterEggsModal
            isOpen={isEasterEggOpen}
            onClose={() => setIsEasterEggOpen(false)}
            title={easterEggData?.title}
            subtitle={easterEggData?.subtitle}
            message={easterEggData?.message}
          />
        </Suspense>
      )}

      {/* 12. Phone Camera / Photo Upload Modal */}
      {isPhoneUploadOpen && (
        <Suspense fallback={null}>
          <PhonePhotoUploader
            isOpen={isPhoneUploadOpen}
            onClose={() => setIsPhoneUploadOpen(false)}
            onSaveNewMemory={handleSaveNewPhoneMemory}
            adminUser={adminUser}
          />
        </Suspense>
      )}

      {/* 13. Floating Admin Status Bar (visible sign-out for logged-in users) */}
      {adminUser && (
        <div
          className="admin-floating-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 960,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '8px 16px',
            background: 'linear-gradient(180deg, rgba(28,27,26,0.92) 0%, rgba(28,27,26,0.97) 100%)',
            backdropFilter: 'blur(10px)',
            borderTop: '1px solid rgba(199,182,153,0.2)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--retro-champagne)',
            letterSpacing: '0.5px',
            animation: 'slideUpBar 0.3s ease-out'
          }}
        >
          <span style={{ opacity: 0.6 }}>✦ SIGNED IN AS</span>
          <span style={{
            background: 'var(--retro-burgundy)',
            color: '#FFF',
            padding: '2px 10px',
            borderRadius: '3px',
            fontWeight: 700,
            fontSize: '0.74rem',
            letterSpacing: '1px'
          }}>
            {adminUser.username?.toUpperCase() || 'ADMIN'}
          </span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ opacity: 0.6 }}>EDIT MODE ACTIVE</span>
          <button
            onClick={() => {
              sound.playKeyClick();
              handleLogout();
            }}
            style={{
              background: 'transparent',
              border: '1px solid rgba(199,182,153,0.4)',
              color: 'var(--retro-champagne)',
              padding: '4px 14px',
              borderRadius: '3px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginLeft: '4px'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--retro-faded-red)';
              e.target.style.borderColor = 'var(--retro-faded-red)';
              e.target.style.color = '#FFF';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.borderColor = 'rgba(199,182,153,0.4)';
              e.target.style.color = 'var(--retro-champagne)';
            }}
            title="Sign out of admin session"
          >
            SIGN OUT
          </button>
        </div>
      )}
      </div>
    </SiteTextProvider>
  );
}

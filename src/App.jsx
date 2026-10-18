import React, { useState, useEffect } from 'react';
import RealisticSky from './components/Environment/RealisticSky';
import RetroNavBar from './components/Navigation/RetroNavBar';
import DigitalViewfinder from './components/CameraUI/DigitalViewfinder';
import ShutterTransition from './components/Transitions/ShutterTransition';
import HomeHero from './components/Sections/HomeHero';
import StoryTimeline from './components/Sections/StoryTimeline';
import PolaroidAlbum from './components/PhotoAlbum/PolaroidAlbum';
import MemoryModal from './components/PhotoAlbum/MemoryModal';
import FutureView from './components/Sections/FutureView';
import LoveLetters from './components/DesktopOS/LoveLetters';
import RetroDesktop from './components/DesktopOS/RetroDesktop';
import CassettePlayer from './components/MusicPlayer/CassettePlayer';
import RetroLoginModal from './components/Admin/RetroLoginModal';
import AdminDashboard from './components/Admin/AdminDashboard';
import EasterEggsModal from './components/EasterEggs/EasterEggsModal';
import PhonePhotoUploader from './components/PhotoUpload/PhonePhotoUploader';
import { SiteTextProvider } from './context/SiteTextContext';
import { useMusicPlayer } from './hooks/useMusicPlayer';

import {
  getStoredMemories,
  saveStoredMemories,
  getStoredLetters,
  saveStoredLetters,
  getStoredFuturePlans,
  saveStoredFuturePlans,
  getAdminSession
} from './utils/storage';
import { subscribeMemoriesFromFirestore } from './utils/firebase';
import { sound } from './utils/audioSynthesizer';
import confetti from 'canvas-confetti';

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
  const [futurePlans, setFuturePlans] = useState(getStoredFuturePlans);

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
      const sections = ['home', 'story', 'memories', 'letters', 'future'];
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
    <SiteTextProvider adminUser={adminUser} onRequestLogin={handleRequestLogin}>
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
          <RetroDesktop
            memories={memories}
            letters={letters}
            futurePlans={futurePlans}
            onSelectMemory={(m) => setSelectedMemory(m)}
            musicPlayer={musicPlayer}
          />
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

            {/* 4. LETTERS SECTION */}
            <section id="letters" style={{ maxWidth: '820px', margin: '0 auto', padding: '40px 20px 60px 20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1.15rem',
                    color: 'var(--retro-burgundy)',
                    marginBottom: '6px'
                  }}
                >
                  CONFIDENTIAL &bull; FOR CHANREAKSA’S EYES ONLY
                </div>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                    color: 'var(--retro-charcoal)',
                    fontWeight: 600
                  }}
                >
                  Open When You Need Me
                </h2>
              </div>
              <LoveLetters letters={letters} />
            </section>

            <div className="section-divider-film">
              <div className="section-divider-line" />
              <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-burgundy)', letterSpacing: '2px' }}>
                ✦ OUR HORIZONS &bull; 2026+ ✦
              </span>
              <div className="section-divider-line" />
            </div>

            {/* 5. FUTURE SECTION */}
            <section id="future">
              <FutureView futurePlans={futurePlans} />
            </section>
          </div>
        )}
      </main>

      {/* 7. Cassette & MP3 Player Widget */}
      <CassettePlayer musicPlayer={musicPlayer} isMuted={isMuted} />

      {/* 8. Memory Viewfinder & Journal Page Modal */}
      <MemoryModal
        memory={selectedMemory}
        memories={memories}
        onClose={() => setSelectedMemory(null)}
        onSelectMemory={(m) => setSelectedMemory(m)}
        onUpdateMemory={handleUpdateMemory}
        adminUser={adminUser}
        onRequireAdminLogin={handleRequireAdminLogin}
      />

      {/* 9. Retro Admin Login Modal ("PRIVATE ARCHIVE") */}
      <RetroLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        reasonText={adminLoginReason}
      />

      {/* 10. Admin Memory Management Dashboard */}
      {isAdminDashboardOpen && (
        <AdminDashboard
          memories={memories}
          onSaveMemories={handleSaveMemories}
          letters={letters}
          onSaveLetters={handleSaveLetters}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      {/* 11. Secret Easter Egg Modal */}
      <EasterEggsModal
        isOpen={isEasterEggOpen}
        onClose={() => setIsEasterEggOpen(false)}
        title={easterEggData?.title}
        subtitle={easterEggData?.subtitle}
        message={easterEggData?.message}
      />

        {/* 12. Phone Camera / Photo Upload Modal */}
        <PhonePhotoUploader
          isOpen={isPhoneUploadOpen}
          onClose={() => setIsPhoneUploadOpen(false)}
          onSaveNewMemory={handleSaveNewPhoneMemory}
          adminUser={adminUser}
        />
      </div>
    </SiteTextProvider>
  );
}

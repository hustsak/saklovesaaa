import React from 'react';
import { Tv, Monitor, Volume2, VolumeX, Lock, Camera, Music, UploadCloud } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';

export default function RetroNavBar({
  activeTab,
  setActiveTab,
  crtMode,
  setCrtMode,
  isDesktopView,
  setIsDesktopView,
  isMuted,
  setIsMuted,
  onOpenAdmin,
  onOpenSecretLetter,
  onCameraSnap,
  onOpenPhoneUpload,
  onToggleMusic,
  adminUser,
  onLogout
}) {
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'story', label: 'STORY' },
    { id: 'memories', label: 'MEMORIES' },
    { id: 'letters', label: 'LETTERS' },
    { id: 'universe', label: 'UNIVERSE' }
  ];

  const handleTabClick = (tabId) => {
    sound.playTapeClick();
    setActiveTab(tabId);
    if (isDesktopView) setIsDesktopView(false);
  };

  const toggleCrt = () => {
    const next = !crtMode;
    sound.playCrtToggle(next);
    setCrtMode(next);
  };

  const toggleDesktop = () => {
    sound.playTapeClick();
    setIsDesktopView(!isDesktopView);
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  return (
    <header className="retro-nav-container">
      <div className="retro-nav-frame">
        {/* Row 1: Brand Monogram + Controls (Combined on desktop, separate rows on mobile) */}
        <div className="nav-top-row">
          {/* Left: Brand Monogram & Subtitle */}
          <div className="nav-brand-group">
            <div
              className="nav-badge-monogram"
              title="Double-click for a secret love note"
              onDoubleClick={() => {
                sound.playTapeClick();
                onOpenSecretLetter();
              }}
            >
              S + S
            </div>
            <div className="nav-title-sub">OUR STORY</div>
            <div className="nav-year-rec">
              <span>2026</span>
              <div className="rec-dot" title="Camera Recording Live" />
              <span style={{ fontSize: '0.85rem', opacity: 0.85 }}>REC</span>
            </div>
          </div>

          {/* Right: Retro Controls & Mode Toggles */}
          <div className="nav-control-toggles">
            {/* CRT Mode Toggle */}
            <button
              className={`nav-icon-toggle ${crtMode ? 'active-indicator' : ''}`}
              title={`CRT Mode: ${crtMode ? 'ON' : 'OFF'}`}
              onClick={toggleCrt}
            >
              <Tv size={15} />
            </button>

            {/* Early 2000s OS Desktop Mode */}
            <button
              className={`nav-icon-toggle ${isDesktopView ? 'active-indicator' : ''}`}
              title="Retro Computer Desktop (S+S OS)"
              onClick={toggleDesktop}
            >
              <Monitor size={15} />
            </button>

            {/* Music Player Toggle */}
            <button
              className="nav-icon-toggle"
              title="Toggle Music Cassette Player"
              onClick={() => {
                sound.playTapeClick();
                if (typeof onToggleMusic === 'function') onToggleMusic();
              }}
            >
              <Music size={15} />
            </button>

            {/* Audio Mute Toggle */}
            <button
              className="nav-icon-toggle"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              onClick={toggleSound}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>

            {/* Upload Photograph Button (Admin Only) */}
            {adminUser && (
              <button
                className="nav-icon-toggle"
                title="Upload New Photograph"
                onClick={() => {
                  sound.playTapeClick();
                  if (typeof onOpenPhoneUpload === 'function') onOpenPhoneUpload();
                }}
              >
                <UploadCloud size={15} />
              </button>
            )}

            {/* Admin Archive Login / Active Session */}
            {adminUser ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <button
                  className="nav-icon-toggle active-indicator"
                  style={{ width: 'auto', padding: '0 8px', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                  title="Admin Dashboard (Manage memories & letters)"
                  onClick={() => {
                    sound.playKeyClick();
                    onOpenAdmin();
                  }}
                >
                  {adminUser.username.toUpperCase()}
                </button>
                <button
                  className="nav-icon-toggle"
                  style={{
                    width: 'auto',
                    padding: '0 8px',
                    height: '26px',
                    color: 'var(--retro-faded-red)',
                    borderColor: 'var(--retro-faded-red)',
                    fontSize: '0.68rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Sign out of edit session"
                  onClick={() => {
                    sound.playKeyClick();
                    if (typeof onLogout === 'function') onLogout();
                  }}
                >
                  <span>SIGN OUT</span>
                </button>
              </div>
            ) : (
              <button
                className="nav-icon-toggle"
                style={{
                  width: 'auto',
                  padding: '0 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  letterSpacing: '0.5px'
                }}
                title="Private Admin Access"
                onClick={() => {
                  sound.playKeyClick();
                  onOpenAdmin();
                }}
              >
                <Lock size={12} />
                <span>ADMIN</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Main Navigation Links */}
        <nav className="nav-links-row" aria-label="Main Navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-link-btn ${activeTab === item.id && !isDesktopView ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import LoveLetters from './LoveLetters';
import { sound } from '../../utils/audioSynthesizer';
import { Sparkles, Calendar, MapPin, ExternalLink, Heart, Play, Pause, SkipBack, SkipForward, Upload, Music, Loader2, Volume2 } from 'lucide-react';

export default function RetroDesktop({
  memories,
  letters,
  futurePlans,
  onSelectMemory,
  musicPlayer
}) {
  const [openWindows, setOpenWindows] = useState({
    memories: false,
    photos: false,
    letters: true,
    future: false,
    favorites: false,
    music: false
  });

  const [activeWindow, setActiveWindow] = useState('letters');

  const toggleWindow = (name) => {
    sound.playTapeClick();
    setOpenWindows((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
    setActiveWindow(name);
  };

  const closeWindow = (name) => {
    sound.playKeyClick();
    setOpenWindows((prev) => ({
      ...prev,
      [name]: false
    }));
  };

  const desktopIcons = [
    { id: 'memories', label: 'OUR MEMORIES', icon: '📁' },
    { id: 'photos', label: 'PHOTOS', icon: '🖼️' },
    { id: 'letters', label: 'LOVE LETTERS', icon: '💌' },
    { id: 'future', label: 'FUTURE', icon: '🚀' },
    { id: 'favorites', label: 'FAVORITES', icon: '💾' },
    { id: 'music', label: 'OUR MUSIC', icon: '🎵' }
  ];

  return (
    <div className="retro-desktop-view">
      {/* Desktop Watermark */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          opacity: 0.12,
          userSelect: 'none'
        }}
      >
        <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '8rem', color: 'var(--retro-charcoal)' }}>
          S + S
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', letterSpacing: '4px' }}>
          SOK &amp; SAK OPERATING SYSTEM &bull; 2026
        </div>
      </div>

      {/* Desktop Grid of Icons */}
      <div className="desktop-icons-grid">
        {desktopIcons.map((icon) => (
          <div
            key={icon.id}
            className="desktop-icon-item"
            onDoubleClick={() => {
              if (icon.action) {
                icon.action();
              } else {
                toggleWindow(icon.id);
              }
            }}
            onClick={() => sound.playKeyClick()}
            title="Double-click to open folder"
          >
            <div className="desktop-icon-symbol">{icon.icon}</div>
            <div className="desktop-icon-label">{icon.label}</div>
          </div>
        ))}
      </div>

      {/* --- WINDOW 1: LOVE LETTERS --- */}
      <WindowFrame
        title="LOVE LETTERS &bull; C:\DIARY\LETTERS"
        icon="💌"
        isOpen={openWindows.letters}
        onClose={() => closeWindow('letters')}
        width="780px"
      >
        <LoveLetters letters={letters} />
      </WindowFrame>

      {/* --- WINDOW 2: OUR MEMORIES --- */}
      <WindowFrame
        title="OUR MEMORIES ARCHIVE &bull; C:\MEMORIES"
        icon="📁"
        isOpen={openWindows.memories}
        onClose={() => closeWindow('memories')}
        width="820px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {memories.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                sound.playShutterSound();
                onSelectMemory(m);
              }}
              style={{
                background: 'var(--retro-cream)',
                border: '1.5px solid var(--retro-charcoal)',
                borderRadius: '3px',
                padding: '10px',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              <img
                src={m.imageUrl}
                alt={m.title}
                style={{ width: '100%', height: '130px', objectFit: 'cover', borderRadius: '2px' }}
              />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, marginTop: '6px' }}>
                {m.title}
              </div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.9rem', color: 'var(--retro-brown)' }}>
                {m.displayDate} &bull; {m.location}
              </div>
            </div>
          ))}
        </div>
      </WindowFrame>

      {/* --- WINDOW 3: PHOTOS EXPLORER --- */}
      <WindowFrame
        title="PHOTO ROLL &bull; RAW 35MM NEGATIVES"
        icon="🖼️"
        isOpen={openWindows.photos}
        onClose={() => closeWindow('photos')}
        width="760px"
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {memories.map((m) => (
            <div
              key={m.id}
              onClick={() => {
                sound.playShutterSound();
                onSelectMemory(m);
              }}
              style={{
                position: 'relative',
                aspectRatio: '1 / 1',
                border: '2px solid var(--retro-charcoal)',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <img
                src={m.imageUrl}
                alt={m.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(28, 27, 26, 0.75)',
                  color: 'var(--retro-champagne)',
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '0.85rem',
                  padding: '2px 6px',
                  textAlign: 'center'
                }}
              >
                {m.displayDate}
              </div>
            </div>
          ))}
        </div>
      </WindowFrame>

      {/* --- WINDOW 4: FUTURE ROADMAP --- */}
      <WindowFrame
        title="OUR FUTURE ARCHIVE &bull; PROMISES &amp; DREAMS"
        icon="🚀"
        isOpen={openWindows.future}
        onClose={() => closeWindow('future')}
        width="720px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {futurePlans.map((plan) => (
            <div
              key={plan.id}
              style={{
                background: 'var(--retro-offwhite)',
                border: '1.5px solid var(--retro-border)',
                borderRadius: '4px',
                padding: '16px',
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  color: 'var(--retro-burgundy)',
                  minWidth: '70px'
                }}
              >
                {plan.year}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--retro-charcoal)' }}>
                    {plan.title}
                  </h4>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.65rem',
                      background: 'var(--retro-cream-dark)',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      border: '1px solid var(--retro-border)'
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.88rem', color: 'var(--retro-brown)', marginTop: '4px', lineHeight: 1.5 }}>
                  {plan.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </WindowFrame>

      {/* --- WINDOW 5: FAVORITES / FLOPPY --- */}
      <WindowFrame
        title="FAVORITE MEMORIES &bull; FLOPPY DISK A:"
        icon="💾"
        isOpen={openWindows.favorites}
        onClose={() => closeWindow('favorites')}
        width="680px"
      >
        <div style={{ padding: '8px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--retro-brown)', marginBottom: '14px' }}>
            [ 1.44 MB FLOPPY DISK INSERTED &bull; ENCRYPTED ROMANCE SECTOR ]
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {memories.filter((m) => m.isFavorite).map((fav) => (
              <div
                key={fav.id}
                onClick={() => {
                  sound.playShutterSound();
                  onSelectMemory(fav);
                }}
                style={{
                  background: 'var(--retro-cream)',
                  border: '1px solid var(--retro-border)',
                  padding: '10px 14px',
                  borderRadius: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Heart size={14} color="var(--retro-burgundy)" fill="var(--retro-burgundy)" />
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600 }}>
                    {fav.title}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.95rem', color: 'var(--retro-brown)' }}>
                  {fav.displayDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </WindowFrame>

      {/* --- WINDOW 6: MUSIC ARCHIVE --- */}
      <WindowFrame
        title="MUSIC ARCHIVE &bull; LOVE CASSETTE COLLECTION"
        icon="🎵"
        isOpen={openWindows.music}
        onClose={() => closeWindow('music')}
        width="760px"
      >
        <div style={{ padding: '8px' }}>
          {/* Top Folder Path Banner */}
          <div
            style={{
              background: '#1A1817',
              border: '1px solid var(--retro-border-dark)',
              padding: '10px 14px',
              borderRadius: '4px',
              marginBottom: '14px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--retro-champagne)', fontWeight: 700 }}>
                COLLECTION: S + S CASSETTE TAPES
              </div>
              <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.8rem', color: 'var(--retro-cream)', opacity: 0.85, marginTop: '2px' }}>
                Currently loaded: {musicPlayer?.tracks?.length || 0} romantic tapes
              </div>
            </div>

            {/* Direct Upload Button */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--retro-burgundy)',
                color: 'var(--retro-champagne)',
                padding: '6px 12px',
                borderRadius: '3px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: musicPlayer?.isUploading ? 'not-allowed' : 'pointer',
                border: '1px solid var(--retro-faded-red)'
              }}
            >
              {musicPlayer?.isUploading ? (
                <Loader2 size={13} style={{ animation: 'spinWheel 1s linear infinite' }} />
              ) : (
                <Upload size={13} />
              )}
              <span>{musicPlayer?.isUploading ? 'SAVING...' : '+ UPLOAD NEW SONG'}</span>
              <input
                type="file"
                accept="audio/mp3,audio/*"
                style={{ display: 'none' }}
                disabled={musicPlayer?.isUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && musicPlayer?.uploadSong) {
                    musicPlayer.uploadSong(file);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          {musicPlayer?.uploadNotice && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                color: 'var(--retro-burgundy)',
                background: 'var(--retro-champagne)',
                padding: '6px 12px',
                borderRadius: '3px',
                marginBottom: '10px',
                textAlign: 'center',
                fontWeight: 700
              }}
            >
              {musicPlayer.uploadNotice}
            </div>
          )}

          {/* Mini Jukebox Controller in Window */}
          <div
            style={{
              background: 'var(--retro-cream)',
              border: '1.5px solid var(--retro-charcoal)',
              padding: '12px 16px',
              borderRadius: '4px',
              marginBottom: '16px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-pixel)', fontSize: '0.85rem', color: 'var(--retro-faded-red)' }}>
                {musicPlayer?.isPlaying ? '● NOW PLAYING' : '■ PAUSED / READY'}
              </div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--retro-charcoal)' }}>
                {musicPlayer?.currentTrack?.title}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--retro-brown)' }}>
                {musicPlayer?.currentTrack?.artist} &bull; {musicPlayer?.currentTrack?.fileName}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="tape-btn"
                onClick={() => musicPlayer?.handlePrevTrack?.()}
                title="Previous Track"
              >
                <SkipBack size={14} />
              </button>

              <button
                type="button"
                className="tape-btn"
                onClick={() => musicPlayer?.togglePlay?.()}
                style={{
                  padding: '6px 14px',
                  background: musicPlayer?.isPlaying ? 'var(--retro-champagne)' : 'var(--retro-burgundy)',
                  color: musicPlayer?.isPlaying ? 'var(--retro-charcoal)' : 'var(--retro-champagne)',
                  fontWeight: 700
                }}
              >
                {musicPlayer?.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span style={{ marginLeft: '6px' }}>{musicPlayer?.isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                type="button"
                className="tape-btn"
                onClick={() => musicPlayer?.handleNextTrack?.()}
                title="Next Track"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>

          {/* Songs List Table */}
          <div style={{ maxHeight: '280px', overflowY: 'auto', border: '1px solid var(--retro-border)', borderRadius: '3px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'var(--retro-charcoal)', color: 'var(--retro-cream)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', width: '40px' }}>#</th>
                  <th style={{ padding: '8px 10px' }}>TRACK TITLE</th>
                  <th style={{ padding: '8px 10px' }}>ARTIST / TAPE</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {musicPlayer?.tracks?.map((track, idx) => {
                  const isActive = musicPlayer.currentTrackIndex === idx;
                  return (
                    <tr
                      key={track.id || idx}
                      style={{
                        background: isActive ? 'rgba(128, 0, 32, 0.1)' : idx % 2 === 0 ? 'var(--retro-offwhite)' : 'var(--retro-cream)',
                        borderBottom: '1px solid var(--retro-border)',
                        cursor: 'pointer'
                      }}
                      onClick={() => musicPlayer?.playTrackAtIndex?.(idx, true)}
                    >
                      <td style={{ padding: '8px 10px', fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--retro-burgundy)' : 'inherit' }}>
                        {isActive ? '▶' : `${idx + 1}`}
                      </td>
                      <td style={{ padding: '8px 10px', fontWeight: isActive ? 700 : 500 }}>
                        <div>{track.title}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--retro-brown)', opacity: 0.75, maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {track.fileName}
                        </div>
                      </td>
                      <td style={{ padding: '8px 10px', color: 'var(--retro-brown)' }}>
                        {track.artist}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="tape-btn"
                          style={{
                            fontSize: '0.65rem',
                            padding: '3px 8px',
                            background: isActive && musicPlayer.isPlaying ? 'var(--retro-champagne)' : 'var(--retro-cream)',
                            borderColor: isActive ? 'var(--retro-burgundy)' : 'var(--retro-border)'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isActive) {
                              musicPlayer.togglePlay();
                            } else {
                              musicPlayer.playTrackAtIndex(idx, true);
                            }
                          }}
                        >
                          {isActive && musicPlayer.isPlaying ? 'PAUSE' : 'SWITCH / PLAY'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </WindowFrame>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Upload, ListMusic, Loader2, Disc3 } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';

export default function CassettePlayer({ musicPlayer, isMuted }) {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const fileInputRef = useRef(null);

  const {
    audioRef,
    tracks,
    currentTrack,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMinimized,
    setIsMinimized,
    isUploading,
    uploadNotice,
    playTrackAtIndex,
    togglePlay,
    handleNextTrack,
    handlePrevTrack,
    handleVolumeChange,
    uploadSong
  } = musicPlayer;

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadSong(file);
      e.target.value = '';
    }
  };

  const formatTimer = (totalSecs) => {
    if (isNaN(totalSecs) || totalSecs < 0) return '00:00';
    const m = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const s = String(totalSecs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <aside
      className="cassette-player-widget"
      aria-label="Retro Cassette & MP3 Player"
      style={{
        transform: isMinimized ? 'translateY(calc(100% - 36px))' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        width: '320px'
      }}
    >
      {/* HTML5 Audio Player */}
      <audio ref={audioRef} preload="metadata" />

      {/* Hidden file input for uploading MP3 to D:\Downloads\love\mp3 */}
      <input
        type="file"
        ref={fileInputRef}
        accept="audio/mp3,audio/*"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      {/* Top Header / Minimizer Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--retro-charcoal)',
          cursor: 'pointer'
        }}
      >
        <span
          onClick={() => {
            sound.playKeyClick();
            setIsMinimized(!isMinimized);
          }}
          style={{ flex: 1 }}
          title="Romantic Tape Deck"
        >
          📼 OUR LOVE TAPES
        </span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              sound.playKeyClick();
              setShowPlaylist(!showPlaylist);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              color: 'var(--retro-burgundy)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
            title="Toggle Song List"
          >
            <ListMusic size={13} />
            <span>SONGS</span>
          </button>

          <span
            onClick={() => {
              sound.playKeyClick();
              setIsMinimized(!isMinimized);
            }}
          >
            {isMinimized ? '▲ EXPAND' : '▼ HIDE'}
          </span>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Cassette Tape Face */}
          <div className="cassette-body-vintage">
            <div className="cassette-label-tape">
              <div
                style={{
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: '0.9rem'
                }}
                title={currentTrack?.title}
              >
                {currentTrack?.title?.toUpperCase() || 'UNTITLED TAPE'}
              </div>
              <div style={{ fontSize: '0.72rem', opacity: 0.8, marginTop: '2px' }}>
                {currentTrack?.artist || 'Sak & Reaksa Archive'}
              </div>
            </div>

            {/* Twin Spinning Cassette Spools */}
            <div className="cassette-spools-row">
              <div className={`spool-wheel ${isPlaying ? 'spinning' : ''}`}>
                <div className="spool-center" />
              </div>

              {/* Tape viewing window */}
              <div
                style={{
                  width: '60px',
                  height: '18px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  borderRadius: '2px',
                  border: '1px solid rgba(229, 195, 136, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '10%',
                    right: '10%',
                    height: '3px',
                    background: 'var(--retro-faded-red)',
                    transform: 'translateY(-50%)'
                  }}
                />
              </div>

              <div className={`spool-wheel ${isPlaying ? 'spinning' : ''}`}>
                <div className="spool-center" />
              </div>
            </div>
          </div>

          {/* Retro Digital Timer & Track Number */}
          <div className="cassette-digital-display">
            <span>{isPlaying ? 'PLAY ▶' : 'STOP ■'}</span>
            <span>{formatTimer(currentTime)} / {formatTimer(duration)}</span>
            <span>[{currentTrackIndex + 1}/{tracks.length}]</span>
          </div>

          {/* Progress Track Line */}
          <div
            style={{
              width: '100%',
              height: '4px',
              background: 'var(--retro-border)',
              marginTop: '8px',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (currentTime / (duration || 255)) * 100)}%`,
                height: '100%',
                background: 'var(--retro-burgundy)',
                transition: 'width 0.4s linear'
              }}
            />
          </div>

          {/* Physical Controls: PREV, PLAY/PAUSE, NEXT */}
          <div className="cassette-controls-row">
            <button
              className="tape-btn"
              onClick={handlePrevTrack}
              title="Previous Song"
            >
              <SkipBack size={14} style={{ verticalAlign: 'middle' }} />
            </button>

            <button
              className="tape-btn"
              onClick={togglePlay}
              style={{
                flex: 2,
                background: isPlaying ? 'var(--retro-champagne)' : 'var(--retro-cream)',
                fontWeight: 700
              }}
            >
              {isPlaying ? <Pause size={14} style={{ verticalAlign: 'middle' }} /> : <Play size={14} style={{ verticalAlign: 'middle' }} />}
              <span style={{ marginLeft: '6px' }}>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              className="tape-btn"
              onClick={handleNextTrack}
              title="Next Song"
            >
              <SkipForward size={14} style={{ verticalAlign: 'middle' }} />
            </button>
          </div>

          {/* Upload Song & Playlist Toggle */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
            <button
              type="button"
              className="tape-btn"
              disabled={isUploading}
              onClick={() => {
                sound.playTapeClick();
                fileInputRef.current?.click();
              }}
              style={{
                fontSize: '0.66rem',
                padding: '5px 8px',
                background: 'var(--retro-burgundy)',
                color: 'var(--retro-champagne)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flex: 1
              }}
              title="Upload an MP3 song to the playlist"
            >
              {isUploading ? (
                <Loader2 size={12} style={{ animation: 'spinWheel 1s linear infinite' }} />
              ) : (
                <Upload size={12} />
              )}
              <span>{isUploading ? 'SAVING...' : '+ UPLOAD SONG'}</span>
            </button>

            <button
              type="button"
              className="tape-btn"
              onClick={() => {
                sound.playKeyClick();
                setShowPlaylist(!showPlaylist);
              }}
              style={{
                fontSize: '0.66rem',
                padding: '5px 8px',
                background: showPlaylist ? 'var(--retro-charcoal)' : 'var(--retro-cream)',
                color: showPlaylist ? '#FFF' : 'var(--retro-charcoal)'
              }}
            >
              SONGS ({tracks.length})
            </button>
          </div>

          {uploadNotice && (
            <div
              style={{
                marginTop: '6px',
                fontSize: '0.66rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--retro-burgundy)',
                textAlign: 'center',
                fontWeight: 600
              }}
            >
              {uploadNotice}
            </div>
          )}

          {/* Playlist Dropdown / Direct Song Switcher */}
          {showPlaylist && (
            <div
              style={{
                marginTop: '8px',
                background: '#1A1817',
                border: '1px solid var(--retro-border-dark)',
                borderRadius: '3px',
                padding: '6px',
                maxHeight: '160px',
                overflowY: 'auto'
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--retro-champagne)',
                  marginBottom: '6px',
                  borderBottom: '1px dashed #3D3935',
                  paddingBottom: '3px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>OUR LOVE PLAYLIST</span>
                <span>[{tracks.length}]</span>
              </div>

              {tracks.map((t, idx) => (
                <div
                  key={t.id || idx}
                  onClick={() => {
                    playTrackAtIndex(idx, true);
                    setShowPlaylist(false);
                  }}
                  style={{
                    padding: '5px 6px',
                    borderRadius: '2px',
                    background: currentTrackIndex === idx ? 'var(--retro-burgundy)' : 'transparent',
                    color: currentTrackIndex === idx ? '#FFF' : 'var(--retro-cream)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '210px'
                    }}
                    title={t.title}
                  >
                    {idx + 1}. {t.title}
                  </span>
                  {currentTrackIndex === idx && (
                    <span style={{ color: 'var(--retro-champagne)', fontSize: '0.7rem', fontWeight: 700 }}>
                      ▶ NOW
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Volume Slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
            <Volume2 size={13} color="var(--retro-charcoal)" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="tape-volume-slider"
              title="Music Volume"
            />
          </div>
        </>
      )}
    </aside>
  );
}

import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Terminal } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import { setAdminSession } from '../../utils/storage';
import { loginWithFirebase, ensureFirebaseAuth } from '../../utils/firebase';

export default function RetroLoginModal({ isOpen, onClose, onLoginSuccess, reasonText }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    sound.playTapeClick();
    setIsLoading(true);
    setErrorMsg('');

    const u = username.trim();
    const uLower = u.toLowerCase();
    const p = password.trim();

    // 1. Try Firebase Authentication
    try {
      const fbResult = await loginWithFirebase(u, p);
      if (fbResult.success) {
        const userObj = { username: u, role: 'FIREBASE_AUTHENTICATED_ADMIN', uid: fbResult.user.uid };
        setAdminSession(userObj);
        sound.playCrtToggle(true);
        setIsLoading(false);
        onLoginSuccess(userObj);
        return;
      }
    } catch (err) {
      console.warn('Firebase auth attempt notice:', err);
    }

    // 2. Immediate Local Passphrase fallback for the couple
    if (
      (uLower === 'admin' && (p === 'love2026' || p === 'viraksak' || p === 'chanreaksa')) ||
      (uLower === 'sak' && p === 'reaksa') ||
      (uLower === 'viraksak' && p === 'forever')
    ) {
      await ensureFirebaseAuth();
      const userObj = { username: u, role: 'ARCHIVE_CURATOR' };
      setAdminSession(userObj);
      sound.playCrtToggle(true);
      setIsLoading(false);
      onLoginSuccess(userObj);
    } else {
      setIsLoading(false);
      setErrorMsg('ACCESS DENIED: INVALID ARCHIVE PASSPHRASE');
      sound.playCrtToggle(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 960,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playKeyClick();
          onClose();
        }
      }}
    >
      <div
        className="os-window"
        style={{
          width: '100%',
          maxWidth: '420px',
          animation: 'windowPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Title Bar */}
        <div className="os-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} />
            <span>SECURITY PROMPT &bull; PORT 908</span>
          </div>
          <button
            className="os-control-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            title="Cancel"
          >
            <X size={12} />
          </button>
        </div>

        {/* Retro Terminal Login Box */}
        <div
          style={{
            background: 'var(--retro-charcoal)',
            color: 'var(--retro-champagne)',
            padding: '28px 24px',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🔒</div>
            <div
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.45rem',
                letterSpacing: '2px',
                color: 'var(--retro-cream)'
              }}
            >
              PRIVATE ARCHIVE
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '2px' }}>
              RESTRICTED ENTRY &bull; VIRAKSAK &amp; CHANREAKSA
            </div>
            {reasonText && (
              <div
                style={{
                  marginTop: '10px',
                  background: 'rgba(194, 83, 69, 0.25)',
                  border: '1px solid var(--retro-faded-red)',
                  color: 'var(--retro-champagne)',
                  padding: '6px 10px',
                  borderRadius: '2px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.5px'
                }}
              >
                🔒 {reasonText}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                  color: 'var(--retro-beige)'
                }}
              >
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={() => sound.playKeyClick()}
                placeholder="e.g. sak or admin"
                required
                autoFocus
                style={{
                  width: '100%',
                  background: '#0D0C0B',
                  border: '1.5px solid var(--retro-brown-light)',
                  color: '#FFF',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  marginBottom: '6px',
                  color: 'var(--retro-beige)'
                }}
              >
                PASSWORD / PASSPHRASE
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={() => sound.playKeyClick()}
                placeholder="********************"
                required
                style={{
                  width: '100%',
                  background: '#0D0C0B',
                  border: '1.5px solid var(--retro-brown-light)',
                  color: '#FFF',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  borderRadius: '2px',
                  outline: 'none'
                }}
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  color: 'var(--retro-faded-red)',
                  fontSize: '0.72rem',
                  background: 'rgba(194, 83, 69, 0.15)',
                  padding: '6px 10px',
                  borderRadius: '2px',
                  border: '1px solid var(--retro-faded-red)'
                }}
              >
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                marginTop: '10px',
                background: 'var(--retro-burgundy)',
                color: 'var(--retro-champagne)',
                border: '1.5px solid var(--retro-champagne)',
                padding: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.82rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                borderRadius: '2px',
                transition: 'all 0.15s ease'
              }}
            >
              {isLoading ? 'VERIFYING KEY...' : '[ ACCESS ARCHIVE ]'}
            </button>
          </form>


        </div>
      </div>
    </div>
  );
}

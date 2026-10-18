import React, { useEffect, useState } from 'react';
import { X, Heart, Sparkles, KeyRound } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import confetti from 'canvas-confetti';

export default function EasterEggsModal({
  isOpen,
  onClose,
  title,
  message,
  subtitle
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 13, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 980,
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
          maxWidth: '540px',
          animation: 'windowPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div className="os-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <KeyRound size={14} color="var(--retro-champagne)" />
            <span>ENCRYPTED MEMORY SECTOR &bull; UNLOCKED</span>
          </div>
          <button
            className="os-control-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
          >
            <X size={12} />
          </button>
        </div>

        <div
          style={{
            background: 'var(--retro-offwhite)',
            padding: '28px',
            position: 'relative',
            border: '1.5px solid var(--retro-border)'
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.1rem',
              color: 'var(--retro-burgundy)',
              background: 'var(--retro-cream-dark)',
              padding: '2px 10px',
              borderRadius: '2px',
              marginBottom: '14px'
            }}
          >
            <Sparkles size={14} />
            <span>SECRET EASTER EGG DISCOVERED</span>
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--retro-charcoal)',
              marginBottom: '6px'
            }}
          >
            {title || 'A Secret Note For Chanreaksa'}
          </h3>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: 'var(--retro-brown)',
              marginBottom: '18px'
            }}
          >
            {subtitle || 'Archived in heart memory: 09.08.2026 • Phnom Penh'}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-handwritten)',
              fontSize: '1.8rem',
              lineHeight: 1.4,
              color: 'var(--retro-burgundy)',
              background: 'var(--retro-cream)',
              padding: '18px',
              borderRadius: '4px',
              border: '1px dashed var(--retro-border)',
              boxShadow: 'inset 0 0 15px rgba(0,0,0,0.03)'
            }}
          >
            "{message || 'If you found this secret corner, it means you were curious enough to explore every inch of our story. Just like how I notice every little smile, every glance, and every kindness in you. Viraksak loves Chanreaksa, today and every tomorrow.'}"
          </div>

          <div style={{ textAlign: 'right', marginTop: '20px' }}>
            <button
              className="tape-btn"
              onClick={() => {
                sound.playTapeClick();
                confetti({
                  particleCount: 50,
                  spread: 60,
                  origin: { y: 0.6 }
                });
                onClose();
              }}
              style={{
                background: 'var(--retro-charcoal)',
                color: 'var(--retro-cream)',
                padding: '8px 18px',
                fontSize: '0.78rem'
              }}
            >
              KEEP IN MY HEART ♥
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

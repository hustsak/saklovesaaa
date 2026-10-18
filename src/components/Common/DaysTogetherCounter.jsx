import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { RELATIONSHIP_CONFIG, calculateDaysTogether } from '../../utils/dateUtils';
import { sound } from '../../utils/audioSynthesizer';

export default function DaysTogetherCounter({ className = '', style = {} }) {
  const [daysInfo, setDaysInfo] = useState(() => calculateDaysTogether(RELATIONSHIP_CONFIG.startDate));

  useEffect(() => {
    const update = () => {
      setDaysInfo(calculateDaysTogether(RELATIONSHIP_CONFIG.startDate, new Date()));
    };

    // Immediate calculation
    update();

    // Check periodically so when midnight passes and tomorrow starts, it automatically adds +1 day
    const interval = setInterval(update, 1000);

    // Refresh immediately when device wakes up or tab becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        update();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', update);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', update);
    };
  }, []);

  const handleClick = async () => {
    sound.playTapeClick();
    try {
      const { default: confetti } = await import('canvas-confetti');
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.55 },
        colors: ['#722F37', '#E5C388', '#B76E79', '#FFF8EB']
      });
    } catch (e) {
      console.warn('Confetti notice:', e);
    }
  };

  return (
    <div
      className={`days-together-counter-card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      title="Days Together • Click for celebration ✦"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 250, 240, 0.92)',
        backdropFilter: 'blur(8px)',
        border: '1.5px solid var(--retro-burgundy)',
        borderRadius: '6px',
        padding: '12px 28px',
        margin: '20px auto 14px auto',
        boxShadow: '0 6px 20px rgba(114, 47, 55, 0.14), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        userSelect: 'none',
        position: 'relative',
        zIndex: 15,
        maxWidth: '92%',
        ...style
      }}
    >
      {/* Tape decoration */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70px',
          height: '18px',
          background: 'rgba(235, 225, 205, 0.85)',
          border: '1px solid rgba(160, 140, 120, 0.35)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          clipPath: 'polygon(0 0, 100% 0, 96% 100%, 4% 100%)'
        }}
      />

      {/* Main Counter Label: only shows how long they have been together */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(1rem, 2.4vw, 1.35rem)',
          fontWeight: 700,
          color: 'var(--retro-burgundy)',
          letterSpacing: '1px'
        }}
      >
        <Heart
          size={20}
          color="var(--retro-burgundy)"
          fill="var(--retro-burgundy)"
          className="heart-pulse-icon"
        />
        <span>
          {daysInfo.isBefore
            ? 'Together Soon ❤️'
            : `Together for ${daysInfo.days.toLocaleString()} days ❤️`}
        </span>
      </div>
    </div>
  );
}

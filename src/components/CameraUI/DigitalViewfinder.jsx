import React, { useState, useEffect } from 'react';
import { BatteryMedium } from 'lucide-react';

export default function DigitalViewfinder({ currentMemory }) {
  const [timeStr, setTimeStr] = useState('14:32');
  const [seconds, setSeconds] = useState(24);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
      setSeconds(now.getSeconds());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="camera-hud-frame" aria-hidden="true">
      {/* Corner Bracket Reticles */}
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Center Focus Crosshair */}
      <div className="hud-crosshair" />

      {/* Top Viewfinder Status Bar */}
      <div
        className="hud-top-osd"
        style={{
          position: 'absolute',
          top: '64px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-pixel)',
          fontSize: '1.15rem',
          color: 'var(--retro-charcoal)',
          opacity: 0.82
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--retro-faded-red)', fontWeight: 700 }}>REC ●</span>
          <span>[RAW+F]</span>
          <span style={{ fontSize: '0.95rem' }}>24 FPS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{timeStr}:{String(seconds).padStart(2, '0')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <BatteryMedium size={20} />
            <span style={{ fontSize: '0.9rem' }}>88%</span>
          </div>
        </div>
      </div>

      {/* Bottom Viewfinder Info */}
      <div className="hud-bottom-bar">
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>{currentMemory ? currentMemory.displayDate : '2026/09/08'}</span>
          <span>{currentMemory ? currentMemory.location : 'LOVE JOURNEY • PHNOM PENH'}</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span>ISO 200</span>
          <span>F/2.8</span>
          <span>1/250s</span>
          <span>WB AUTO</span>
        </div>
      </div>
    </div>
  );
}

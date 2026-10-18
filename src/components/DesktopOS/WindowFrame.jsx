import React, { useState } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';

export default function WindowFrame({
  title,
  icon,
  isOpen,
  onClose,
  initialPosition = { x: 40, y: 40 },
  children,
  width = '640px'
}) {
  if (!isOpen) return null;

  return (
    <div
      className="os-window"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: width,
        margin: '20px auto',
        zIndex: 50,
        animation: 'windowPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* OS Window Titlebar */}
      <div className="os-window-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
        <div className="os-window-controls">
          <button
            className="os-control-btn"
            onClick={() => sound.playKeyClick()}
            title="Minimize"
          >
            <Minus size={11} />
          </button>
          <button
            className="os-control-btn"
            onClick={() => sound.playKeyClick()}
            title="Maximize"
          >
            <Square size={10} />
          </button>
          <button
            className="os-control-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            title="Close Window"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="os-window-body">
        {children}
      </div>
    </div>
  );
}

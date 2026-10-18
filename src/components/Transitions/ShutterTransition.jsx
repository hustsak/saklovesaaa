import React from 'react';

export default function ShutterTransition({ isShutterActive }) {
  return (
    <div className={`camera-shutter-container ${isShutterActive ? 'shutter-active' : ''}`}>
      <div className="shutter-blade shutter-blade-top" />
      <div className="shutter-blade shutter-blade-bottom" />
    </div>
  );
}

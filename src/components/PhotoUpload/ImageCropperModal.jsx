import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ZoomIn, RotateCw, Check, X, Crop, Move, Image as ImageIcon } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';

export default function ImageCropperModal({
  imageUrl,
  rawFile = null,
  isOpen,
  onCropComplete,
  onCancel
}) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState('original'); // 'original', 1, 0.75, 1.333, 1.777
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setNaturalSize({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 800
      });
    };
    img.src = imageUrl;

    // Reset adjustments when a new image is loaded
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
    setAspectRatio('original');
  }, [imageUrl]);

  if (!isOpen || !imageUrl) return null;

  // Mouse & Touch Drag Handlers
  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    e.stopPropagation();
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handlePointerUp = (e) => {
    if (e) e.stopPropagation();
    setIsDragging(false);
  };

  const handleRotate = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.playKeyClick();
    setRotation((prev) => (prev + 90) % 360);
  };

  // Keep original photo directly without crop or zoom-out
  const handleUseOriginal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.playTapeClick();
    onCropComplete({
      dataUrl: imageUrl,
      blob: rawFile || null,
      isOriginal: true
    });
  };

  const handleCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onCancel();
  };

  // Determine current active aspect ratio
  const imgRatio = naturalSize.width && naturalSize.height
    ? naturalSize.width / naturalSize.height
    : 1;

  const currentRatio = aspectRatio === 'original' ? imgRatio : Number(aspectRatio);

  // Maximum dimensions for viewfinder box
  const maxBoxW = 280;
  const maxBoxH = 280;
  let boxW = maxBoxW;
  let boxH = maxBoxH;

  if (currentRatio >= 1) {
    boxW = maxBoxW;
    boxH = Math.round(maxBoxW / currentRatio);
    if (boxH > maxBoxH) {
      boxH = maxBoxH;
      boxW = Math.round(maxBoxH * currentRatio);
    }
  } else {
    boxH = maxBoxH;
    boxW = Math.round(maxBoxH * currentRatio);
    if (boxW > maxBoxW) {
      boxW = maxBoxW;
      boxH = Math.round(maxBoxW / currentRatio);
    }
  }

  // Base scale to cover the viewfinder box
  const baseScale = naturalSize.width && naturalSize.height
    ? Math.max(boxW / naturalSize.width, boxH / naturalSize.height)
    : 1;

  const baseDisplayW = naturalSize.width ? Math.round(naturalSize.width * baseScale) : boxW;
  const baseDisplayH = naturalSize.height ? Math.round(naturalSize.height * baseScale) : boxH;

  // High quality canvas crop matching on-screen viewfinder 1:1
  const handleConfirmCrop = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    sound.playShutterSound();
    const img = imageRef.current;
    if (!img || !naturalSize.width || !naturalSize.height) return;

    // Determine target canvas resolution: keep max dimension close to original image resolution or at least 1200px
    const maxTargetDim = Math.min(2048, Math.max(naturalSize.width, naturalSize.height, 1200));
    const pixelRatio = maxTargetDim / Math.max(boxW, boxH);

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(boxW * pixelRatio);
    canvas.height = Math.round(boxH * pixelRatio);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const s = pixelRatio;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const drawW = baseDisplayW * zoom * s;
    const drawH = baseDisplayH * zoom * s;
    const drawX = -drawW / 2 + (offset.x * s);
    const drawY = -drawH / 2 + (offset.y * s);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    canvas.toBlob(
      (blob) => {
        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        onCropComplete({
          dataUrl: croppedDataUrl,
          blob: blob || new Blob([], { type: 'image/jpeg' }),
          isOriginal: false
        });
      },
      'image/jpeg',
      0.92
    );
  };

  const modalContent = (
    <div
      className="crop-modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div
        className="crop-modal-content"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1.5px solid var(--retro-charcoal)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--retro-cream-dark)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crop size={16} color="var(--retro-burgundy)" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700 }}>
              CROP &amp; FRAME PHOTOGRAPH
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--retro-charcoal)',
              padding: '4px'
            }}
            title="Cancel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Viewfinder Interactive Area */}
        <div
          ref={containerRef}
          className="crop-canvas-area"
          style={{
            height: '330px',
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {/* Viewfinder Aspect Ratio Frame */}
          <div
            style={{
              width: `${boxW}px`,
              height: `${boxH}px`,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 0 0 1000px rgba(10, 10, 10, 0.78)',
              borderRadius: '2px'
            }}
          >
            {/* The Image being transformed */}
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop target"
              draggable={false}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                maxWidth: 'none',
                maxHeight: 'none',
                width: `${baseDisplayW}px`,
                height: `${baseDisplayH}px`,
                transformOrigin: 'center center',
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.08s ease-out',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />

            {/* Rule of Thirds Reticle Overlay */}
            <div className="crop-grid-overlay">
              <div /><div /><div />
              <div /><div /><div />
              <div /><div /><div />
            </div>
          </div>

          {/* Drag instruction badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(28, 27, 26, 0.75)',
              color: 'var(--retro-champagne)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.68rem',
              padding: '3px 10px',
              borderRadius: '3px',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Move size={11} />
            <span>DRAG TO REPOSITION</span>
          </div>
        </div>

        {/* Crop Controls Bar */}
        <div style={{ padding: '12px 16px', background: 'var(--retro-cream)' }}>
          {/* Aspect Ratio Presets */}
          <div style={{ display: 'flex', gap: '5px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--retro-brown)', minWidth: '45px' }}>
              RATIO:
            </span>
            {[
              { label: 'ORIGINAL', val: 'original' },
              { label: '1:1 SQUARE', val: 1 },
              { label: '3:4 PORTRAIT', val: 0.75 },
              { label: '4:3 LANDSCAPE', val: 1.333 },
              { label: '16:9 WIDE', val: 1.777 }
            ].map((r) => (
              <button
                key={r.label}
                type="button"
                className="tape-btn"
                style={{
                  fontSize: '0.65rem',
                  padding: '4px 7px',
                  background: aspectRatio === r.val ? 'var(--retro-charcoal)' : 'var(--retro-offwhite)',
                  color: aspectRatio === r.val ? '#FFF' : 'var(--retro-charcoal)',
                  flex: 1,
                  whiteSpace: 'nowrap'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sound.playKeyClick();
                  setAspectRatio(r.val);
                  setOffset({ x: 0, y: 0 });
                }}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Zoom Slider & Rotate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ZoomIn size={14} color="var(--retro-charcoal)" />
            <input
              type="range"
              min="1"
              max="3"
              step="0.02"
              value={zoom}
              onChange={(e) => {
                e.stopPropagation();
                setZoom(parseFloat(e.target.value));
              }}
              style={{ flex: 1, accentColor: 'var(--retro-burgundy)', cursor: 'pointer' }}
              title="Zoom In / Out"
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', minWidth: '36px' }}>
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              className="tape-btn"
              onClick={handleRotate}
              style={{ fontSize: '0.7rem', padding: '4px 8px' }}
              title="Rotate 90 Degrees"
            >
              <RotateCw size={13} style={{ verticalAlign: 'middle' }} />
              <span style={{ marginLeft: '4px' }}>90°</span>
            </button>
          </div>

          {/* Confirm, Use Original, or Cancel Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="tape-btn"
              onClick={handleCancel}
              style={{
                fontSize: '0.72rem',
                padding: '9px 12px',
                background: 'var(--retro-cream-dark)',
                color: 'var(--retro-charcoal)'
              }}
              title="Cancel and discard changes"
            >
              <X size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
              CANCEL
            </button>

            <button
              type="button"
              className="tape-btn"
              onClick={handleUseOriginal}
              style={{
                flex: 1.2,
                fontSize: '0.75rem',
                padding: '9px 12px',
                background: 'var(--retro-charcoal)',
                color: 'var(--retro-champagne)',
                fontWeight: 700,
                border: '1.5px solid var(--retro-champagne)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Keep original photo without any cropping or zoom"
            >
              <Check size={15} color="var(--retro-champagne)" />
              <span>KEEP ORIGINAL (NO CROP)</span>
            </button>

            <button
              type="button"
              className="tape-btn"
              onClick={handleConfirmCrop}
              style={{
                flex: 1,
                fontSize: '0.75rem',
                padding: '9px 12px',
                background: 'var(--retro-burgundy)',
                color: 'var(--retro-champagne)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
              title="Crop to current viewfinder framing"
            >
              <Crop size={14} color="var(--retro-champagne)" />
              <span>CROP &amp; SAVE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

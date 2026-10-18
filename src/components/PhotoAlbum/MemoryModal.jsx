import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Camera, Edit3, Check, Save, Crop, Loader } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import ImageCropperModal from '../PhotoUpload/ImageCropperModal';
import { uploadImageWithFallback } from '../../utils/imageUploader';
import { formatReadableDate } from '../../utils/dateUtils';

export default function MemoryModal({
  memory,
  memories,
  onClose,
  onSelectMemory,
  onUpdateMemory,
  adminUser,
  onRequireAdminLogin
}) {
  const fileInputRef = useRef(null);
  const [rawCropImage, setRawCropImage] = useState(null);
  const [rawPhotoFile, setRawPhotoFile] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isReplacingPhoto, setIsReplacingPhoto] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(() => memory?.title || '');
  const [editDateISO, setEditDateISO] = useState(() => memory?.date || '2023-12-09');
  const [editDisplayDate, setEditDisplayDate] = useState(() => formatReadableDate(memory?.date || memory?.displayDate));
  const [editTime, setEditTime] = useState(() => memory?.time || '14:32');
  const [editLocation, setEditLocation] = useState(() => memory?.location || 'Phnom Penh');
  const [editHandwritten, setEditHandwritten] = useState(() => memory?.handwrittenNote || '');
  const [editJournal, setEditJournal] = useState(() => memory?.journalEntry || memory?.caption || '');

  useEffect(() => {
    if (memory) {
      setEditTitle(memory.title || '');
      setEditDateISO(memory.date || '2023-12-09');
      setEditDisplayDate(formatReadableDate(memory.date || memory.displayDate));
      setEditTime(memory.time || '14:32');
      setEditLocation(memory.location || 'Phnom Penh');
      setEditHandwritten(memory.handwrittenNote || '');
      setEditJournal(memory.journalEntry || memory.caption || '');
      setIsEditing(false);
    }
  }, [memory]);

  if (!memory) return null;

  const currentIndex = memories.findIndex((m) => m.id === memory.id);
  const prevMemory = memories[(currentIndex - 1 + memories.length) % memories.length];
  const nextMemory = memories[(currentIndex + 1) % memories.length];

  const handleNext = () => {
    sound.playShutterSound();
    setIsEditing(false);
    onSelectMemory(nextMemory);
  };

  const handlePrev = () => {
    sound.playShutterSound();
    setIsEditing(false);
    onSelectMemory(prevMemory);
  };

  const handleDateChange = (newIso) => {
    setEditDateISO(newIso);
    if (newIso) {
      setEditDisplayDate(formatReadableDate(newIso));
    }
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    sound.playTapeClick();

    const formattedNote = editHandwritten.trim()
      ? (editHandwritten.startsWith('“') ? editHandwritten : `“${editHandwritten}”`)
      : memory.handwrittenNote;

    const formattedDisplayDate = formatReadableDate(editDateISO || editDisplayDate);

    const updated = {
      ...memory,
      title: editTitle,
      date: editDateISO,
      displayDate: formattedDisplayDate,
      time: editTime,
      location: editLocation,
      handwrittenNote: formattedNote,
      journalEntry: editJournal,
      caption: editJournal
    };

    if (typeof onUpdateMemory === 'function') {
      onUpdateMemory(updated);
    }
    setIsEditing(false);
  };

  const handleTriggerPhotoReplace = () => {
    if (!adminUser) {
      sound.playKeyClick();
      if (typeof onRequireAdminLogin === 'function') {
        onRequireAdminLogin('ADMIN AUTHENTICATION REQUIRED TO REPLACE PHOTOGRAPHS');
      }
      return;
    }
    sound.playTapeClick();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    sound.playTapeClick();
    setRawPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawCropImage(event.target.result);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoCropDone = async (cropResult) => {
    setIsCropperOpen(false);
    setIsReplacingPhoto(true);
    try {
      const dataUrl = typeof cropResult === 'string' ? cropResult : cropResult?.dataUrl;
      const blob = cropResult?.blob || (cropResult?.isOriginal ? rawPhotoFile : null);

      let finalUrl = dataUrl;
      if (blob) {
        try {
          const file = blob instanceof File
            ? blob
            : new File([blob], `mem_${memory.id}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          finalUrl = await uploadImageWithFallback(file);
        } catch (uploadErr) {
          console.warn('Fallback direct dataUrl for memory image:', uploadErr);
          finalUrl = dataUrl;
        }
      }

      if (finalUrl) {
        const updated = { ...memory, imageUrl: finalUrl };
        if (typeof onUpdateMemory === 'function') {
          onUpdateMemory(updated);
        }
      }
    } catch (err) {
      console.error('Failed to replace memory photo:', err);
    } finally {
      setIsReplacingPhoto(false);
      setRawCropImage(null);
      setRawPhotoFile(null);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 13, 0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 950,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
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
          maxWidth: '940px',
          maxHeight: '92vh',
          animation: 'windowPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Retro Window Titlebar */}
        <div className="os-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={14} color="var(--retro-champagne)" />
            <span>DIGITAL VIEWFINDER &bull; {memory.title.toUpperCase()}</span>
          </div>
          <div className="os-window-controls">
            <button
              className="os-control-btn"
              onClick={() => {
                sound.playKeyClick();
                onClose();
              }}
              title="Close Viewfinder"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* Window Body: Split View (Camera Viewfinder + Handwritten Journal Page) */}
        <div
          className="os-window-body"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            background: 'var(--retro-cream)',
            padding: '24px'
          }}
        >
          {/* Left Column: Vintage Digital Camera Screen Frame */}
          <div
            style={{
              position: 'relative',
              background: '#0F0E0D',
              border: '3px solid #2B2825',
              borderRadius: '6px',
              padding: '12px',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.25)'
            }}
          >
            {/* Viewfinder OSD Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.05rem',
                color: '#FFF',
                marginBottom: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: 'var(--retro-faded-red)', fontWeight: 700 }}>REC ●</span>
                <span>{memory.time}</span>
              </div>
              <div>[RAW 24FPS]</div>
            </div>

            {/* Inner Photo with Viewfinder Crosshair */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3',
                overflow: 'hidden',
                borderRadius: '3px',
                border: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              <img
                src={memory.imageUrl}
                alt={memory.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'contrast(1.05) sepia(0.08)'
                }}
              />

              {/* Viewfinder Reticle */}
              <div
                style={{
                  position: 'absolute',
                  inset: '16px',
                  border: '1px dashed rgba(255, 255, 255, 0.4)',
                  pointerEvents: 'none'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.7)',
                  pointerEvents: 'none'
                }}
              />
            </div>

            {/* Viewfinder OSD Footer */}
            <div
              style={{
                marginTop: '10px',
                fontFamily: 'var(--font-pixel)',
                fontSize: '1.05rem',
                color: 'var(--retro-champagne)',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <div>{formatReadableDate(memory.date || memory.displayDate)}</div>
              <div>{memory.location}</div>
            </div>

            {/* Hidden Photo Replacement File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoFileChange}
            />

            {/* Replace / Crop Photo Button (Admin Only) */}
            {adminUser && (
              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleTriggerPhotoReplace}
                  disabled={isReplacingPhoto}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(229, 195, 136, 0.45)',
                    color: 'var(--retro-champagne)',
                    borderRadius: '3px',
                    padding: '6px 12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  title="Crop and replace this photograph"
                >
                  <Camera size={13} color="var(--retro-burgundy-light)" />
                  <span>{isReplacingPhoto ? 'SAVING NEW PHOTO...' : 'REPLACE / CROP PHOTO'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Physical Journal Page */}
          <div
            style={{
              background: 'var(--retro-offwhite)',
              border: '1px solid var(--retro-border)',
              padding: '24px',
              borderRadius: '4px',
              boxShadow: 'inset 0 0 30px rgba(221, 210, 193, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            {/* Quick Edit Toggle Button (Admin Only) */}
            {adminUser && (
              <button
                type="button"
                onClick={() => {
                  sound.playTapeClick();
                  setIsEditing(!isEditing);
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  border: '1.5px solid var(--retro-charcoal)',
                  background: isEditing ? 'var(--retro-charcoal)' : 'var(--retro-cream)',
                  color: isEditing ? '#FFF' : 'var(--retro-charcoal)',
                  padding: '4px 10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '1.5px 1.5px 0px var(--retro-charcoal)'
                }}
              >
                <Edit3 size={12} />
                <span>{isEditing ? 'CANCEL EDIT' : 'EDIT DATE / DETAILS'}</span>
              </button>
            )}

            {isEditing ? (
              /* Inline Edit Mode */
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '30px' }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                    TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                      <Calendar size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      DATE
                    </label>
                    <input
                      type="date"
                      required
                      value={editDateISO}
                      onChange={(e) => handleDateChange(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontSize: '0.82rem', background: '#FFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                      <Clock size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                      TIME
                    </label>
                    <input
                      type="time"
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontSize: '0.82rem', background: '#FFF' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                    <MapPin size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                    LOCATION
                  </label>
                  <input
                    type="text"
                    required
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Phnom Penh"
                    style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                    HANDWRITTEN NOTE
                  </label>
                  <input
                    type="text"
                    value={editHandwritten}
                    onChange={(e) => setEditHandwritten(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--retro-burgundy)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}>
                    JOURNAL ENTRY
                  </label>
                  <textarea
                    rows={3}
                    value={editJournal}
                    onChange={(e) => setEditJournal(e.target.value)}
                    style={{ width: '100%', padding: '6px 8px', marginTop: '2px', border: '1px solid var(--retro-border)', fontSize: '0.85rem' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    className="tape-btn"
                    onClick={() => setIsEditing(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="tape-btn"
                    style={{ background: 'var(--retro-burgundy)', color: '#FFF' }}
                  >
                    <Save size={13} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            ) : (
              /* Normal Viewing Mode */
              <div>
                {/* Timestamp Badges */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--retro-brown)',
                    marginBottom: '16px',
                    marginTop: '28px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatReadableDate(memory.date || memory.displayDate)}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} /> {memory.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} /> {memory.location}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    color: 'var(--retro-charcoal)',
                    marginBottom: '14px',
                    lineHeight: 1.25
                  }}
                >
                  {memory.title}
                </h3>

                {/* Handwritten Note Accent */}
                <div
                  style={{
                    fontFamily: 'var(--font-handwritten)',
                    fontSize: '1.85rem',
                    color: 'var(--retro-burgundy)',
                    marginBottom: '16px',
                    lineHeight: 1.2
                  }}
                >
                  {memory.handwrittenNote}
                </div>

                {/* Journal Body Narrative */}
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.02rem',
                    lineHeight: 1.7,
                    color: 'var(--retro-charcoal-light)',
                    fontStyle: 'italic',
                    borderLeft: '3px solid var(--retro-champagne)',
                    paddingLeft: '14px'
                  }}
                >
                  "{memory.journalEntry || memory.caption}"
                </div>
              </div>
            )}

            {/* Turn Page Controls */}
            {!isEditing && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '28px',
                  paddingTop: '16px',
                  borderTop: '1px dashed var(--retro-border)'
                }}
              >
                <button
                  className="nav-link-btn"
                  onClick={handlePrev}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ChevronLeft size={16} /> PREVIOUS
                </button>

                <div
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '1rem',
                    color: 'var(--retro-brown)'
                  }}
                >
                  {currentIndex + 1} / {memories.length}
                </div>

                <button
                  className="nav-link-btn"
                  onClick={handleNext}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  NEXT <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integrated Image Cropper for Memory Photo */}
      {isCropperOpen && rawCropImage && (
        <ImageCropperModal
          imageUrl={rawCropImage}
          rawFile={rawPhotoFile}
          isOpen={isCropperOpen}
          onCropComplete={handlePhotoCropDone}
          onCancel={() => {
            setIsCropperOpen(false);
            setRawCropImage(null);
            setRawPhotoFile(null);
          }}
        />
      )}
    </div>
  );
}

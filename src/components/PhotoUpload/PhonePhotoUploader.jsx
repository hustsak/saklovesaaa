import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Sparkles, MapPin, Calendar, Clock, Loader2, Tag, Crop } from 'lucide-react';
import { uploadImageWithFallback } from '../../utils/imageUploader';
import { sound } from '../../utils/audioSynthesizer';
import ImageCropperModal from './ImageCropperModal';
import confetti from 'canvas-confetti';

export default function PhonePhotoUploader({ isOpen, onClose, onSaveNewMemory, adminUser }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [rawSourceUrl, setRawSourceUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeveloping, setIsDeveloping] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Form Metadata
  const [title, setTitle] = useState('Afternoon in Phnom Penh');
  const [handwritten, setHandwritten] = useState('“captured on my phone.”');
  const [location, setLocation] = useState('Phnom Penh');
  const [category, setCategory] = useState('Ordinary Magic');

  // Date State with Native Picker + Display sync
  const [dateISO, setDateISO] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [displayDate, setDisplayDate] = useState(() => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${mm}.${dd}.${now.getFullYear()}`;
  });
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  if (!isOpen) return null;
  if (!adminUser) return null;

  const handleDateChange = (newIso) => {
    setDateISO(newIso);
    if (newIso) {
      const parts = newIso.split('-');
      if (parts.length === 3) {
        setDisplayDate(`${parts[1]}.${parts[2]}.${parts[0]}`);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playShutterSound();
    setIsProcessing(true);
    setUploadError('');
    setSelectedFile(file);

    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const url = evt.target.result;
        setRawSourceUrl(url);
        setPreviewUrl(url);
        setIsProcessing(false);
        setIsCropModalOpen(true); // Automatically open crop viewfinder
      };
      reader.onerror = () => {
        setUploadError('Could not read image file. Please try another.');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File load error:', err);
      setUploadError('Error loading file. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCropComplete = (cropResult) => {
    const dataUrl = typeof cropResult === 'string' ? cropResult : cropResult?.dataUrl;
    const blob = cropResult?.blob;
    const isOriginal = cropResult?.isOriginal;

    setPreviewUrl(dataUrl);
    setCroppedBlob(isOriginal ? null : blob);
    setIsCropModalOpen(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedFile && !previewUrl) return;

    sound.playShutterSound();
    setIsDeveloping(true);
    setUploadError('');

    try {
      let finalImageUrl = previewUrl;
      const fileToUpload = croppedBlob
        ? new File([croppedBlob], selectedFile?.name || 'photo.jpg', { type: 'image/jpeg' })
        : selectedFile;

      if (fileToUpload) {
        // Automatically compress to ~150KB and upload to cloud with timeout fallback
        finalImageUrl = await uploadImageWithFallback(fileToUpload);
      }

      const formattedNote = handwritten.trim()
        ? (handwritten.startsWith('“') ? handwritten : `“${handwritten}”`)
        : '“one of my favorite memories.”';

      const newMemory = {
        id: `mem-${Date.now()}`,
        title: title || 'New Memory',
        date: dateISO,
        displayDate: displayDate || '09.08.2026',
        time: time || '14:32',
        location: location || 'Phnom Penh',
        imageUrl: finalImageUrl,
        caption: handwritten || 'A lovely moment captured today.',
        journalEntry: handwritten || 'A lovely moment captured today.',
        handwrittenNote: formattedNote,
        category: category,
        isFavorite: true,
        cameraSettings: 'Phone 35mm Equivalent • Auto'
      };

      onSaveNewMemory(newMemory);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setIsDeveloping(false);
      onClose();
    } catch (err) {
      console.warn('Fallback save without cloud:', err);
      // Failsafe: Save immediately with previewUrl so user NEVER loses their memory
      const newMemory = {
        id: `mem-${Date.now()}`,
        title: title || 'New Memory',
        date: dateISO,
        displayDate: displayDate,
        time: time,
        location: location,
        imageUrl: previewUrl,
        caption: handwritten,
        journalEntry: handwritten,
        handwrittenNote: `“${handwritten}”`,
        category: category,
        isFavorite: true,
        cameraSettings: 'Phone 35mm Equivalent'
      };
      onSaveNewMemory(newMemory);
      setIsDeveloping(false);
      onClose();
    }
  };

  const locationPresets = ['Phnom Penh', 'Riverside', 'Street 240', 'Kampot', 'Siem Reap', 'Our Balcony'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 14, 13, 0.88)',
        backdropFilter: 'blur(8px)',
        zIndex: 965,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeveloping) {
          sound.playKeyClick();
          onClose();
        }
      }}
    >
      <div
        className="os-window"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '92vh',
          animation: 'windowPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title Bar */}
        <div className="os-window-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={14} color="var(--retro-champagne)" />
            <span>PHONE CAMERA &bull; SNAP / UPLOAD MEMORY</span>
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

        {/* Modal Body */}
        <div
          className="os-window-body"
          style={{
            background: 'var(--retro-cream)',
            padding: '22px',
            overflowY: 'auto'
          }}
        >
          {/* Native Mobile/Desktop File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {uploadError && (
            <div
              style={{
                background: 'rgba(194, 83, 69, 0.15)',
                color: 'var(--retro-faded-red)',
                border: '1px solid var(--retro-faded-red)',
                padding: '8px 12px',
                borderRadius: '3px',
                marginBottom: '14px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem'
              }}
            >
              {uploadError}
            </div>
          )}

          {!previewUrl ? (
            /* Upload Prompt Box */
            <div
              onClick={() => {
                sound.playTapeClick();
                fileInputRef.current?.click();
              }}
              style={{
                border: '2px dashed var(--retro-border-dark)',
                borderRadius: '6px',
                padding: '48px 20px',
                textAlign: 'center',
                background: 'var(--retro-offwhite)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.03)'
              }}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background: 'var(--retro-cream-dark)',
                  border: '1.5px solid var(--retro-charcoal)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: '2px 2px 0px var(--retro-charcoal)'
                }}
              >
                <Camera size={32} color="var(--retro-burgundy)" />
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.45rem',
                  color: 'var(--retro-charcoal)',
                  marginBottom: '6px'
                }}
              >
                Take a Photo or Select from Phone
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  color: 'var(--retro-brown)',
                  maxWidth: '420px',
                  margin: '0 auto',
                  lineHeight: 1.5
                }}
              >
                Tap here to open your phone camera or select a photo from your photo library.
              </p>

              <button
                type="button"
                className="tape-btn"
                style={{
                  marginTop: '20px',
                  background: 'var(--retro-burgundy)',
                  color: 'var(--retro-champagne)',
                  padding: '11px 24px',
                  fontSize: '0.82rem',
                  letterSpacing: '1px'
                }}
              >
                <Upload size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                CHOOSE PHOTO FROM PHONE
              </button>
            </div>
          ) : (
            /* Selected Photo Preview & Editable Fields */
            <form onSubmit={handleSave}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '22px',
                  alignItems: 'start'
                }}
              >
                {/* Polaroid Preview Card */}
                <div
                  className="polaroid-card"
                  style={{
                    maxWidth: '280px',
                    margin: '0 auto',
                    transform: 'rotate(-1.5deg)'
                  }}
                >
                  <div className="washi-tape" />
                  <div className="polaroid-photo-frame">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="polaroid-img"
                    />
                    {isDeveloping && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(28, 27, 26, 0.85)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--retro-champagne)',
                          fontFamily: 'var(--font-pixel)',
                          fontSize: '1.25rem',
                          textAlign: 'center',
                          padding: '12px'
                        }}
                      >
                        <Loader2 size={34} style={{ animation: 'spinWheel 1s linear infinite' }} />
                        <div style={{ marginTop: '12px' }}>DEVELOPING 35MM PRINT...</div>
                      </div>
                    )}
                  </div>
                  <div className="polaroid-handwriting" style={{ fontSize: '1.4rem' }}>
                    {handwritten || '“your smile here.”'}
                  </div>
                  <div className="polaroid-metadata">
                    <span>{displayDate}</span>
                    <span>{location}</span>
                  </div>

                  {/* Re-crop / Adjust framing button */}
                  <button
                    type="button"
                    className="tape-btn"
                    onClick={() => {
                      sound.playTapeClick();
                      setIsCropModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      marginTop: '10px',
                      fontSize: '0.72rem',
                      padding: '7px 10px',
                      background: 'var(--retro-cream-dark)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Crop size={13} color="var(--retro-burgundy)" />
                    <span>CROP / RE-FRAME PHOTO</span>
                  </button>
                </div>

                {/* Form Fields for Date, Time, Location & Caption */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                      MEMORY TITLE
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Afternoon with Reaksa"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        marginTop: '4px',
                        border: '1.5px solid var(--retro-charcoal)',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.88rem'
                      }}
                    />
                  </div>

                  {/* Date & Time Picker */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                        <Calendar size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        DATE (TAP TO CHANGE)
                      </label>
                      <input
                        type="date"
                        required
                        value={dateISO}
                        onChange={(e) => handleDateChange(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          marginTop: '4px',
                          border: '1.5px solid var(--retro-charcoal)',
                          borderRadius: '2px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          background: '#FFF'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                        <Clock size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                        TIME
                      </label>
                      <input
                        type="time"
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 8px',
                          marginTop: '4px',
                          border: '1.5px solid var(--retro-charcoal)',
                          borderRadius: '2px',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.82rem',
                          background: '#FFF'
                        }}
                      />
                    </div>
                  </div>

                  {/* Location & Quick Presets */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                      <MapPin size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      LOCATION
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Phnom Penh"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        marginTop: '4px',
                        border: '1.5px solid var(--retro-charcoal)',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.85rem'
                      }}
                    />
                    {/* Location quick chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {locationPresets.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.66rem',
                            padding: '2px 8px',
                            background: location === loc ? 'var(--retro-charcoal)' : 'var(--retro-cream-dark)',
                            color: location === loc ? '#FFF' : 'var(--retro-charcoal)',
                            border: '1px solid var(--retro-border)',
                            borderRadius: '2px',
                            cursor: 'pointer'
                          }}
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Handwritten Note */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                      HANDWRITTEN NOTE CAPTION
                    </label>
                    <input
                      type="text"
                      value={handwritten}
                      onChange={(e) => setHandwritten(e.target.value)}
                      placeholder="“one of my favorite memories.”"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        marginTop: '4px',
                        border: '1.5px solid var(--retro-charcoal)',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-handwritten)',
                        fontSize: '1.3rem',
                        color: 'var(--retro-burgundy)'
                      }}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>
                      <Tag size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      ALBUM CATEGORY
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '7px 8px',
                        marginTop: '4px',
                        border: '1.5px solid var(--retro-charcoal)',
                        borderRadius: '2px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8rem',
                        background: '#FFF'
                      }}
                    >
                      <option value="Celebrations">Celebrations</option>
                      <option value="Ordinary Magic">Ordinary Magic</option>
                      <option value="Firsts">Firsts</option>
                      <option value="Late Nights">Late Nights</option>
                      <option value="Getaways">Getaways</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                    <button
                      type="button"
                      className="tape-btn"
                      onClick={() => {
                        sound.playKeyClick();
                        setPreviewUrl('');
                        setSelectedFile(null);
                      }}
                    >
                      CHANGE PHOTO
                    </button>
                    <button
                      type="submit"
                      disabled={isDeveloping}
                      className="tape-btn"
                      style={{
                        background: 'var(--retro-burgundy)',
                        color: 'var(--retro-champagne)',
                        flex: 1,
                        padding: '10px'
                      }}
                    >
                      {isDeveloping ? 'DEVELOPING...' : 'DEVELOP & ARCHIVE ♥'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Interactive Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropModalOpen}
        imageUrl={rawSourceUrl || previewUrl}
        rawFile={selectedFile}
        onCropComplete={handleCropComplete}
        onCancel={() => setIsCropModalOpen(false)}
      />
    </div>
  );
}

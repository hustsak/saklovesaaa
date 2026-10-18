import React, { useState, useRef } from 'react';
import { useSiteText } from '../../context/SiteTextContext';
import { Camera, Crop, Sparkles, Loader } from 'lucide-react';
import ImageCropperModal from '../PhotoUpload/ImageCropperModal';
import { sound } from '../../utils/audioSynthesizer';
import { uploadImageWithFallback } from '../../utils/imageUploader';

export default function EditableImage({
  imageKey,
  defaultUrl,
  alt = 'Couple Photograph',
  className = '',
  style = {},
  containerStyle = {},
  aspectRatio = '3 / 4',
  onClick = null
}) {
  const { getImage, updateImage, adminUser, onRequestLogin } = useSiteText();
  const fileInputRef = useRef(null);

  const [rawImageForCrop, setRawImageForCrop] = useState(null);
  const [rawSelectedFile, setRawSelectedFile] = useState(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeImageUrl = getImage(imageKey, defaultUrl);

  const triggerUploadFlow = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isCropperOpen) return;

    // If user is not logged in as admin, trigger security login modal
    if (!adminUser) {
      sound.playKeyClick();
      if (typeof onRequestLogin === 'function') {
        onRequestLogin({ type: 'editImage', key: imageKey });
      }
      return;
    }

    // If user is logged in, open the device file picker!
    sound.playTapeClick();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleContainerClick = (e) => {
    if (isCropperOpen) return;
    if (e?.target?.closest('.crop-modal-overlay') || e?.target?.closest('.crop-modal-content')) return;

    // If clicking camera button, it already handles it
    if (e?.target?.closest('.editable-image-badge')) {
      return;
    }

    // If admin is logged in, clicking the image triggers photo replacement!
    if (adminUser) {
      triggerUploadFlow(e);
      return;
    }

    // If custom onClick was provided (e.g. open viewfinder modal)
    if (typeof onClick === 'function') {
      onClick(e);
    } else {
      // Otherwise prompt login
      triggerUploadFlow(e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playTapeClick();
    setRawSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRawImageForCrop(event.target.result);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (cropResult) => {
    setIsCropperOpen(false);
    setIsProcessing(true);

    try {
      // Extract dataUrl and blob safely from cropResult object
      const dataUrl = typeof cropResult === 'string' ? cropResult : cropResult?.dataUrl;
      const blob = cropResult?.blob || (cropResult?.isOriginal ? rawSelectedFile : null);

      let finalUrl = dataUrl;

      if (blob) {
        try {
          const fileToUpload = blob instanceof File
            ? blob
            : new File([blob], `photo_${imageKey}_${Date.now()}.jpg`, { type: 'image/jpeg' });
          finalUrl = await uploadImageWithFallback(fileToUpload);
        } catch (uploadErr) {
          console.warn('Cloud upload notice, using local dataUrl:', uploadErr);
          finalUrl = dataUrl;
        }
      }

      if (finalUrl) {
        updateImage(imageKey, finalUrl);
      }
    } catch (err) {
      console.error('Failed to process cropped image:', err);
    } finally {
      setIsProcessing(false);
      setRawImageForCrop(null);
      setRawSelectedFile(null);
    }
  };

  // When not logged in as admin, render pure clean image without any edit badges or inputs
  if (!adminUser) {
    return (
      <div
        className={`editable-image-container ${className}`}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'hidden',
          cursor: typeof onClick === 'function' ? 'pointer' : 'default',
          ...containerStyle
        }}
        onClick={typeof onClick === 'function' ? onClick : undefined}
      >
        <img
          src={activeImageUrl}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease, filter 0.3s ease',
            ...style
          }}
        />
      </div>
    );
  }

  // When logged in as admin, enable photo replacement and editing
  return (
    <>
      <div
        className="editable-image-container is-admin"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          display: 'block',
          overflow: 'hidden',
          cursor: 'pointer',
          ...containerStyle
        }}
        onClick={handleContainerClick}
        title="Click to replace / crop photo"
      >
        {/* Hidden Native File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onClick={(e) => e.stopPropagation()}
          onChange={handleFileChange}
        />

        {/* Rendered Photograph */}
        <img
          src={activeImageUrl}
          alt={alt}
          className={className}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease, filter 0.3s ease',
            ...style
          }}
        />

        {/* Camera Replace Button / Badge */}
        <button
          type="button"
          className={`editable-image-badge ${adminUser ? 'always-visible' : ''}`}
          onClick={triggerUploadFlow}
          style={{
            position: 'absolute',
            bottom: '8px',
            right: '8px',
            background: 'rgba(28, 27, 26, 0.92)',
            border: '1.5px solid var(--retro-champagne)',
            color: 'var(--retro-champagne)',
            borderRadius: '4px',
            padding: '4px 9px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.5px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            zIndex: 15,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.2s ease',
            opacity: adminUser ? 0.95 : 0.75
          }}
          title={adminUser ? "Replace photograph" : "Admin login required to replace photograph"}
        >
          <Camera size={13} color="var(--retro-champagne)" />
          <span>{adminUser ? 'REPLACE' : 'EDIT PHOTO'}</span>
        </button>

        {/* Loading Spinner Overlay while processing */}
        {isProcessing && (
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
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              gap: '8px',
              zIndex: 25
            }}
          >
            <Loader size={22} className="animate-spin" color="var(--retro-champagne)" />
            <span>SAVING PHOTO...</span>
          </div>
        )}
      </div>

      {/* Image Cropper Modal rendered outside the container to completely isolate events */}
      {isCropperOpen && rawImageForCrop && (
        <ImageCropperModal
          imageUrl={rawImageForCrop}
          rawFile={rawSelectedFile}
          isOpen={isCropperOpen}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setIsCropperOpen(false);
            setRawImageForCrop(null);
            setRawSelectedFile(null);
          }}
        />
      )}
    </>
  );
}

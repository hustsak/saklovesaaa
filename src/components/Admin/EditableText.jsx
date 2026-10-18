import React, { useState, useRef, useEffect } from 'react';
import { useSiteText } from '../../context/SiteTextContext';
import { Edit3, Check, X } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';

export default function EditableText({
  textKey,
  defaultText = '',
  as: Component = 'span',
  multiline = false,
  style = {},
  className = '',
  placeholder = 'Click to edit text...'
}) {
  const { getText, updateText, adminUser, editingKey, setEditingKey, onRequestLogin } = useSiteText();
  const currentText = getText(textKey, defaultText);

  const isCurrentEditing = Boolean(adminUser) && editingKey === textKey;
  const [draftValue, setDraftValue] = useState(currentText);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraftValue(currentText);
  }, [currentText]);

  useEffect(() => {
    if (isCurrentEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCurrentEditing]);

  const handleStartEdit = (e) => {
    e.stopPropagation();
    sound.playKeyClick();

    // If user is not authenticated as admin, prompt login modal
    if (!adminUser) {
      if (typeof onRequestLogin === 'function') {
        onRequestLogin(textKey);
      }
      return;
    }

    // If authenticated, enter inline edit
    setDraftValue(currentText);
    setEditingKey(textKey);
  };

  const handleSave = (e) => {
    if (e) e.stopPropagation();
    if (draftValue.trim() !== '') {
      updateText(textKey, draftValue.trim());
    }
    setEditingKey(null);
  };

  const handleCancel = (e) => {
    if (e) e.stopPropagation();
    sound.playTapeClick();
    setDraftValue(currentText);
    setEditingKey(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // If in active inline editing state
  if (isCurrentEditing) {
    return (
      <span
        style={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          verticalAlign: 'middle',
          margin: '0 4px',
          zIndex: 60
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {multiline ? (
          <textarea
            ref={inputRef}
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            style={{
              fontFamily: style.fontFamily || 'inherit',
              fontSize: style.fontSize || '1rem',
              fontWeight: style.fontWeight || 'inherit',
              color: 'var(--retro-charcoal)',
              background: '#FFF8EB',
              border: '2px solid var(--retro-burgundy)',
              borderRadius: '4px',
              padding: '6px 10px',
              minWidth: '220px',
              maxWidth: '90vw',
              outline: 'none',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              ...style
            }}
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={draftValue}
            onChange={(e) => setDraftValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              fontFamily: style.fontFamily || 'inherit',
              fontSize: style.fontSize || 'inherit',
              fontWeight: style.fontWeight || 'inherit',
              letterSpacing: style.letterSpacing || 'inherit',
              color: style.color || 'var(--retro-charcoal)',
              background: 'rgba(255, 248, 235, 0.98)',
              border: '2px solid var(--retro-burgundy)',
              borderRadius: '4px',
              padding: '2px 8px',
              textAlign: 'center',
              minWidth: '120px',
              maxWidth: '90vw',
              outline: 'none',
              boxShadow: '0 4px 20px rgba(139, 44, 44, 0.25)',
              ...style
            }}
          />
        )}

        {/* Floating Save / Cancel Controls */}
        <span
          style={{
            position: 'absolute',
            bottom: '-34px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--retro-charcoal)',
            border: '1px solid var(--retro-border-dark)',
            borderRadius: '4px',
            padding: '2px 6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 70
          }}
        >
          <button
            type="button"
            onClick={handleSave}
            title="Save text (Enter)"
            style={{
              background: 'var(--retro-burgundy)',
              color: '#FFF',
              border: 'none',
              borderRadius: '3px',
              padding: '3px 8px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px'
            }}
          >
            <Check size={12} /> SAVE
          </button>
          <button
            type="button"
            onClick={handleCancel}
            title="Cancel (Esc)"
            style={{
              background: 'transparent',
              color: 'var(--retro-champagne)',
              border: 'none',
              borderRadius: '3px',
              padding: '3px 6px',
              fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            <X size={12} />
          </button>
        </span>
      </span>
    );
  }

  // When not logged in as admin, render pure clean text with zero edit artifacts
  if (!adminUser) {
    return (
      <Component className={className} style={style}>
        {currentText || placeholder}
      </Component>
    );
  }

  // When logged in as admin, enable inline editing
  return (
    <Component
      onClick={handleStartEdit}
      className={`admin-editable-text is-logged-in ${className}`}
      style={{
        ...style,
        cursor: 'pointer'
      }}
      title="Click to edit text"
    >
      {currentText || placeholder}
    </Component>
  );
}

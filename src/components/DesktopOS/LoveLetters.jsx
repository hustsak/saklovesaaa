import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Mail, Heart } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';
import './LoveLetters.css';

export default function LoveLetters({ letters }) {
  // If user hasn't selected a letter yet, show the 4 envelopes waiting to be opened
  const [selectedLetter, setSelectedLetter] = useState(null);

  const currentIndex = letters && selectedLetter
    ? letters.findIndex((l) => l.id === selectedLetter.id)
    : -1;

  const handleOpenLetter = (letter) => {
    sound.playTapeClick();
    setSelectedLetter(letter);
  };

  const handleFoldLetter = () => {
    sound.playTapeClick();
    setSelectedLetter(null);
  };

  const handleNavigate = (newIndex) => {
    if (letters && letters[newIndex]) {
      sound.playTapeClick();
      setSelectedLetter(letters[newIndex]);
    }
  };

  return (
    <div className="love-letters-wrapper">
      {/* ===================================================================
          1. ENVELOPE SELECTION VIEW (When no letter is currently unfolded)
          =================================================================== */}
      {!selectedLetter && (
        <div className="envelopes-showcase" role="region" aria-label="Love letter envelopes">
          {letters && letters.map((letter, idx) => (
            <button
              key={letter.id}
              onClick={() => handleOpenLetter(letter)}
              className="physical-envelope"
              aria-label={`Open letter ${idx + 1}: ${letter.title}`}
            >
              {/* Postage Stamp */}
              <div className="envelope-postage-stamp" aria-hidden="true">
                💌
              </div>

              {/* Envelope Letter Sequence */}
              <div style={{ position: 'absolute', top: '14px', left: '16px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '1.5px',
                    color: '#682A36',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: 'rgba(104, 42, 54, 0.08)',
                    padding: '2px 8px',
                    borderRadius: '3px'
                  }}
                >
                  Letter 0{idx + 1}
                </span>
              </div>

              {/* Handwritten Title on Envelope (Only Open when...) */}
              <div style={{ margin: 'auto 0', textAlign: 'center', width: '100%' }}>
                <h3 className="envelope-handwritten-label">
                  {letter.title}
                </h3>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ===================================================================
          2. UNFOLDED KEEPSAKE LETTER PAPER (When a letter is opened)
          =================================================================== */}
      {selectedLetter && (
        <article className="keepsake-letter-paper" role="article" aria-label={selectedLetter.title}>
          {/* Top Bar: Discreet Back Control + Letter Index + Wax Seal */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              borderBottom: '1px dashed rgba(188, 168, 145, 0.5)',
              paddingBottom: '16px',
              marginBottom: '28px'
            }}
          >
            {/* Discreet Back Button */}
            <button
              onClick={handleFoldLetter}
              className="keepsake-back-btn"
              title="Fold this letter and return to envelope selection"
            >
              <ArrowLeft size={13} />
              <span>← Fold &amp; Return to Envelopes</span>
            </button>

            {/* Letter Sequence Counter & Wax Seal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.72rem',
                  letterSpacing: '1px',
                  color: '#682A36',
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                {currentIndex >= 0 ? `Letter ${currentIndex + 1} of ${letters.length}` : ''}
              </span>

              {/* Burgundy Embossed Wax Seal */}
              <div className="keepsake-wax-seal" title="Sealed with love: S♥S">
                S♥S
              </div>
            </div>
          </div>

          {/* Letter Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '1.4rem' }}>💌</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                letterSpacing: '2px',
                color: '#682A36',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              CONFIDENTIAL &bull; FOR CHANREAKSA’S EYES ONLY
            </span>
          </div>

          <h2 className="keepsake-letter-title">
            <EditableText
              textKey={`letter_${selectedLetter.id}_title`}
              defaultText={selectedLetter.title}
              as="span"
            />
          </h2>

          {/* Letter Body in Pure Natural Handwriting */}
          <div className="keepsake-letter-body">
            <EditableText
              textKey={`letter_${selectedLetter.id}_content`}
              defaultText={selectedLetter.content}
              as="div"
              multiline={true}
            />
          </div>

          {/* Signature & Date Section */}
          <div className="keepsake-signature-section">
            <div className="keepsake-signature-text">
              {selectedLetter.signature || 'S♥S'}
              <span style={{ fontSize: '1.4rem', color: '#682A36' }}>♡</span>
            </div>

            <div className="keepsake-letter-date">
              {selectedLetter.date || 'Written on a rainy evening, while thinking about you.'}
            </div>
          </div>

          {/* Bottom Action Bar: Fold Control + Prev/Next Navigation */}
          <div className="keepsake-action-bar">
            <button
              onClick={handleFoldLetter}
              className="keepsake-back-btn"
              title="Fold letter and put it back in memory box"
            >
              <span>✉ Fold letter &amp; put away</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentIndex > 0 && (
                <button
                  onClick={() => handleNavigate(currentIndex - 1)}
                  className="keepsake-nav-btn"
                  title="Read previous letter"
                >
                  <ChevronLeft size={13} />
                  <span>Previous</span>
                </button>
              )}

              {currentIndex < (letters ? letters.length - 1 : 0) && (
                <button
                  onClick={() => handleNavigate(currentIndex + 1)}
                  className="keepsake-nav-btn primary"
                  title="Read next letter"
                >
                  <span>Next Letter ♡</span>
                  <ChevronRight size={13} />
                </button>
              )}
            </div>
          </div>
        </article>
      )}
    </div>
  );
}

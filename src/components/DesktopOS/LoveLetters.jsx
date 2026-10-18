import React, { useState } from 'react';
import { Mail, Heart, Calendar, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';

export default function LoveLetters({ letters }) {
  const [selectedLetter, setSelectedLetter] = useState(letters[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Letter List View / Envelopes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}
      >
        {letters.map((letter) => {
          const isSelected = selectedLetter?.id === letter.id;
          return (
            <button
              key={letter.id}
              onClick={() => {
                sound.playTapeClick();
                setSelectedLetter(letter);
              }}
              style={{
                background: isSelected ? 'var(--retro-champagne-light)' : 'var(--retro-cream)',
                border: isSelected ? '2px solid var(--retro-burgundy)' : '1.5px solid var(--retro-charcoal)',
                borderRadius: '4px',
                padding: '12px',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: isSelected ? '2px 2px 0px var(--retro-burgundy)' : '1px 1px 0px var(--retro-charcoal)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '1.4rem' }}>💌</div>
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--retro-charcoal)'
                  }}
                >
                  {letter.title}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.68rem',
                    color: 'var(--retro-brown)',
                    marginTop: '2px'
                  }}
                >
                  {letter.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Letter Content Reader */}
      {selectedLetter && (
        <div
          style={{
            background: 'var(--retro-offwhite)',
            border: '1.5px solid var(--retro-border)',
            borderRadius: '4px',
            padding: '24px',
            position: 'relative',
            boxShadow: 'inset 0 0 25px rgba(221, 210, 193, 0.45)',
            marginTop: '8px'
          }}
        >
          {/* Wax Seal Stamp */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'var(--retro-burgundy)',
              color: 'var(--retro-champagne)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-pixel)',
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0 3px 6px rgba(104, 42, 54, 0.35)',
              transform: 'rotate(-8deg)'
            }}
            title="Sealed with love"
          >
            S♥S
          </div>

          <div
            style={{
              fontFamily: 'var(--font-pixel)',
              fontSize: '1rem',
              color: 'var(--retro-brown)',
              marginBottom: '6px'
            }}
          >
            [ DATE: {selectedLetter.date || 'Timeless'} ]
          </div>

          <h3
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.6rem',
              color: 'var(--retro-charcoal)',
              marginBottom: '16px'
            }}
          >
            <EditableText
              textKey={`letter_${selectedLetter.id}_title`}
              defaultText={selectedLetter.title}
              as="span"
            />
          </h3>

          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.05rem',
              lineHeight: 1.8,
              color: 'var(--retro-charcoal-light)',
              whiteSpace: 'pre-line',
              fontStyle: 'italic'
            }}
          >
            <EditableText
              textKey={`letter_${selectedLetter.id}_content`}
              defaultText={selectedLetter.content}
              as="div"
              multiline={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

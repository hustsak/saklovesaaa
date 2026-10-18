import React, { useState } from 'react';
import { MapPin, Clock, Calendar, Heart, ZoomIn, Sparkles } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';

export default function PolaroidAlbum({ memories, onSelectMemory, onOpenUpload }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Firsts', 'Ordinary Magic', 'Late Nights', 'Getaways', 'Celebrations'];

  const filteredMemories = activeCategory === 'All'
    ? memories
    : memories.filter((m) => m.category === activeCategory);

  // Subtle natural tilt angles for authentic physical polaroid scatter
  const rotations = [-2.5, 1.8, -1.2, 3.1, -2.8, 1.5, -1.9, 2.4];

  return (
    <section className="album-section-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
      {/* Editorial Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '2px',
            color: 'var(--retro-burgundy)',
            background: 'var(--retro-cream-dark)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: '1px solid var(--retro-border)',
            marginBottom: '12px'
          }}
        >
          <Sparkles size={13} />
          <span>TIME-STAMPED PHOTOGRAPHS &bull; 35MM ARCHIVE</span>
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            fontWeight: 600,
            color: 'var(--retro-charcoal)',
            letterSpacing: '-0.5px'
          }}
        >
          <EditableText
            textKey="album_title"
            defaultText="The Living Album of Sak & Reaksa"
            as="span"
          />
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--retro-brown)',
            maxWidth: '560px',
            margin: '10px auto 0 auto',
            lineHeight: 1.6
          }}
        >
          <EditableText
            textKey="album_subtitle"
            defaultText="Preserved moments captured in Phnom Penh and beyond. Click any photograph to step inside the viewfinder."
            as="span"
          />
        </p>

        {/* Filter Badges */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '22px'
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                sound.playKeyClick();
                setActiveCategory(cat);
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '3px',
                border: '1.5px solid var(--retro-charcoal)',
                background: activeCategory === cat ? 'var(--retro-charcoal)' : 'var(--retro-cream)',
                color: activeCategory === cat ? 'var(--retro-cream)' : 'var(--retro-charcoal)',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}

          {onOpenUpload && (
            <button
              onClick={() => {
                sound.playTapeClick();
                onOpenUpload();
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: '3px',
                border: '1.5px solid var(--retro-burgundy)',
                background: 'var(--retro-burgundy)',
                color: 'var(--retro-champagne)',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
              title="Upload New Photograph"
            >
              <span>+ UPLOAD PHOTO</span>
            </button>
          )}
        </div>
      </div>

      {/* Polaroid Grid Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '38px 28px',
          paddingBottom: '60px'
        }}
      >
        {filteredMemories.map((mem, index) => {
          const tilt = rotations[index % rotations.length];

          return (
            <div
              key={mem.id}
              className="polaroid-card"
              style={{
                transform: `rotate(${tilt}deg)`
              }}
              onClick={() => {
                sound.playShutterSound();
                onSelectMemory(mem);
              }}
            >
              {/* Paper Washi Tape Detail */}
              <div className="washi-tape" />

              {/* Photo Frame */}
              <div className="polaroid-photo-frame">
                <img
                  src={mem.imageUrl}
                  alt={mem.title}
                  className="polaroid-img"
                  loading="lazy"
                />

                {/* Subtle Hover Lens Badge */}
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(28, 27, 26, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: 'var(--retro-champagne)',
                    borderRadius: '50%',
                    padding: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.85
                  }}
                  title="Examine in Camera Viewfinder"
                >
                  <ZoomIn size={14} />
                </div>
              </div>

              {/* Handwritten Note Accent */}
              <div className="polaroid-handwriting">
                {mem.handwrittenNote}
              </div>

              {/* Memory Title & Location Metadata */}
              <div
                style={{
                  marginTop: '10px',
                  borderTop: '1px dashed var(--retro-border)',
                  paddingTop: '8px'
                }}
              >
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 600,
                    fontSize: '1.05rem',
                    color: 'var(--retro-charcoal)'
                  }}
                >
                  {mem.title}
                </div>

                <div className="polaroid-metadata">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {mem.displayDate}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={12} />
                    {mem.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

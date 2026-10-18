import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';
import EditableImage from '../Admin/EditableImage';

const FLOATING_STORY_PHOTOS = [
  {
    id: "story-1",
    chapter: "CHAPTER I",
    title: "Sisowath Quay",
    displayDate: "April 12, 2024",
    location: "Phnom Penh, Cambodia",
    caption: "The second the world stood still",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-1",
    width: "340px",
    aspectRatio: "4 / 3"
  },
  {
    id: "story-2",
    chapter: "CHAPTER II",
    title: "Monsoon & Coffee",
    displayDate: "July 28, 2024",
    location: "Street 240, Phnom Penh",
    caption: "Sweet coffee & napkin drawings",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-2",
    width: "330px",
    aspectRatio: "3 / 4"
  },
  {
    id: "story-3",
    chapter: "CHAPTER III",
    title: "Chroy Changvar Bridge",
    displayDate: "November 3, 2024",
    location: "Chroy Changvar, Phnom Penh",
    caption: "River lights like scattered stars",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-3",
    width: "350px",
    aspectRatio: "4 / 3"
  },
  {
    id: "story-4",
    chapter: "CHAPTER IV",
    title: "Our Balcony Archive",
    displayDate: "September 8, 2026",
    location: "Phnom Penh, Cambodia",
    caption: "Viraksak + Chanreaksa forever",
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-4",
    width: "340px",
    aspectRatio: "3 / 4"
  },
  {
    id: "story-5",
    chapter: "INTERLUDE",
    title: "Golden Hour Glow",
    displayDate: "December 24, 2025",
    location: "Riverside Promenade",
    caption: "Warm sunset in your eyes",
    imageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-2",
    width: "330px",
    aspectRatio: "4 / 3"
  },
  {
    id: "story-6",
    chapter: "ETERNAL",
    title: "Two Souls, One Heart",
    displayDate: "Every Single Day",
    location: "Always Together",
    caption: "Sak & Reaksa • Hand in hand",
    imageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1000&q=85",
    floatClass: "float-1",
    width: "340px",
    aspectRatio: "4 / 3"
  }
];

export default function StoryTimeline({ onSelectPhoto }) {
  const handleClick = (item) => {
    sound.playShutterSound();
    if (typeof onSelectPhoto === 'function') {
      onSelectPhoto({
        id: item.id,
        title: item.title,
        displayDate: item.displayDate,
        location: item.location,
        caption: item.caption,
        imageUrl: item.imageUrl,
        iso: 'ISO 400',
        fStop: 'f/2.8',
        shutterSpeed: '1/250s'
      });
    }
  };

  return (
    <section
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 20px 100px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Floating Ambient Glow Orbs in Background */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(229, 195, 136, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 0
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '25%',
          right: '8%',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(128, 0, 32, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />

      {/* Minimal Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.74rem',
            letterSpacing: '2px',
            color: 'var(--retro-burgundy)',
            background: 'var(--retro-cream-dark)',
            padding: '4px 14px',
            borderRadius: '20px',
            border: '1px solid var(--retro-border)',
            marginBottom: '14px'
          }}
        >
          <Sparkles size={13} />
          <EditableText
            textKey="story_badge_label"
            defaultText="FLOATING FILM MOMENTS • S + S"
            as="span"
          />
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
            color: 'var(--retro-charcoal)',
            fontWeight: 600,
            letterSpacing: '-0.5px'
          }}
        >
          <EditableText
            textKey="story_main_title"
            defaultText="Our Story in Floating Frames"
            as="span"
          />
        </h2>

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: 'var(--retro-brown)',
            marginTop: '8px',
            letterSpacing: '1px'
          }}
        >
          <EditableText
            textKey="story_subtitle_prompt"
            defaultText="[ TAP ANY FLOATING PHOTOGRAPH TO INSPECT IN VIEWFINDER ]"
            as="span"
          />
        </p>
      </div>

      {/* Flowing Floating Photographs Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '40px 32px',
          justifyItems: 'center',
          alignItems: 'start',
          position: 'relative',
          zIndex: 2,
          padding: '20px 0 40px 0'
        }}
      >
        {FLOATING_STORY_PHOTOS.map((item) => (
          <div
            key={item.id}
            className={`floating-story-card ${item.floatClass}`}
            onClick={() => handleClick(item)}
            style={{
              width: '100%',
              maxWidth: '360px'
            }}
            title={`${item.title} • Click to open viewfinder`}
          >
            {/* Retro Tape on Top */}
            <div className="washi-tape" style={{ top: '-14px' }} />

            {/* Top Minimal Chapter & Date Stamp */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.82rem',
                color: 'var(--retro-burgundy)',
                marginBottom: '8px',
                padding: '0 2px'
              }}
            >
              <EditableText
                textKey={`story_${item.id}_chapter`}
                defaultText={item.chapter}
                as="span"
              />
              <EditableText
                textKey={`story_${item.id}_date`}
                defaultText={item.displayDate}
                as="span"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--retro-brown)' }}
              />
            </div>

            {/* Floating Photo Container */}
            <div
              className="polaroid-photo-frame"
              style={{
                aspectRatio: item.aspectRatio,
                overflow: 'hidden',
                borderRadius: '2px',
                border: '1px solid var(--retro-charcoal)'
              }}
            >
              <EditableImage
                imageKey={`story_img_${item.id}`}
                defaultUrl={item.imageUrl}
                alt={item.title}
                className="polaroid-img"
              />
            </div>

            {/* Minimal Handwritten Caption on bottom margin */}
            <div
              className="polaroid-handwriting"
              style={{
                fontSize: '1.25rem',
                textAlign: 'center',
                marginTop: '10px',
                color: 'var(--retro-charcoal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <EditableText
                textKey={`story_${item.id}_caption`}
                defaultText={item.caption}
                as="span"
              />
              <Heart size={12} color="var(--retro-burgundy)" fill="var(--retro-burgundy)" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

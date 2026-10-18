import React from 'react';
import { ChevronDown } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';
import EditableImage from '../Admin/EditableImage';

export default function HomeHero({ onExploreMemories }) {
  const handleScrollClick = () => {
    sound.playTapeClick();
    if (typeof onExploreMemories === 'function') {
      onExploreMemories();
    } else {
      const storyEl = document.getElementById('story');
      if (storyEl) storyEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      style={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '100px 20px 60px 20px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}
    >
      {/* Floating Die-Cut Stickers of the Couple (image2.jpeg & image3.jpeg) */}
      <div className="hero-stickers-wrapper">
        {/* Sticker 1: Left */}
        <div className="sticker-pos-left">
          <div
            className="couple-sticker float-left"
            onClick={() => sound.playTapeClick()}
            title="Sak & Reaksa ♡"
          >
            <div className="couple-sticker-tape" />
            <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', borderRadius: '4px' }}>
              <EditableImage
                imageKey="home_sticker_sak"
                defaultUrl="/stickers/image2.jpeg"
                alt="Viraksak & Chanreaksa Sticker"
                className="couple-sticker-img"
              />
            </div>
            <EditableText
              textKey="home_sticker1_badge"
              defaultText="SAK & REAKSA ♡"
              as="div"
              className="couple-sticker-badge"
            />
          </div>
        </div>

        {/* Sticker 2: Right */}
        <div className="sticker-pos-right">
          <div
            className="couple-sticker float-right"
            onClick={() => sound.playTapeClick()}
            title="Forever Together ✦"
          >
            <div className="couple-sticker-tape" style={{ transform: 'translateX(-50%) rotate(4deg)' }} />
            <div style={{ aspectRatio: '3 / 4', overflow: 'hidden', borderRadius: '4px' }}>
              <EditableImage
                imageKey="home_sticker_reaksa"
                defaultUrl="/stickers/image3.jpeg"
                alt="Viraksak & Chanreaksa Sticker 2"
                className="couple-sticker-img"
              />
            </div>
            <EditableText
              textKey="home_sticker2_badge"
              defaultText="FOREVER TOGETHER ✦"
              as="div"
              className="couple-sticker-badge"
            />
          </div>
        </div>
      </div>

      {/* Main Editorial Couple Name (2 Lines) */}
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.8rem, 6.6vw, 5.2rem)',
          fontWeight: 600,
          color: 'var(--retro-charcoal)',
          letterSpacing: '-0.5px',
          lineHeight: 1.12,
          maxWidth: '850px',
          textShadow: '0 4px 30px rgba(255, 248, 235, 0.95)',
          position: 'relative',
          zIndex: 15,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px'
        }}
      >
        <EditableText
          textKey="home_hero_line1"
          defaultText="Viraksak"
          as="span"
          style={{ display: 'block', letterSpacing: '-0.5px' }}
        />
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            letterSpacing: '-0.5px',
            whiteSpace: 'nowrap'
          }}
        >
          <EditableText
            textKey="home_hero_ampersand"
            defaultText="&"
            as="span"
            style={{
              fontFamily: 'var(--font-handwritten)',
              color: 'var(--retro-burgundy)',
              fontSize: '0.92em',
              display: 'inline-block',
              marginRight: '12px',
              transform: 'translateY(-2px)'
            }}
          />
          <EditableText
            textKey="home_hero_line2"
            defaultText="Chanreaksa"
            as="span"
          />
        </span>
      </h1>

      {/* Subtle Scroll Down Prompt to Enter Story */}
      <div
        onClick={handleScrollClick}
        style={{
          marginTop: '44px',
          cursor: 'pointer',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.74rem',
          color: 'var(--retro-brown)',
          letterSpacing: '2px',
          opacity: 0.85,
          transition: 'opacity 0.2s ease, transform 0.2s ease',
          userSelect: 'none',
          position: 'relative',
          zIndex: 15
        }}
      >
        <EditableText
          textKey="home_scroll_prompt"
          defaultText="SCROLL TO EXPLORE"
          as="span"
        />
        <ChevronDown size={16} color="var(--retro-burgundy)" style={{ animation: 'bounceDown 1.8s infinite' }} />
      </div>
    </div>
  );
}

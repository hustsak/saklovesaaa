import React from 'react';
import { Calendar, Compass, Heart, Sparkles, MapPin } from 'lucide-react';
import { sound } from '../../utils/audioSynthesizer';
import EditableText from '../Admin/EditableText';

export default function FutureView({ futurePlans }) {
  return (
    <section style={{ maxWidth: '920px', margin: '0 auto', padding: '100px 20px 80px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-pixel)',
            fontSize: '1.15rem',
            color: 'var(--retro-burgundy)',
            background: 'var(--retro-cream-dark)',
            padding: '3px 12px',
            borderRadius: '2px',
            marginBottom: '10px'
          }}
        >
          <Sparkles size={14} />
          <EditableText
            textKey="future_badge_label"
            defaultText="PROMISES, ROADMAPS & TOMORROWS"
            as="span"
          />
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(2rem, 4vw, 2.8rem)',
            color: 'var(--retro-charcoal)',
            fontWeight: 600
          }}
        >
          <EditableText
            textKey="future_main_title"
            defaultText="Our Future Archive"
            as="span"
          />
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '1.05rem',
            color: 'var(--retro-brown)',
            maxWidth: '520px',
            margin: '8px auto 0 auto'
          }}
        >
          <EditableText
            textKey="future_subtitle"
            defaultText="A time-capsule of adventures we will embark on hand in hand."
            as="span"
          />
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {futurePlans.map((plan) => (
          <div
            key={plan.id}
            style={{
              background: 'var(--retro-offwhite)',
              border: '2px solid var(--retro-charcoal)',
              borderRadius: '4px',
              padding: '24px',
              boxShadow: '3px 3px 0px var(--retro-charcoal)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    color: 'var(--retro-burgundy)'
                  }}
                >
                  {plan.year}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    background: 'var(--retro-champagne)',
                    color: 'var(--retro-charcoal)',
                    padding: '3px 8px',
                    borderRadius: '2px',
                    fontWeight: 700,
                    border: '1px solid var(--retro-charcoal)'
                  }}
                >
                  {plan.badge}
                </span>
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--retro-charcoal)',
                  marginBottom: '10px'
                }}
              >
                {plan.title}
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.92rem',
                  color: 'var(--retro-brown)',
                  lineHeight: 1.6
                }}
              >
                {plan.description}
              </p>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '12px',
                borderTop: '1px dashed var(--retro-border)',
                fontFamily: 'var(--font-pixel)',
                fontSize: '0.95rem',
                color: 'var(--retro-olive)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Compass size={14} /> STATUS: {plan.status.toUpperCase()}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

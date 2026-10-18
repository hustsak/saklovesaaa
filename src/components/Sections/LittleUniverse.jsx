import React, { useRef, useEffect, useState, useCallback } from 'react';
import { sound } from '../../utils/audioSynthesizer';
import { Play, Pause, Sparkles, X, Compass, Info } from 'lucide-react';
import './LittleUniverse.css';

// Celestial Interactive Discoveries: Stars & Planets
const CELESTIAL_OBJECTS = [
  // 6 Whisper Stars
  {
    id: 'star-vega',
    type: 'star',
    normX: 0.18,
    normY: 0.32,
    radius: 2.8,
    name: 'Vega Whisper',
    whisper: '“Somewhere, something beautiful is happening.”',
    baseFreq: 659.25, // E5
    color: '#DCEBFF'
  },
  {
    id: 'star-spica',
    type: 'star',
    normX: 0.44,
    normY: 0.22,
    radius: 3.0,
    name: 'Spica Whisper',
    whisper: '“We are made of starstuff, quietly wandering home.”',
    baseFreq: 783.99, // G5
    color: '#FFFFFF'
  },
  {
    id: 'star-polaris',
    type: 'star',
    normX: 0.82,
    normY: 0.20,
    radius: 3.2,
    name: 'Polaris Whisper',
    whisper: '“Even the faintest star has its place in the sky.”',
    baseFreq: 880.00, // A5
    color: '#F9E8D2'
  },
  {
    id: 'star-arcturus',
    type: 'star',
    normX: 0.34,
    normY: 0.74,
    radius: 2.9,
    name: 'Arcturus Whisper',
    whisper: '“Take a breath. The universe is in no hurry.”',
    baseFreq: 587.33, // D5
    color: '#FFE2C8'
  },
  {
    id: 'star-altair',
    type: 'star',
    normX: 0.60,
    normY: 0.70,
    radius: 3.1,
    name: 'Altair Whisper',
    whisper: '“A quiet moment under an endless sky.”',
    baseFreq: 698.46, // F5
    color: '#E8D7F1'
  },
  {
    id: 'star-sirius',
    type: 'star',
    normX: 0.88,
    normY: 0.52,
    radius: 3.4,
    name: 'Sirius Whisper',
    whisper: '“Look up — the light you see began its journey long ago.”',
    baseFreq: 1046.50, // C6
    color: '#CDE5FF'
  },

  // 4 Celestial Worlds (Planets & Moon)
  {
    id: 'body-moon',
    type: 'moon',
    normX: 0.68,
    normY: 0.34,
    radius: 34,
    name: 'The Luminous Moon',
    whisper: '“A silent silver crescent reflecting quiet sunlight across deep space.”',
    baseFreq: 523.25, // C5
    color: '#F6EEDE'
  },
  {
    id: 'body-opalis',
    type: 'ringed',
    normX: 0.22,
    normY: 0.58,
    radius: 17,
    name: 'Opalis • Ringed World',
    whisper: '“A solitary ringed wanderer turning in slow, peaceful orbit.”',
    baseFreq: 440.00, // A4
    color: '#D8CCE5'
  },
  {
    id: 'body-aurelia',
    type: 'amber',
    normX: 0.82,
    normY: 0.78,
    radius: 12,
    name: 'Aurelia • Terracotta World',
    whisper: '“An ancient mineral sphere glowing softly in the distant twilight.”',
    baseFreq: 392.00, // G4
    color: '#E6A374'
  },
  {
    id: 'body-nadir',
    type: 'cyan',
    normX: 0.12,
    normY: 0.18,
    radius: 9,
    name: 'Nadir • Ice Sphere',
    whisper: '“A crystalline glacial world resting at the outer boundary.”',
    baseFreq: 987.77, // B5
    color: '#AEE4F2'
  }
];

export default function LittleUniverse() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // User motion preference & control
  const [motionEnabled, setMotionEnabled] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return true;
  });

  // Active whisper message from tapped star or planet
  const [activeWhisper, setActiveWhisper] = useState(null);
  const [hoveredObjectId, setHoveredObjectId] = useState(null);

  // Parallax tracking
  const parallaxRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
  const ripplesRef = useRef([]);
  const shootingStarRef = useRef(null);
  const nextShootingStarTimeRef = useRef(Date.now() + 3000);

  // Auto-dismiss whisper timer
  useEffect(() => {
    if (!activeWhisper) return;
    const timer = setTimeout(() => {
      setActiveWhisper(null);
    }, 7000);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveWhisper(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeWhisper]);

  // Handle celestial object selection (click or keyboard)
  const handleSelectObject = useCallback((obj) => {
    if (!obj) return;
    sound.playStarChime(obj.baseFreq || 880);

    // Trigger radiant visual pulse on canvas
    if (canvasRef.current) {
      const w = canvasRef.current.clientWidth || 800;
      const h = canvasRef.current.clientHeight || 500;
      ripplesRef.current.push({
        x: obj.normX * w,
        y: obj.normY * h,
        radius: 4,
        maxRadius: obj.type === 'star' ? 44 : 70,
        alpha: 0.9,
        color: obj.color || '#CDE5FF'
      });
    }

    setActiveWhisper({
      name: obj.name,
      message: obj.whisper,
      type: obj.type
    });
  }, []);

  // Main Canvas Scene Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let isVisible = true;

    // Handle high-DPI retina displays
    let width = 0;
    let height = 0;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Star generation with 3 depth layers
    const starCount = width < 600 ? 120 : 210;
    const stars = [];

    for (let i = 0; i < starCount; i++) {
      const layer = Math.random() < 0.65 ? 0 : Math.random() < 0.88 ? 1 : 2;
      stars.push({
        normX: Math.random(),
        normY: Math.random(),
        radius: layer === 0 ? Math.random() * 0.7 + 0.35 : layer === 1 ? Math.random() * 0.9 + 0.8 : Math.random() * 1.3 + 1.4,
        alpha: layer === 0 ? Math.random() * 0.4 + 0.2 : layer === 1 ? Math.random() * 0.5 + 0.4 : Math.random() * 0.3 + 0.7,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        layer,
        parallaxFactor: layer === 0 ? 0.08 : layer === 1 ? 0.25 : 0.55,
        color: ['#FFFFFF', '#E6EEFF', '#E4DCF8', '#FFF3E3'][Math.floor(Math.random() * 4)]
      });
    }

    // Visibility Observer to save battery & CPU when scrolled away
    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting && !document.hidden;
          });
        },
        { threshold: 0.05 }
      );
      if (containerRef.current) observer.observe(containerRef.current);
    }

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Pointer move listener for gentle 3D parallax
    const handlePointerMove = (e) => {
      if (!motionEnabled) return;
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const normX = (clientX - rect.left) / rect.width - 0.5;
      const normY = (clientY - rect.top) / rect.height - 0.5;
      parallaxRef.current.targetX = normX * 28;
      parallaxRef.current.targetY = normY * 20;
    };

    const handlePointerLeave = () => {
      parallaxRef.current.targetX = 0;
      parallaxRef.current.targetY = 0;
    };

    const canvasDom = canvas;
    canvasDom.addEventListener('mousemove', handlePointerMove, { passive: true });
    canvasDom.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    canvasDom.addEventListener('touchmove', handlePointerMove, { passive: true });

    // Click handler for stars and planets on canvas
    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const pX = parallaxRef.current.currentX;
      const pY = parallaxRef.current.currentY;

      // Find closest interactive celestial object within hit threshold
      for (const obj of CELESTIAL_OBJECTS) {
        const factor = obj.type === 'star' ? 0.45 : 0.3;
        const oX = obj.normX * width + pX * factor;
        const oY = obj.normY * height + pY * factor;
        const hitRadius = Math.max(obj.radius + 18, 24);

        const dist = Math.hypot(clickX - oX, clickY - oY);
        if (dist <= hitRadius) {
          handleSelectObject(obj);
          return;
        }
      }

      // If clicked empty space, gently dismiss any open whisper
      setActiveWhisper(null);
    };

    canvasDom.addEventListener('click', handleClick);

    // Animation Loop
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      if (motionEnabled) {
        time += 0.014;
        // Smooth lerp parallax
        parallaxRef.current.currentX += (parallaxRef.current.targetX - parallaxRef.current.currentX) * 0.06;
        parallaxRef.current.currentY += (parallaxRef.current.targetY - parallaxRef.current.currentY) * 0.06;
      } else {
        parallaxRef.current.currentX = 0;
        parallaxRef.current.currentY = 0;
      }

      const pX = parallaxRef.current.currentX;
      const pY = parallaxRef.current.currentY;

      // 1. Deep Celestial Sky Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#04060E');
      skyGrad.addColorStop(0.5, '#080B1B');
      skyGrad.addColorStop(1, '#050711');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Cosmic Nebulae (Indigo & Violet Atmospheric Clouds)
      // Nebula 1: Deep Indigo & Violet
      const neb1X = width * 0.38 + pX * 0.12;
      const neb1Y = height * 0.45 + pY * 0.12;
      const neb1Grad = ctx.createRadialGradient(neb1X, neb1Y, 10, neb1X, neb1Y, width * 0.45);
      neb1Grad.addColorStop(0, 'rgba(68, 48, 116, 0.22)');
      neb1Grad.addColorStop(0.45, 'rgba(42, 28, 80, 0.12)');
      neb1Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb1Grad;
      ctx.fillRect(0, 0, width, height);

      // Nebula 2: Soft Starlight Cyan & Lavender
      const neb2X = width * 0.76 + pX * 0.15;
      const neb2Y = height * 0.70 + pY * 0.15;
      const neb2Grad = ctx.createRadialGradient(neb2X, neb2Y, 10, neb2X, neb2Y, width * 0.4);
      neb2Grad.addColorStop(0, 'rgba(32, 58, 96, 0.18)');
      neb2Grad.addColorStop(0.5, 'rgba(20, 36, 68, 0.08)');
      neb2Grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = neb2Grad;
      ctx.fillRect(0, 0, width, height);

      // 3. Distant Tilted Spiral Galaxy (Upper Right)
      const galX = width * 0.86 + pX * 0.06;
      const galY = height * 0.16 + pY * 0.06;
      ctx.save();
      ctx.translate(galX, galY);
      ctx.rotate(-0.55); // ~32 deg tilt
      ctx.scale(2.2, 0.85);

      const galGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 55);
      galGrad.addColorStop(0, 'rgba(240, 235, 255, 0.42)');
      galGrad.addColorStop(0.25, 'rgba(185, 170, 240, 0.22)');
      galGrad.addColorStop(0.65, 'rgba(95, 75, 155, 0.07)');
      galGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = galGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Background Star Field (3 Layers of Depth)
      stars.forEach((s) => {
        const sX = (s.normX * width + pX * s.parallaxFactor + width) % width;
        const sY = (s.normY * height + pY * s.parallaxFactor + height) % height;

        let alpha = s.alpha;
        if (motionEnabled) {
          alpha += Math.sin(time * s.twinkleSpeed * 60 + s.twinklePhase) * 0.22;
          alpha = Math.max(0.12, Math.min(1, alpha));
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(sX, sY, s.radius, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft halo for closest stars
        if (s.layer === 2) {
          ctx.globalAlpha = alpha * 0.25;
          ctx.beginPath();
          ctx.arc(sX, sY, s.radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      // 5. Shooting Star (Occasional & Serene)
      const now = Date.now();
      if (motionEnabled && !shootingStarRef.current && now > nextShootingStarTimeRef.current) {
        shootingStarRef.current = {
          x: Math.random() * (width * 0.65),
          y: Math.random() * (height * 0.3),
          vx: 7 + Math.random() * 3,
          vy: 3.5 + Math.random() * 2,
          length: 90 + Math.random() * 40,
          progress: 0,
          maxLife: 45
        };
      }

      if (shootingStarRef.current) {
        const ss = shootingStarRef.current;
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.progress++;

        const lifeRatio = ss.progress / ss.maxLife;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.85;

        const tailX = ss.x - (ss.vx / Math.hypot(ss.vx, ss.vy)) * ss.length;
        const tailY = ss.y - (ss.vy / Math.hypot(ss.vx, ss.vy)) * ss.length;

        const ssGrad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        ssGrad.addColorStop(0, 'rgba(215, 230, 255, 0)');
        ssGrad.addColorStop(0.7, 'rgba(225, 240, 255, ' + (alpha * 0.5) + ')');
        ssGrad.addColorStop(1, 'rgba(255, 255, 255, ' + alpha + ')');

        ctx.strokeStyle = ssGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        // Bright star head
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        if (ss.progress >= ss.maxLife) {
          shootingStarRef.current = null;
          nextShootingStarTimeRef.current = Date.now() + 5000 + Math.random() * 6000;
        }
      }

      // 6. Radiant Expanding Ripples from Star/Planet Taps
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const r = ripplesRef.current[i];
        r.radius += 1.8;
        r.alpha -= 0.024;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 7. Render Celestial Objects (Stars & Planets)
      CELESTIAL_OBJECTS.forEach((obj) => {
        const factor = obj.type === 'star' ? 0.45 : 0.3;
        const oX = obj.normX * width + pX * factor;
        const oY = obj.normY * height + pY * factor;
        const isHovered = hoveredObjectId === obj.id;

        // Render Moon
        if (obj.type === 'moon') {
          // Soft atmospheric corona
          const coronaGrad = ctx.createRadialGradient(oX, oY, obj.radius * 0.8, oX, oY, obj.radius * 2.2);
          coronaGrad.addColorStop(0, 'rgba(240, 232, 215, 0.28)');
          coronaGrad.addColorStop(0.5, 'rgba(180, 195, 235, 0.1)');
          coronaGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = coronaGrad;
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Dark shaded lunar disc
          ctx.fillStyle = '#080A18';
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle craters on shaded side
          ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
          ctx.beginPath();
          ctx.arc(oX - 6, oY + 4, 4.5, 0, Math.PI * 2);
          ctx.arc(oX + 3, oY - 7, 3, 0, Math.PI * 2);
          ctx.arc(oX + 8, oY + 8, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Luminous Crescent illumination on the left side
          ctx.save();
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius, 0, Math.PI * 2);
          ctx.clip();

          const moonGrad = ctx.createRadialGradient(
            oX - obj.radius * 0.45,
            oY - obj.radius * 0.15,
            obj.radius * 0.1,
            oX,
            oY,
            obj.radius * 1.1
          );
          moonGrad.addColorStop(0, '#FFFDF8');
          moonGrad.addColorStop(0.35, '#F3E9DA');
          moonGrad.addColorStop(0.75, '#A5B5D6');
          moonGrad.addColorStop(1, 'rgba(8, 11, 26, 0.95)');

          ctx.fillStyle = moonGrad;
          ctx.beginPath();
          ctx.arc(oX - obj.radius * 0.28, oY, obj.radius * 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Soft subtle lunar rim stroke
          ctx.strokeStyle = 'rgba(255, 250, 240, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Render Ringed World (Opalis)
        else if (obj.type === 'ringed') {
          const r = obj.radius;
          ctx.save();
          ctx.translate(oX, oY);
          ctx.rotate(-0.4); // ~23 deg ring tilt

          // Back half of rings (behind planet)
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 2.3, r * 0.72, 0, Math.PI, Math.PI * 2);
          ctx.strokeStyle = 'rgba(215, 205, 235, 0.55)';
          ctx.lineWidth = 4.5;
          ctx.stroke();

          // Inner ring groove (Cassini division illusion)
          ctx.strokeStyle = 'rgba(120, 105, 150, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Planet Sphere
          const pGrad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
          pGrad.addColorStop(0, '#F0EAF8');
          pGrad.addColorStop(0.5, '#BCA8CE');
          pGrad.addColorStop(1, '#4A3B58');
          ctx.fillStyle = pGrad;
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.fill();

          // Front half of rings (in front of planet)
          ctx.beginPath();
          ctx.ellipse(0, 0, r * 2.3, r * 0.72, 0, 0, Math.PI);
          ctx.strokeStyle = 'rgba(215, 205, 235, 0.75)';
          ctx.lineWidth = 4.5;
          ctx.stroke();

          ctx.restore();
        }

        // Render Amber Terrestrial Planet (Aurelia)
        else if (obj.type === 'amber') {
          const r = obj.radius;
          const aGrad = ctx.createRadialGradient(oX - r * 0.35, oY - r * 0.35, 1, oX, oY, r);
          aGrad.addColorStop(0, '#FFD9B8');
          aGrad.addColorStop(0.45, '#E28B58');
          aGrad.addColorStop(1, '#5C2818');
          ctx.fillStyle = aGrad;
          ctx.beginPath();
          ctx.arc(oX, oY, r, 0, Math.PI * 2);
          ctx.fill();

          // Atmospheric rim glow
          ctx.strokeStyle = 'rgba(255, 200, 160, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Render Cyan Ice Planet (Nadir)
        else if (obj.type === 'cyan') {
          const r = obj.radius;
          const cGrad = ctx.createRadialGradient(oX - r * 0.3, oY - r * 0.3, 1, oX, oY, r);
          cGrad.addColorStop(0, '#EAF8FC');
          cGrad.addColorStop(0.5, '#72C2DB');
          cGrad.addColorStop(1, '#1A4D60');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(oX, oY, r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Render Whisper Stars
        else if (obj.type === 'star') {
          let starAlpha = 0.92;
          if (motionEnabled) {
            starAlpha += Math.sin(time * 3 + obj.radius * 2) * 0.15;
          }

          // Soft radial glow
          const glowGrad = ctx.createRadialGradient(oX, oY, 0, oX, oY, obj.radius * 4.5);
          glowGrad.addColorStop(0, 'rgba(255, 255, 255, ' + starAlpha + ')');
          glowGrad.addColorStop(0.3, 'rgba(205, 225, 255, ' + (starAlpha * 0.45) + ')');
          glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius * 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Central star core
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(oX, oY, obj.radius, 0, Math.PI * 2);
          ctx.fill();

          // Subtle 4-point cross diffraction spike
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(oX - obj.radius * 3.2, oY);
          ctx.lineTo(oX + obj.radius * 3.2, oY);
          ctx.moveTo(oX, oY - obj.radius * 3.2);
          ctx.lineTo(oX, oY + obj.radius * 3.2);
          ctx.stroke();
        }

        // Hover Focus Ring
        if (isHovered) {
          ctx.strokeStyle = 'rgba(215, 230, 255, 0.65)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.arc(oX, oY, Math.max(obj.radius + 12, 18), 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvasDom.removeEventListener('mousemove', handlePointerMove);
      canvasDom.removeEventListener('mouseleave', handlePointerLeave);
      canvasDom.removeEventListener('touchmove', handlePointerMove);
      canvasDom.removeEventListener('click', handleClick);
      if (observer) observer.disconnect();
    };
  }, [motionEnabled, hoveredObjectId, handleSelectObject]);

  return (
    <div className="universe-section-wrapper" ref={containerRef}>
      {/* 1. Restrained Header */}
      <div className="universe-header">
        <div className="universe-eyebrow">
          <span>✦</span>
          <span>A LITTLE UNIVERSE</span>
          <span>✦</span>
        </div>
        <h2 className="universe-title">A Little Universe</h2>
        <p className="universe-subtitle">Take a moment. Look a little closer.</p>
      </div>

      {/* 2. Interactive Cosmic Viewport */}
      <div
        className="universe-viewport-frame"
        role="region"
        aria-label="Interactive Little Universe cosmic exploration"
      >
        {/* Soft Vignette Overlay */}
        <div className="universe-vignette" />

        {/* HUD Overlay Bar */}
        <div className="universe-hud-bar">
          <div className="universe-hud-tag">
            <span className="universe-hud-dot" />
            <span>OBSERVATORY • DEEP FIELD</span>
          </div>

          <div className="universe-hud-controls">
            <button
              type="button"
              className="universe-btn-icon"
              onClick={() => {
                sound.playTapeClick();
                setMotionEnabled(!motionEnabled);
              }}
              title={motionEnabled ? 'Pause cosmic ambient motion' : 'Resume cosmic ambient motion'}
              aria-label={motionEnabled ? 'Pause ambient motion' : 'Resume ambient motion'}
            >
              {motionEnabled ? <Pause size={13} /> : <Play size={13} />}
              <span>{motionEnabled ? 'PAUSE MOTION' : 'RESUME'}</span>
            </button>
          </div>
        </div>

        {/* Main Canvas Engine */}
        <canvas
          ref={canvasRef}
          className="universe-canvas"
          title="Click any star or planet to listen to a whisper from the universe"
        />

        {/* Keyboard Accessible Interactive Overlays */}
        <div className="universe-a11y-overlay" aria-label="Interactive Celestial Objects">
          {CELESTIAL_OBJECTS.map((obj) => (
            <button
              key={obj.id}
              type="button"
              className="universe-a11y-target"
              style={{
                left: `${obj.normX * 100}%`,
                top: `${obj.normY * 100}%`,
                width: obj.type === 'moon' ? '74px' : obj.type === 'ringed' ? '54px' : '44px',
                height: obj.type === 'moon' ? '74px' : obj.type === 'ringed' ? '54px' : '44px'
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectObject(obj);
              }}
              onMouseEnter={() => setHoveredObjectId(obj.id)}
              onMouseLeave={() => setHoveredObjectId(null)}
              onFocus={() => setHoveredObjectId(obj.id)}
              onBlur={() => setHoveredObjectId(null)}
              title={`${obj.name} — Click to explore`}
              aria-label={`Explore ${obj.name}`}
            />
          ))}
        </div>

        {/* Floating Poetic Whisper Card (Non-intrusive) */}
        {activeWhisper && (
          <div className="universe-whisper-card" role="status" aria-live="polite">
            <div className="whisper-source-badge">
              <Sparkles size={11} color="#A9BCE8" />
              <span>{activeWhisper.name.toUpperCase()}</span>
            </div>
            <p className="whisper-message-text">{activeWhisper.message}</p>
            <button
              type="button"
              className="whisper-dismiss-btn"
              onClick={() => setActiveWhisper(null)}
              aria-label="Dismiss message"
            >
              [ CLOSE / ESC ]
            </button>
          </div>
        )}
      </div>

      {/* 3. Subtle Footnote Hint */}
      <div className="universe-footer-hint">
        ✦ TAP ANY STAR OR PLANET &bull; PEACEFUL CELESTIAL SOUND ON CLICK ✦
      </div>
    </div>
  );
}

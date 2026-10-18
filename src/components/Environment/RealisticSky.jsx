import React, { useEffect, useRef } from 'react';

// Realistic atmospheric environment: Dynamic sunset, moving golden clouds, and floating dust motes
export default function RealisticSky() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Realistic dust motes in the wind
    const particles = [];
    const particleCount = 42;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.6,
        alpha: Math.random() * 0.5 + 0.2,
        speedX: Math.random() * 0.4 + 0.15,
        speedY: (Math.random() - 0.5) * 0.25,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2
      });
    }

    // Realistic procedural drifting clouds
    const clouds = [
      { x: width * 0.1, y: height * 0.22, r: 160, speed: 0.12, opacity: 0.28 },
      { x: width * 0.6, y: height * 0.35, r: 240, speed: 0.18, opacity: 0.22 },
      { x: width * 0.85, y: height * 0.18, r: 180, speed: 0.09, opacity: 0.25 },
      { x: -width * 0.2, y: height * 0.4, r: 210, speed: 0.14, opacity: 0.2 }
    ];

    let time = 0;

    const render = () => {
      time += 0.01;

      // 1. Realistic Warm Sunset Gradient (Amber, Coral, Golden Champagne, Dusky Charcoal)
      const sunsetGrad = ctx.createLinearGradient(0, 0, 0, height);
      sunsetGrad.addColorStop(0, '#3A202A');    // Deep twilight plum
      sunsetGrad.addColorStop(0.35, '#843844'); // Burgundy horizon
      sunsetGrad.addColorStop(0.65, '#D47E5B'); // Warm amber terracotta
      sunsetGrad.addColorStop(0.85, '#E9B97D'); // Golden hour glow
      sunsetGrad.addColorStop(1, '#F3E5CA');    // Soft cream warmth

      ctx.fillStyle = sunsetGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Realistic Sun Glow Orb near horizon
      const sunX = width * 0.72;
      const sunY = height * 0.68;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 380);
      sunGrad.addColorStop(0, 'rgba(255, 244, 214, 0.7)');
      sunGrad.addColorStop(0.3, 'rgba(235, 178, 120, 0.4)');
      sunGrad.addColorStop(0.7, 'rgba(212, 126, 91, 0.15)');
      sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.fillRect(0, 0, width, height);

      // 3. Drifting Soft Clouds
      clouds.forEach((cloud) => {
        cloud.x += cloud.speed;
        if (cloud.x - cloud.r > width) {
          cloud.x = -cloud.r;
        }

        const cloudGrad = ctx.createRadialGradient(
          cloud.x, cloud.y, 0,
          cloud.x, cloud.y, cloud.r
        );
        cloudGrad.addColorStop(0, `rgba(255, 225, 195, ${cloud.opacity})`);
        cloudGrad.addColorStop(0.5, `rgba(240, 180, 150, ${cloud.opacity * 0.5})`);
        cloudGrad.addColorStop(1, 'rgba(255, 200, 170, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Subtle Film Dust / Golden Air Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY + Math.sin(time + p.angle) * 0.15;
        p.angle += p.twinkleSpeed;

        if (p.x > width) p.x = 0;
        if (p.y > height) p.y = 0;
        if (p.y < 0) p.y = height;

        const currentAlpha = Math.max(0.1, p.alpha + Math.sin(p.angle) * 0.2);
        ctx.fillStyle = `rgba(255, 248, 235, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}

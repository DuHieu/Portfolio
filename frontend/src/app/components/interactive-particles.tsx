import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
}

export function InteractiveParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const isAttractionMode = useRef(false);

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Create particles
    const particleCount = 100;
    particlesRef.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      baseX: Math.random() * window.innerWidth,
      baseY: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
    }));

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        isAttractionMode.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        isAttractionMode.current = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle) => {
        // Calculate distance from mouse
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        // Repulsion or Attraction effect based on mode
        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          
          if (isAttractionMode.current) {
            // Attraction mode (Shift key held) - pull towards mouse
            particle.vx += Math.cos(angle) * force * 0.8;
            particle.vy += Math.sin(angle) * force * 0.8;
          } else {
            // Repulsion mode (default) - push away from mouse
            particle.vx -= Math.cos(angle) * force * 0.5;
            particle.vy -= Math.sin(angle) * force * 0.5;
          }
        }

        // Return to base position with spring effect
        const baseDistanceX = particle.baseX - particle.x;
        const baseDistanceY = particle.baseY - particle.y;
        particle.vx += baseDistanceX * 0.01;
        particle.vy += baseDistanceY * 0.01;

        // Apply velocity with damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Keep particles in bounds
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.baseX = Math.random() * canvas.width;
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.baseY = Math.random() * canvas.height;
        }
      });

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 217, 255, 0.15)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            const opacity = (120 - distance) / 120;
            
            // Create gradient for line
            const gradient = ctx.createLinearGradient(
              particles[i].x,
              particles[i].y,
              particles[j].x,
              particles[j].y
            );
            gradient.addColorStop(0, `rgba(0, 217, 255, ${opacity * 0.3})`);
            gradient.addColorStop(0.5, `rgba(168, 85, 247, ${opacity * 0.3})`);
            gradient.addColorStop(1, `rgba(0, 217, 255, ${opacity * 0.3})`);
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((particle) => {
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Particles glow when near mouse
        const glowIntensity = Math.max(0, 1 - distance / 150);
        
        // Create radial gradient for glow
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 3
        );
        
        if (glowIntensity > 0.5) {
          gradient.addColorStop(0, `rgba(0, 217, 255, ${0.8 + glowIntensity * 0.2})`);
          gradient.addColorStop(0.5, `rgba(168, 85, 247, ${0.4 + glowIntensity * 0.4})`);
          gradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
        } else {
          gradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 + glowIntensity})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${0.1 + glowIntensity * 0.3})`);
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size + glowIntensity * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.fillStyle = glowIntensity > 0.5 
          ? `rgba(0, 217, 255, ${0.9 + glowIntensity * 0.1})` 
          : `rgba(255, 255, 255, ${0.8 + glowIntensity * 0.2})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw mouse effect
      const mouseGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        100
      );
      
      if (isAttractionMode.current) {
        // Attraction mode - violet/purple glow
        mouseGradient.addColorStop(0, 'rgba(168, 85, 247, 0.3)');
        mouseGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.15)');
        mouseGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        
        // Draw attraction ring
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner ring pulse
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Repulsion mode - blue glow
        mouseGradient.addColorStop(0, 'rgba(0, 217, 255, 0.1)');
        mouseGradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.05)');
        mouseGradient.addColorStop(1, 'rgba(0, 217, 255, 0)');
      }
      
      ctx.fillStyle = mouseGradient;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [dimensions]);

  return (
    <motion.canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
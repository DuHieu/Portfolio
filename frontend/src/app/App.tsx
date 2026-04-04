import { useEffect } from 'react';
import { FloatingNav } from './components/floating-nav';
import { HeroSection } from './components/hero-section';
import { ExperienceSection } from './components/experience-section';
import { ProjectGallery } from './components/project-gallery';
import { ContactSection } from './components/contact-section';
import { InteractiveParticles } from './components/interactive-particles';
import { ParticleModeIndicator } from './components/particle-mode-indicator';

export default function App() {
  useEffect(() => {
    // Set dark mode and apply antigravity theme
    document.documentElement.classList.add('dark');
    document.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href) {
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      {/* Interactive Particle Mesh Background */}
      <InteractiveParticles />
      
      {/* Particle Mode Indicator */}
      <ParticleModeIndicator />
      
      {/* Floating Navigation */}
      <FloatingNav />

      {/* Background starfield effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-[#0A0A0A]" />
        {/* Radial gradient for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] via-[#0A0A0A] to-[#0A0A0A]" />
      </div>

      {/* Main content */}
      <main className="relative z-10">
        <HeroSection />
        <ExperienceSection />
        <ProjectGallery />
        <ContactSection />
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-4">
            <p className="text-white/60 tracking-wide">
              Designed & Built with{' '}
              <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
                Antigravity Magic
              </span>
            </p>
          </div>
          <p className="text-white/40 text-sm tracking-wide">
            © 2026 Alex Portfolio. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
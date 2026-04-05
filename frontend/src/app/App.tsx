import { useEffect, useState } from 'react';
import { FloatingNav } from './components/floating-nav';
import { HeroSection } from './components/hero-section';
import { ExperienceSection } from './components/experience-section';
import { ProjectGallery } from './components/project-gallery';
import { ContactSection } from './components/contact-section';
import { InteractiveParticles } from './components/interactive-particles';
import { ParticleModeIndicator } from './components/particle-mode-indicator';
import { EditProvider } from './context/edit-context';
import { PublishBar } from './components/publish-bar';
import { DashboardSection } from './components/dashboard-section';
import { Toaster } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const [activeUser, setActiveUser] = useState(queryParams.get('user') || 'dudev');
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    if (activeUser !== 'dudev') {
      fetch(`${API_BASE}/api/profile/${activeUser}/`)
        .then(res => {
          if (!res.ok) throw new Error('User not found');
        })
        .catch(() => {
          setActiveUser('dudev');
          window.history.replaceState({}, '', window.location.pathname); 
        });
    }

    document.documentElement.classList.add('dark');
    document.body.style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    
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
  }, [activeUser]);

  return (
    <EditProvider>
      <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
        <Toaster position="top-right" richColors />
        <InteractiveParticles />
        <ParticleModeIndicator />
        <FloatingNav showDashboard={showDashboard} setShowDashboard={setShowDashboard} />

        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/95 to-[#0A0A0A]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] via-[#0A0A0A] to-[#0A0A0A]" />
        </div>

        <main className="relative z-10">
          {showDashboard ? (
            <DashboardSection username={activeUser} />
          ) : (
            <>
              <HeroSection username={activeUser} />
              <ExperienceSection username={activeUser} />
              <ProjectGallery username={activeUser} />
              <ContactSection username={activeUser} />
            </>
          )}
        </main>

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

        <PublishBar />
      </div>
    </EditProvider>
  );
}
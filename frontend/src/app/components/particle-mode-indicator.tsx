import { motion, AnimatePresence } from 'motion/react';
import { MousePointerClick, Magnet } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ParticleModeIndicator() {
  const [isAttractionMode, setIsAttractionMode] = useState(false);
  const [showTip, setShowTip] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey) {
        setIsAttractionMode(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsAttractionMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Hide tip after 10 seconds
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 10000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Instruction Tip */}
      <AnimatePresence>
        {showTip && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 2 }}
            className="fixed bottom-8 left-8 z-50 pointer-events-none"
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl px-6 py-4 shadow-2xl">
              <p className="text-white/80 text-sm tracking-wide flex items-center gap-2">
                <MousePointerClick className="w-4 h-4" />
                <span>
                  Move your mouse to interact with particles
                </span>
              </p>
              <p className="text-white/60 text-xs mt-2 tracking-wide flex items-center gap-2">
                <Magnet className="w-3 h-3" />
                <span>
                  Hold <kbd className="px-2 py-0.5 bg-white/20 rounded">Shift</kbd> for attraction mode
                </span>
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/20 to-[#A855F7]/20 rounded-2xl blur-xl -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mode Indicator */}
      <AnimatePresence>
        {isAttractionMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-32 right-8 z-50 pointer-events-none"
          >
            <div className="backdrop-blur-xl bg-gradient-to-r from-[#A855F7]/20 to-[#7C3AED]/20 border border-[#A855F7]/50 rounded-2xl px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                >
                  <Magnet className="w-5 h-5 text-[#A855F7]" />
                </motion.div>
                <div>
                  <p className="text-white font-semibold text-sm tracking-wide">Attraction Mode</p>
                  <p className="text-white/60 text-xs tracking-wide">Particles are drawn to cursor</p>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#A855F7]/30 to-[#7C3AED]/30 rounded-2xl blur-2xl -z-10 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

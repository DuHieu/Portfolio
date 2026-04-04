import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Pencil } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useEdit } from '../context/edit-context';
import { EditModal } from './edit-modal';

interface DeveloperProfile {
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  github_url: string;
  linkedin_url: string;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function HeroSection({ username }: { username: string }) {
  const { user } = useAuth();
  const { isEditMode, pendingChanges } = useEdit();
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Check if current profile belongs to the logged-in user
  const isOwner = user?.email?.split('@')[0] === username;

  // Merge pending changes for real-time preview
  const displayProfile = {
    ...profile,
    ...(pendingChanges['profile:current'] || {})
  };

  useEffect(() => {
    fetch(`${API_BASE}/api/profile/${username}/`)
      .then(res => res.json())
      .then(data => setProfile(data))
      .catch(err => console.error('Fetch profile error:', err));

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, username]);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Edit Trigger */}
      {isOwner && isEditMode && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          className="absolute top-32 right-10 z-50 p-4 bg-gradient-to-br from-[#00D9FF] to-[#A855F7] rounded-full text-white shadow-lg shadow-[#00D9FF]/20"
          onClick={() => setIsModalOpen(true)}
        >
          <Pencil className="w-6 h-6" />
        </motion.button>
      )}

      {/* Edit Modal */}
      {profile && (
        <EditModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Edit Profile"
          type="profile"
          id="current"
          initialData={{
            full_name: profile.full_name,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
          }}
        />
      )}

      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute w-96 h-96 border border-white/10 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <motion.div
        className="absolute w-72 h-72 border border-[#00D9FF]/20"
        style={{ rotateX, rotateY }}
        animate={{ rotate: -360 }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />

      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        >
          <h1 className="text-[12rem] md:text-[15rem] font-extrabold tracking-tighter text-white select-none uppercase">
            {displayProfile.username || username}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ rotateX, rotateY }}
          className="relative mx-auto mb-12"
        >
          <div className="w-48 h-48 mx-auto relative perspective-1000">
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              {displayProfile.avatar_url ? (
                <div className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-white/30">
                  <img src={displayProfile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00D9FF]/30 to-[#A855F7]/30 backdrop-blur-xl border border-white/30 rounded-3xl transform rotate-12" />
                  <div className="absolute inset-0 bg-gradient-to-tl from-[#A855F7]/20 to-[#00D9FF]/20 backdrop-blur-xl border border-white/20 rounded-3xl transform -rotate-12" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                </>
              )}
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] blur-3xl opacity-50 -z-10" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative z-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
              {displayProfile.full_name || 'Creative Developer'}
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-white/60 tracking-wide max-w-2xl mx-auto">
            {displayProfile.bio || 'Crafting immersive digital experiences that defy gravity'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-8 py-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full text-white overflow-hidden group"
          >
            <span className="relative z-10 tracking-wide">Explore My Work</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}

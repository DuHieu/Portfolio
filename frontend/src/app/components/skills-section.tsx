import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  icon: string;
  order: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const CATEGORY_ORDER = ['frontend', 'backend', 'devops', 'tools', 'language', 'other'];

const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'from-[#00D9FF] to-[#0088CC]',
  backend: 'from-[#A855F7] to-[#7C3AED]',
  devops: 'from-[#F59E0B] to-[#D97706]',
  tools: 'from-[#10B981] to-[#059669]',
  language: 'from-[#EF4444] to-[#DC2626]',
  other: 'from-[#6B7280] to-[#4B5563]',
};

const CATEGORY_BG: Record<string, string> = {
  frontend: 'bg-[#00D9FF]/10 border-[#00D9FF]/20 text-[#00D9FF]',
  backend: 'bg-[#A855F7]/10 border-[#A855F7]/20 text-[#A855F7]',
  devops: 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]',
  tools: 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]',
  language: 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]',
  other: 'bg-white/5 border-white/10 text-white/60',
};

export function SkillsSection({ username }: { username: string }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch(`${API_BASE}/api/skills/?user=${username}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSkills(data); })
      .catch(() => {});
  }, [username]);

  const categories = ['all', ...CATEGORY_ORDER.filter(c => skills.some(s => s.category === c))];
  const filtered = activeCategory === 'all' ? skills : skills.filter(s => s.category === activeCategory);

  const categoryLabel = (cat: string) => {
    // Always show section if user is checking their own profile
    const labels: Record<string, string> = {
      frontend: 'Frontend',
      backend: 'Backend',
      devops: 'DevOps',
      tools: 'Tools',
      language: 'Languages',
      other: 'Other'
    };
    return cat === 'all' ? 'All' : (labels[cat] || cat);
  };

  return (
    <section id="skills" className="relative py-32 md:py-40 px-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00D9FF]/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
              Tech Stack
            </span>
          </h2>
          <p className="text-xl text-white/60">Tools and technologies in my arsenal</p>
        </motion.div>

        {/* Category filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full border text-sm font-semibold transition-all duration-200 ${
                activeCategory === cat
                  ? cat === 'all'
                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                    : `${CATEGORY_BG[cat]} border scale-105`
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'
              }`}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </motion.div>

        {skills.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl backdrop-blur-xl bg-white/5">
            <p className="text-white/40 italic">Add your tech stack in the dashboard to populate this galaxy.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {filtered.map((skill, index) => {
              const color = CATEGORY_COLORS[skill.category] || CATEGORY_COLORS.other;
              return (
                <motion.div
                  key={skill.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  whileHover={{ y: -6, scale: 1.04, transition: { duration: 0.2 } }}
                  className="group relative flex flex-col items-center gap-3 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl cursor-default overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-400 rounded-2xl`} />

                  {/* Icon */}
                  <span className="text-3xl relative z-10">{skill.icon || '⚙️'}</span>

                  {/* Name */}
                  <p className="text-white font-semibold text-sm text-center relative z-10 leading-tight">{skill.name}</p>

                  {/* Level bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${color}`}
                    />
                  </div>

                  {/* Level number on hover */}
                  <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors relative z-10">
                    {skill.level}%
                  </span>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${color} opacity-0 group-hover:opacity-70 transition-opacity`} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}

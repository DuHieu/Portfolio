import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Calendar } from 'lucide-react';

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  skills: string[];
  order: number;
}
const COLORS = [
  'from-[#00D9FF] to-[#0088CC]',
  'from-[#A855F7] to-[#7C3AED]',
  'from-[#00D9FF] to-[#A855F7]',
  'from-[#A855F7] to-[#00D9FF]',
];

const LOGOS = ['🚀', '🎨', '💡', '✨', '🌟', '⚡'];

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function ExperienceSection({ username }: { username: string }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/experiences/?user=${username}`)
      .then((res) => res.json())
      .then((data: Experience[]) => {
        if (Array.isArray(data)) setExperiences(data);
      })
      .catch(() => {});
  }, [username]);

  return (
    <section id="experience" className="relative py-32 md:py-40 px-4 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
              Experience Journey
            </span>
          </h2>
          <p className="text-xl text-white/60 tracking-wide">
            Floating through space stations of innovation
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00D9FF]/0 via-[#00D9FF]/50 to-[#A855F7]/0 hidden md:block" />

          <div className="space-y-32">
            {experiences.map((exp, index) => {
              const color = COLORS[index % COLORS.length];
              const logo = LOGOS[index % LOGOS.length];

              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative ${
                    index % 2 === 0 ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'
                  } md:w-1/2`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                    className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-r ${color} hidden md:block ${
                      index % 2 === 0 ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'
                    }`}
                  >
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${color} blur-md animate-pulse`} />
                  </motion.div>

                  <motion.div
                    whileHover={{
                      y: -10,
                      rotateY: index % 2 === 0 ? 5 : -5,
                      transition: { duration: 0.3 },
                    }}
                    className="relative group preserve-3d"
                  >
                    <div className={`relative backdrop-blur-xl bg-white/5 border rounded-3xl p-8 overflow-hidden transition-colors border-white/20`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                      <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-6">
                          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-3xl shadow-2xl`}>
                            {logo}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                              {exp.title}
                            </h3>
                            <div className="flex items-center gap-2 text-white/60">
                              <Building2 className="w-4 h-4" />
                              <span className="tracking-wide">{exp.company}</span>
                            </div>
                          </div>
                        </div>

                        {exp.description && (
                          <p className="text-white/60 mb-4 tracking-wide text-sm leading-relaxed">{exp.description}</p>
                        )}

                        <div className="flex items-center gap-2 text-white/50">
                          <Calendar className="w-4 h-4" />
                          <span className="tracking-wide">{exp.period}</span>
                        </div>
                      </div>

                      <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`} />
                    </div>

                    <div className="absolute inset-0 bg-black/20 rounded-3xl blur-2xl translate-y-4 -z-20" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
}

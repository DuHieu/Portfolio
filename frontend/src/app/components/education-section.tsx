import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import { EmptyState } from './empty-state';
interface Education {
  id: number;
  degree: string;
  school: string;
  period: string;
  description: string;
  order: number;
}

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const GRAD_COLORS = [
  'from-[#00D9FF] to-[#0088CC]',
  'from-[#A855F7] to-[#7C3AED]',
  'from-[#00D9FF] to-[#A855F7]',
];

export function EducationSection({ username }: { username: string }) {
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/education/?user=${username}`)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setEducation(data); })
      .catch(() => {});
  }, [username]);

  // Always show section header even if empty

  return (
    <section id="education" className="relative py-32 md:py-40 px-4 overflow-hidden">
      {/* Bg dots */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(168,85,247,0.4) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#A855F7] to-[#00D9FF] bg-clip-text text-transparent">
              Education Journey
            </span>
          </h2>
          <p className="text-xl text-white/60">My academic foundations</p>
        </motion.div>

        {education.length === 0 ? (
          <EmptyState 
            title="Academic Records Blank" 
            message="Your educational voyage is just beginning. Port your academic achievements from the dashboard."
            icon="puzzle"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu, index) => {
              const color = GRAD_COLORS[index % GRAD_COLORS.length];
              return (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden cursor-default"
                >
                  {/* Hover glow overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`} />

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-2xl`}>
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>

                    {/* Degree */}
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{edu.degree}</h3>

                    {/* School */}
                    <p className={`font-semibold mb-4 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                      {edu.school}
                    </p>

                    {/* Description */}
                    {edu.description && (
                      <p className="text-white/55 text-sm leading-relaxed mb-5">{edu.description}</p>
                    )}

                    {/* Period */}
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{edu.period}</span>
                    </div>
                  </div>

                  {/* Bottom glow */}
                  <div className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r ${color} opacity-30 group-hover:opacity-80 transition-opacity`} />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

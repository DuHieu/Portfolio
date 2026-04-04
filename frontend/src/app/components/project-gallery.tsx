import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Pencil } from 'lucide-react';
import { useAuth } from '../context/auth-context';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  gradient: string;
  size: string;
  url: string | null;
  github_url: string | null;
  developer_name?: string;
}
// ... (fallbackProjects remains same, skip for brevity in target)

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function ProjectGallery({ username }: { username: string }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const isOwner = user?.email?.split('@')[0] === username;

  useEffect(() => {
    fetch(`${API_BASE}/api/projects/?user=${username}`)
      .then((res) => res.json())
      .then((data: Project[]) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {
        // keep empty if fetch fails
      });
  }, [username]);

  return (
    <section id="projects" className="relative py-32 md:py-40 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent">
              Featured Projects
            </span>
          </h2>
          <p className="text-xl text-white/60 tracking-wide">
            A collection of antigravity creations
          </p>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${
                project.size === 'large' ? 'md:col-span-2' : 'md:col-span-1'
              }`}
            >
              <motion.div
                whileHover={{
                  y: -20,
                  rotateX: 5,
                  transition: { duration: 0.3 },
                }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.3,
                }}
                className="relative group preserve-3d h-full"
              >
                {/* Glass card */}
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 overflow-hidden h-full flex flex-col">
                  {/* Gradient background on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />

                  {/* Edit Button for Owners */}
                  {isOwner && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="absolute top-4 right-4 z-20 p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/50 hover:text-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Sửa dự án: ${project.title}`);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </motion.button>
                  )}

                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">
                      {project.title}
                    </h3>
                    <p className="text-white/60 mb-6 tracking-wide flex-1">
                      {project.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-3 py-1 text-sm backdrop-blur-xl bg-white/10 border border-white/20 rounded-full text-white/80 tracking-wide"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-4">
                      {project.url && (
                        <motion.a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full text-white/80 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm tracking-wide">View</span>
                        </motion.a>
                      )}
                      {project.github_url && (
                        <motion.a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-2 px-4 py-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full text-white/80 hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                          <span className="text-sm tracking-wide">Code</span>
                        </motion.a>
                      )}
                    </div>
                  </div>

                  {/* Decorative corner gradient */}
                  <div
                    className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${project.gradient} rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
                  />
                  {/* Border glow on hover */}
                  <div
                    className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 -z-10`}
                  />
                </div>

                {/* Shadow */}
                <div className="absolute inset-0 bg-black/20 rounded-3xl blur-2xl translate-y-6 -z-20" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

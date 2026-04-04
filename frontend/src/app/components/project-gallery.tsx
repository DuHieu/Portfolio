import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Pencil } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useEdit } from '../context/edit-context';
import { EditModal } from './edit-modal';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  demo_link: string;
  github_link: string;
  tags: string[];
}

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function ProjectGallery({ username }: { username: string }) {
  const { user } = useAuth();
  const { isEditMode, pendingChanges } = useEdit();
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isOwner = user?.email?.split('@')[0] === username;

  useEffect(() => {
    fetch(`${API_BASE}/api/projects/?user=${username}`)
      .then((res) => res.json())
      .then((data: Project[]) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(() => {});
  }, [username]);

  return (
    <section id="projects" className="relative py-32 md:py-40 px-4">
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-[#00D9FF] to-[#A855F7] bg-clip-text text-transparent italic">
              Galactic Projects
            </span>
          </h2>
          <p className="text-xl text-white/60 tracking-wide">
            Stations built in the orbit of innovation
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {projects.map((project, index) => {
            const displayProject = {
              ...project,
              ...(pendingChanges[`project:${project.id}`] || {})
            };

            const isModified = !!pendingChanges[`project:${project.id}`];

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -15, transition: { duration: 0.3 } }}
                className="group relative perspective-1000"
              >
                <div className={`relative backdrop-blur-3xl bg-white/5 border rounded-[2rem] overflow-hidden transition-all duration-500 scale-95 group-hover:scale-100 ${
                  isModified ? 'border-[#00D9FF]/50 shadow-[0_0_30px_rgba(0,217,255,0.2)]' : 'border-white/10 shadow-2xl shadow-black/50'
                }`}>
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={displayProject.image || `https://picsum.photos/seed/${project.id}/800/450`}
                      alt={displayProject.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
                    
                    <AnimatePresence>
                      {isModified && (
                        <motion.div 
                          initial={{ x: 100 }}
                          animate={{ x: 0 }}
                          className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#00D9FF] text-black text-[10px] font-black uppercase tracking-tighter rounded-full"
                        >
                          Unsaved Draft
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isOwner && isEditMode && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="absolute top-4 right-4 z-20 p-3 bg-gradient-to-br from-[#00D9FF] to-[#A855F7] rounded-full text-white shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(displayProject);
                        }}
                      >
                        <Pencil className="w-5 h-5" />
                      </motion.button>
                    )}
                  </div>

                  <div className="p-8">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {displayProject.tags.map((tag: string, ti: number) => (
                        <span
                          key={ti}
                          className="px-3 py-1 text-[10px] tracking-widest uppercase bg-white/5 border border-white/10 rounded-full text-white/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl font-bold mb-3 tracking-tight text-white group-hover:text-[#00D9FF] transition-colors">
                      {displayProject.title}
                    </h3>

                    <p className="text-white/60 text-sm mb-8 leading-relaxed line-clamp-3">
                      {displayProject.description}
                    </p>

                    <div className="flex items-center gap-6">
                      {displayProject.demo_link && (
                        <motion.a
                          href={displayProject.demo_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-sm font-bold text-[#00D9FF] hover:text-white transition-colors"
                        >
                          Live Demo <ExternalLink className="w-4 h-4" />
                        </motion.a>
                      )}
                      {displayProject.github_link && (
                        <motion.a
                          href={displayProject.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ x: 5 }}
                          className="flex items-center gap-2 text-sm font-bold text-white/50 hover:text-white transition-colors"
                        >
                          Source <GithubIcon className="w-4 h-4" />
                        </motion.a>
                      )}
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/0 to-[#A855F7]/0 group-hover:from-[#00D9FF]/5 group-hover:to-[#A855F7]/5 transition-all duration-500 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {editingProject && (
        <EditModal 
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title="Edit Project"
          type="project"
          id={editingProject.id.toString()}
          initialData={{
            title: editingProject.title,
            description: editingProject.description,
            image: editingProject.image,
            demo_link: editingProject.demo_link,
            github_link: editingProject.github_link,
          }}
        />
      )}
    </section>
  );
}

import { motion } from 'framer-motion';
import { Home, Briefcase, FolderOpen, Mail, LogOut, User as UserIcon, Building2, Share2, Pencil, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/auth-context';
import { useEdit } from '../context/edit-context';
import { LoginButton } from './login-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const navItems = [
  { name: 'Home', icon: Home, href: '#home' },
  { name: 'Experience', icon: Briefcase, href: '#experience' },
  { name: 'Projects', icon: FolderOpen, href: '#projects' },
  { name: 'Contact', icon: Mail, href: '#contact' },
];

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export function FloatingNav({ showDashboard, setShowDashboard }: { showDashboard: boolean; setShowDashboard: (v: boolean) => void }) {
  const { user, signOut } = useAuth();
  const { isEditMode, setEditMode } = useEdit();

  const handleShare = () => {
    if (!user) return;
    const prefix = user.email?.split('@')[0];
    const shareUrl = `${window.location.origin}${window.location.pathname}?user=${prefix}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Đã copy link cá nhân vào bộ nhớ đệm!'))
      .catch(err => console.error('Share error:', err));
  };

  const isOwner = user?.email?.split('@')[0] === new URLSearchParams(window.location.search).get('user') || 
                  (user?.email?.split('@')[0] === 'dudev' && !new URLSearchParams(window.location.search).get('user'));

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-8 py-3 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-6">
            {!showDashboard && navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { duration: 0.2 }
                }}
                className="group relative flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
              >
                <item.icon className="w-5 h-5" />
                <span className="hidden md:inline-block tracking-tight text-sm font-medium">{item.name}</span>
                
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] rounded-full opacity-0 group-hover:opacity-20 blur-xl"
                  initial={false}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
            {showDashboard && (
              <span className="text-[#00D9FF] font-bold text-sm flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Personal Dashboard
              </span>
            )}
          </div>

          <div className="h-6 w-px bg-white/20 mx-2" />

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                {isOwner && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDashboard(!showDashboard)}
                    className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-xs font-bold transition-all"
                  >
                    {showDashboard ? (
                      <>
                        <ArrowLeft className="w-3 h-3 text-[#00D9FF]" />
                        Back to Portfolio
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3 text-[#00D9FF]" />
                        Dashboard
                      </>
                    )}
                  </motion.button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      className="flex items-center gap-2 outline-none"
                    >
                      <Avatar className="w-8 h-8 border border-white/20 shadow-lg shadow-[#00D9FF]/20">
                        <AvatarImage src={user.user_metadata.avatar_url} />
                        <AvatarFallback className="bg-white/10">
                          <UserIcon className="w-4 h-4 text-white/70" />
                        </AvatarFallback>
                      </Avatar>
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#0A0A0A]/95 border-white/10 text-white backdrop-blur-xl rounded-2xl">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      className="focus:bg-white/10 cursor-pointer"
                      onClick={() => {
                        setShowDashboard(false);
                        const prefix = user.email?.split('@')[0];
                        window.location.href = `${window.location.origin}${window.location.pathname}?user=${prefix}`;
                      }}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Portfolio</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="focus:bg-white/10 cursor-pointer"
                      onClick={() => setShowDashboard(true)}
                    >
                      <Briefcase className="mr-2 h-4 w-4" />
                      <span>Dashboard View</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      className="focus:bg-white/10 cursor-pointer"
                      onClick={() => setEditMode(!isEditMode)}
                    >
                      <Pencil className={`mr-2 h-4 w-4 ${isEditMode ? 'text-[#00D9FF]' : ''}`} />
                      <span className={isEditMode ? "text-[#00D9FF] font-bold" : ""}>
                        {isEditMode ? "Edit Mode: ON" : "Enable Edit Mode"}
                      </span>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      className="focus:bg-white/10 cursor-pointer"
                      onClick={() => window.open(`${API_BASE}/admin/`, '_blank')}
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      <span>Dashboard (Django)</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      className="focus:bg-white/10 cursor-pointer"
                      onClick={handleShare}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      <span>Share Profile Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem 
                      onClick={() => signOut()}
                      className="focus:bg-red-500/20 text-red-400 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <LoginButton />
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-r from-[#00D9FF]/10 to-[#A855F7]/10 rounded-full blur-2xl -z-10" />
    </motion.nav>
  );
}

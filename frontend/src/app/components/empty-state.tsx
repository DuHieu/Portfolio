import { motion } from 'framer-motion';
import { Ghost, Box, Puzzle, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: 'ghost' | 'box' | 'puzzle' | 'sparkles';
  action?: ReactNode;
}

const ICONS = {
  ghost: Ghost,
  box: Box,
  puzzle: Puzzle,
  sparkles: Sparkles,
};

export function EmptyState({ title, message, icon = 'box', action }: EmptyStateProps) {
  const IconComponent = ICONS[icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-20 px-6 flex flex-col items-center justify-center text-center relative"
    >
      {/* Background Frame */}
      <div className="absolute inset-0 border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02] backdrop-blur-sm -z-10" />
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00D9FF]/5 blur-3xl rounded-full pointer-events-none" />
      
      {/* Icon with orbital animation */}
      <div className="relative mb-8">
        <motion.div
          animate={{ 
            rotate: 360,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border border-white/5 rounded-full"
        />
        <motion.div
          animate={{ 
            rotate: -360,
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-8 border border-white/5 rounded-full border-dashed"
        />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl">
          <IconComponent className="w-10 h-10 text-white/20" />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-white/5 rounded-2xl blur-lg"
          />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white/80 mb-3 tracking-tight">{title}</h3>
      <p className="max-w-md text-white/40 text-sm leading-relaxed mb-8 italic">
        {message}
      </p>

      {action && (
        <div className="relative z-10">
          {action}
        </div>
      )}
    </motion.div>
  );
}

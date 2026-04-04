import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, Send } from 'lucide-react';
import { useEdit } from '../context/edit-context';

export function PublishBar() {
  const { 
    isEditMode, 
    pendingChanges, 
    publishAll, 
    discardAll,
    isPublishing 
  } = useEdit();

  const changeCount = Object.keys(pendingChanges).length;

  if (!isEditMode || changeCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4"
      >
        <div className="backdrop-blur-2xl bg-[#0A0A0A]/80 border border-white/20 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-10 h-10 rounded-2xl bg-[#00D9FF]/20 flex items-center justify-center text-[#00D9FF]">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Draft Saved</p>
              <p className="text-xs text-white/50">{changeCount} items modified in draft</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={discardAll}
              disabled={isPublishing}
              className="p-3 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
              title="Discard all changes"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            
            <button
              onClick={publishAll}
              disabled={isPublishing}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00D9FF] to-[#A855F7] text-white font-bold rounded-2xl shadow-[0_10px_20px_rgba(0,217,255,0.3)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Publish Changes
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
